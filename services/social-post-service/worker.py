import json
import structlog
from redis import Redis
from shared.queue import RedisQueue
from shared.telemetry import get_tracer, init_telemetry, setup_logging
from shared.utils import IdempotencyMiddleware, NonRetryableError, StateManager
from shared.worker import Worker

SERVICE_NAME = "social-post-worker"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)
tracer = get_tracer()

redis_client = Redis(
    host="redis",
    port=6379,
    db=0,
    socket_timeout=15.0,
    socket_connect_timeout=5.0,
    socket_keepalive=True,
    health_check_interval=30,
)
state_manager = StateManager(redis_client)
idempotency = IdempotencyMiddleware(redis_client)


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
            logger.info("Duplicate post creation detected; skipping", idempotency_key=idem_key, job_id=job_id)
            return
        state_manager.save_step(job_id, "started")
        last_step = "started"
        redis_client.set(f"job_state:{job_id}", "processing", ex=86400)

    # Step 1: Validate payload and store record
    if last_step == "started":
        if not page_id or not message:
            redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
            raise NonRetryableError("Invalid payload: page_id and message are required")

        # Update post record status to processing
        post_raw = redis_client.get(f"posts:{post_id}")
        if post_raw:
            try:
                pdata = json.loads(post_raw)
                pdata["status"] = "processing"
                redis_client.set(f"posts:{post_id}", json.dumps(pdata), ex=86400 * 7)
            except Exception:
                pass

        state_manager.save_step(job_id, "db_stored")
        last_step = "db_stored"

    # Step 2: Delegate to social-publish-service stream
    if last_step == "db_stored":
        logger.info("Enqueueing publish job to stream", provider=provider, page_id=page_id, job_id=job_id)
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
