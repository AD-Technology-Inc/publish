import httpx
import structlog
from redis import Redis
from shared.worker import Worker
from shared.utils import IdempotencyMiddleware, NonRetryableError, RateLimiter, RateLimitExceeded
from shared.telemetry import setup_logging, init_telemetry, get_tracer

SERVICE_NAME = "social-account-worker"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)
tracer = get_tracer()

redis_client = Redis(host="redis", port=6379, db=0)
idempotency = IdempotencyMiddleware(redis_client)
rate_limiter = RateLimiter(redis_client, max_requests=100, window_seconds=60)


def handle_account_link(payload: dict):
    """Validate that the stored access token is usable for the given provider/page."""
    account_id = payload.get("account_id")
    provider = payload.get("provider")
    page_id = payload.get("page_id")
    idem_key = payload.get("idempotency_key")

    if not idempotency.check_and_set(idem_key):
        logger.info(f"Skipping duplicate account link: {idem_key}")
        return

    if not rate_limiter.is_allowed(f"api:{provider}"):
        raise RateLimitExceeded(f"Rate limit exceeded for {provider}")

    logger.info(f"Validating account {account_id} for provider {provider}, page {page_id}")

    # Fetch stored token from social-account-service
    try:
        resp = httpx.get(
            f"http://social-account-service:3001/accounts/token/{provider}/{page_id}",
            timeout=5.0,
        )
        if resp.status_code == 404:
            raise NonRetryableError(f"No token stored for {provider}/{page_id}")
        resp.raise_for_status()
        token = resp.json().get("access_token", "")
    except httpx.RequestError as e:
        raise Exception(f"Could not reach social-account-service: {e}")

    # Validate with Facebook Graph API if provider is facebook and token is real
    if provider == "facebook":
        if token == "mocked_token" or not token:
            logger.info("[MOCK] Skipping real FB token validation in dev mode")
        else:
            try:
                graph_resp = httpx.get(
                    f"https://graph.facebook.com/v19.0/me?access_token={token}",
                    timeout=5.0,
                )
                if graph_resp.status_code in (400, 401, 403):
                    # Mark account as expired
                    redis_client.hset(f"accounts:{account_id}", "status", "expired")
                    raise NonRetryableError(f"Invalid Facebook token: {graph_resp.text}")
                graph_resp.raise_for_status()
                logger.info(f"Facebook token valid for page {page_id}")
            except httpx.RequestError as e:
                raise Exception(f"Network error validating Facebook token: {e}")

    # Mark account as validated/connected in Redis
    redis_client.hset(f"accounts:{account_id}", "status", "connected")
    logger.info(f"Account {account_id} validated successfully")


if __name__ == "__main__":
    worker = Worker(
        redis_client=redis_client,
        stream_name="jobs:social-account",
        consumer_name="social-account-worker-1",
    )
    worker.register_handler("account_link", handle_account_link)
    worker.run()
