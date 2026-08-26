import json
import structlog
from redis import Redis
from sqlalchemy import create_engine, text
from shared.queue import RedisQueue
from shared.telemetry import get_tracer, init_telemetry, setup_logging
from shared.utils import IdempotencyMiddleware, NonRetryableError, StateManager
from shared.worker import Worker

from app.config import settings

SERVICE_NAME = "social-post-worker"
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
state_manager = StateManager(redis_client)
idempotency = IdempotencyMiddleware(redis_client)

# Sync database engine for worker execution
sync_db_url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://", 1)
db_engine = create_engine(sync_db_url, pool_pre_ping=True)


def _update_post_status(post_id: str, status: str) -> None:
    try:
        with db_engine.begin() as conn:
            conn.execute(
                text(
                    "UPDATE social_posts SET status = :status, updated_at = now() WHERE id = :id"
                ),
                {"status": status, "id": post_id},
            )
    except Exception as e:
        logger.error(
            "Failed to update post status in PostgreSQL",
            error=str(e),
            post_id=post_id,
        )


def handle_create_post(payload: dict) -> None:
    job_id = payload.get("job_id")
    idem_key = payload.get("idempotency_key") or job_id
    page_id = payload.get("page_id")
    message = payload.get("message")
    provider = payload.get("provider", "facebook")
    post_id = payload.get("post_id") or f"post_{job_id[:8]}"

    last_step = state_manager.get_last_step(job_id)

    # Idempotency guard on first execution
    if not last_step:
        if not idempotency.check_and_set(idem_key):
            logger.info(
                "Duplicate post creation detected; skipping",
                idempotency_key=idem_key,
                job_id=job_id,
            )
            return
        state_manager.save_step(job_id, "started")
        last_step = "started"
        redis_client.set(f"job_state:{job_id}", "processing", ex=86400)

    # Step 1: Validate payload and store record
    if last_step == "started":
        if not page_id or not message:
            redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
            _update_post_status(post_id, "failed")
            raise NonRetryableError(
                "Invalid payload: page_id and message are required"
            )

        # Update post record status to processing in PostgreSQL
        _update_post_status(post_id, "processing")
        state_manager.save_step(job_id, "db_stored")
        last_step = "db_stored"

    # Step 2: Delegate to social-publish-service stream
    if last_step == "db_stored":
        logger.info(
            "Enqueueing publish job to stream",
            provider=provider,
            page_id=page_id,
            job_id=job_id,
        )
        publish_queue = RedisQueue(
            redis_client, stream_name="jobs:social-publish"
        )
        publish_queue.enqueue(
            {
                "type": "publish_post",
                "page_id": page_id,
                "provider": provider,
                "message": message,
                "media_url": payload.get("media_url"),
                "post_db_id": post_id,
                "idempotency_key": f"pub_{idem_key}",
                "job_id": job_id,
            }
        )
        state_manager.save_step(job_id, "published_event")
        logger.info("Successfully handed off to publish worker", job_id=job_id)


if __name__ == "__main__":
    worker = Worker(
        redis_client=redis_client,
        stream_name="jobs:social-post",
        consumer_name="social-post-worker-1",
    )
    worker.register_handler("create_post", handle_create_post)
    worker.run()
