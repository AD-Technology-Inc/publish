import httpx
import structlog
from redis import Redis
from shared.providers import get_provider
from shared.telemetry import get_tracer, init_telemetry, setup_logging
from shared.utils import (
    IdempotencyMiddleware,
    NonRetryableError,
    RateLimiter,
    RateLimitExceeded,
)
from shared.worker import Worker
from sqlalchemy import create_engine, text

from app.config import settings

SERVICE_NAME = "social-account-worker"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)
tracer = get_tracer()

redis_client = Redis(
    host=settings.redis_host,
    port=settings.redis_port,
    db=0,
    socket_timeout=15.0,
    socket_connect_timeout=5.0,
    socket_keepalive=True,
    health_check_interval=30,
)
idempotency = IdempotencyMiddleware(redis_client)
rate_limiter = RateLimiter(redis_client, max_requests=100, window_seconds=60)

# Sync database engine for worker execution
sync_db_url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://", 1)
db_engine = create_engine(sync_db_url, pool_pre_ping=True)


def _update_account_status(account_id: str, status: str) -> None:
    try:
        with db_engine.begin() as conn:
            conn.execute(
                text(
                    "UPDATE social_accounts SET status = :status, updated_at = now() WHERE id = :id"
                ),
                {"status": status, "id": account_id},
            )
    except Exception as e:
        logger.error(
            "Failed to update account status in PostgreSQL",
            error=str(e),
            account_id=account_id,
        )


def handle_account_link(payload: dict) -> None:
    """Validate that the stored access token is usable for the given provider/page."""
    account_id = str(payload.get("account_id") or "")
    provider = str(payload.get("provider") or "").lower()
    page_id = str(payload.get("page_id") or "")
    idem_key = str(payload.get("idempotency_key") or f"link:{account_id}")

    if not idempotency.check_and_set(idem_key):
        logger.info("Skipping duplicate account link", idempotency_key=idem_key)
        return

    if not rate_limiter.is_allowed(f"api:{provider}"):
        raise RateLimitExceeded(f"Rate limit exceeded for {provider}")

    logger.info(
        "Validating account connection",
        account_id=account_id,
        provider=provider,
        page_id=page_id,
    )

    # Fetch stored token
    try:
        resp = httpx.get(
            f"http://social-account-service:8000/accounts/token/{provider}/{page_id}",
            timeout=5.0,
        )
        if resp.status_code == 404:
            raise NonRetryableError(f"No token stored for {provider}/{page_id}")
        resp.raise_for_status()
        token = resp.json().get("access_token", "")
    except httpx.RequestError as e:
        raise Exception(f"Could not reach social-account-service: {e}") from e

    # Validate token with dedicated provider service
    provider_service = get_provider(provider)
    if provider_service and token:
        result = provider_service.validate_token(token, page_id)
        if not result.valid:
            _update_account_status(account_id, "expired")
            raise NonRetryableError(
                result.error_message or f"Invalid {provider} token"
            )
        logger.info(
            f"{provider.capitalize()} token validated successfully",
            page_id=page_id,
            account_name=result.account_name,
        )

    # Mark account as validated/connected in PostgreSQL
    _update_account_status(account_id, "connected")
    logger.info("Account validated successfully in PostgreSQL", account_id=account_id)


if __name__ == "__main__":
    worker = Worker(
        redis_client=redis_client,
        stream_name="jobs:social-account",
        consumer_name="social-account-worker-1",
    )
    worker.register_handler("account_link", handle_account_link)
    worker.run()
