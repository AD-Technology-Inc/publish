import os

import httpx
import structlog
from redis import Redis
from shared.providers import get_provider
from shared.telemetry import get_tracer, init_telemetry, setup_logging
from shared.utils import (
    IdempotencyMiddleware,
    NonRetryableError,
    StateManager,
)
from shared.worker import Worker
from sqlalchemy import create_engine, text

from app.config import settings

SERVICE_NAME = "social-publish-worker"
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
state_manager = StateManager(redis_client)

sync_db_url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://", 1)
db_engine = create_engine(sync_db_url, pool_pre_ping=True)


def _update_publish_status(
    job_id: str,
    status: str,
    platform_post_id: str | None = None,
    error_message: str | None = None,
) -> None:
    try:
        with db_engine.begin() as conn:
            conn.execute(
                text(
                    "UPDATE social_publishes SET status = :status, platform_post_id = COALESCE(:pid, platform_post_id), error_message = COALESCE(:err, error_message), updated_at = now() WHERE job_id = :job_id"
                ),
                {
                    "status": status,
                    "pid": platform_post_id,
                    "err": error_message,
                    "job_id": job_id,
                },
            )
    except Exception as e:
        logger.error(
            "Failed to update publish status in PostgreSQL",
            error=str(e),
            job_id=job_id,
        )


def handle_publish_post(payload: dict) -> None:
    job_id = str(payload.get("job_id") or payload.get("idempotency_key") or "")
    idem_key = str(payload.get("idempotency_key") or job_id)
    page_id = str(payload.get("page_id") or "")
    provider_name = str(payload.get("provider") or "facebook").lower()
    message = str(payload.get("message") or "")
    media_url = payload.get("media_url")
    if media_url is not None:
        media_url = str(media_url)

    last_step = state_manager.get_last_step(job_id)

    # Enforce atomic idempotency guard on initial run
    if not last_step:
        if not idempotency.check_and_set(idem_key):
            logger.info(
                "Duplicate publish execution detected by idempotency guard; skipping",
                idempotency_key=idem_key,
                job_id=job_id,
            )
            return
        state_manager.save_step(job_id, "started")
        last_step = "started"
        redis_client.set(f"job_state:{job_id}", "processing", ex=86400)
        _update_publish_status(job_id, "processing")

    # Step 1: Validate payload & retrieve access token
    if last_step == "started":
        if not page_id or not message:
            redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
            _update_publish_status(
                job_id,
                "failed",
                error_message="Invalid payload: page_id and message are required",
            )
            raise NonRetryableError(
                "Invalid payload: page_id and message are required"
            )

        token: str | None = None
        # Retrieve token from social-account-service
        try:
            token_resp = httpx.get(
                f"http://social-account-service:8000/accounts/token/{provider_name}/{page_id}",
                timeout=5.0,
            )
            if token_resp.status_code == 200:
                token = token_resp.json().get("access_token")
        except Exception as e:
            logger.warning(
                "Could not query social-account-service for token", error=str(e)
            )

        # Fallback to environment variable if configured
        if not token:
            env_var_name = f"{provider_name.upper()}_PAGE_ACCESS_TOKEN"
            token = os.getenv(env_var_name) or os.getenv("SOCIAL_ACCESS_TOKEN")

        if not token:
            redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
            _update_publish_status(
                job_id,
                "failed",
                error_message=f"No valid access token available for {provider_name} page {page_id}",
            )
            raise NonRetryableError(
                f"No valid access token available for {provider_name} page {page_id}"
            )

        # Durable checkpoint
        redis_client.set(f"job_token:{job_id}", token, ex=3600)
        state_manager.save_step(job_id, "token_retrieved")
        last_step = "token_retrieved"

    # Step 2: Publish via platform provider service
    if last_step == "token_retrieved":
        token_raw = redis_client.get(f"job_token:{job_id}")
        token = token_raw.decode("utf-8") if token_raw else ""

        provider = get_provider(provider_name)
        if not provider:
            redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
            _update_publish_status(
                job_id,
                "failed",
                error_message=f"Unsupported provider: {provider_name}",
            )
            raise NonRetryableError(f"Unsupported provider: {provider_name}")

        result = provider.publish(
            page_id=page_id,
            message=message,
            token=token,
            job_id=job_id,
            media_url=media_url,
        )

        # Checkpoint completion & state
        state_manager.save_step(job_id, "completed")
        redis_client.set(f"job_state:{job_id}", "completed", ex=86400)
        redis_client.set(
            f"job_result:{job_id}", str(result.platform_post_id), ex=86400
        )
        _update_publish_status(
            job_id, "completed", platform_post_id=str(result.platform_post_id)
        )
        logger.info(
            "Published successfully to platform",
            provider=provider_name,
            post_id=result.platform_post_id,
            job_id=job_id,
        )


if __name__ == "__main__":
    worker = Worker(
        redis_client=redis_client,
        stream_name="jobs:social-publish",
        consumer_name="social-publish-worker-1",
    )
    worker.register_handler("publish_post", handle_publish_post)
    worker.run()
