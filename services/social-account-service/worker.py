import json
from typing import Optional

import httpx
import structlog
from redis import Redis
from shared.telemetry import get_tracer, init_telemetry, setup_logging
from shared.utils import (
    IdempotencyMiddleware,
    NonRetryableError,
    RateLimiter,
    RateLimitExceeded,
)
from shared.worker import Worker

SERVICE_NAME = "social-account-worker"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)
tracer = get_tracer()

redis_client = Redis(host="redis", port=6379, db=0)
idempotency = IdempotencyMiddleware(redis_client)
rate_limiter = RateLimiter(redis_client, max_requests=100, window_seconds=60)


def _update_account_status(account_id: str, status: str) -> None:
    raw = redis_client.get(f"accounts:{account_id}")
    if raw:
        try:
            account = json.loads(raw)
            account["status"] = status
            redis_client.set(f"accounts:{account_id}", json.dumps(account))
        except Exception as e:
            logger.error("Failed to update account status in Redis", error=str(e), account_id=account_id)


def handle_account_link(payload: dict) -> None:
    """Validate that the stored access token is usable for the given provider/page."""
    account_id = payload.get("account_id")
    provider = (payload.get("provider") or "").lower()
    page_id = payload.get("page_id")
    idem_key = payload.get("idempotency_key") or f"link:{account_id}"

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
        raise Exception(f"Could not reach social-account-service: {e}")

    # Validate with Graph API for Facebook
    if provider == "facebook" and token:
        try:
            graph_resp = httpx.get(
                f"https://graph.facebook.com/v19.0/me?access_token={token}",
                timeout=5.0,
            )
            if graph_resp.status_code in (400, 401, 403):
                _update_account_status(account_id, "expired")
                raise NonRetryableError(
                    f"Invalid Facebook token: {graph_resp.text}"
                )
            if graph_resp.status_code == 429:
                raise RateLimitExceeded(f"Facebook Graph API 429: {graph_resp.text}")
            graph_resp.raise_for_status()
            logger.info("Facebook token validated successfully", page_id=page_id)
        except httpx.RequestError as e:
            raise Exception(f"Network error validating Facebook token: {e}")

    # Mark account as validated/connected
    _update_account_status(account_id, "connected")
    logger.info("Account validated successfully", account_id=account_id)


if __name__ == "__main__":
    worker = Worker(
        redis_client=redis_client,
        stream_name="jobs:social-account",
        consumer_name="social-account-worker-1",
    )
    worker.register_handler("account_link", handle_account_link)
    worker.run()
