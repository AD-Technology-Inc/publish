import structlog
from redis import Redis
from shared.worker import Worker
from shared.utils import StateManager, IdempotencyMiddleware, NonRetryableError
from shared.telemetry import setup_logging, init_telemetry, get_tracer

SERVICE_NAME = "social-post-worker"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)
tracer = get_tracer()

redis_client = Redis(host="redis", port=6379, db=0)
state_manager = StateManager(redis_client)
idempotency = IdempotencyMiddleware(redis_client)

def handle_create_post(payload: dict):
    job_id = payload.get("job_id")
    idem_key = payload.get("idempotency_key")
    page_id = payload.get("page_id")
    message = payload.get("message")
    provider = payload.get("provider", "facebook")
    
    last_step = state_manager.get_last_step(job_id)

    # Check idempotency first, but only if we haven't started processing
    if not last_step:
        if not idempotency.check_and_set(idem_key):
            logger.info(f"Skipping duplicate post creation: {idem_key}")
            return
        state_manager.save_step(job_id, "started")
        last_step = "started"
        redis_client.set(f"job_state:{job_id}", "processing", ex=86400)

    try:
        # Update state to processing
        redis_client.set(f"job_state:{job_id}", "processing", ex=86400)

        # Step 1: Validate
        if last_step == "started":
            if not page_id or not message:
                redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
                raise NonRetryableError("Invalid payload: page_id and message are required")
            
            # Step 2: Store post in DB (simulated)
            post_db_id = f"post_{job_id[:8]}"
            logger.info(f"Successfully stored post in DB. DB Post ID: {post_db_id}")
            
            state_manager.save_step(job_id, "db_stored")
            last_step = "db_stored"
        else:
            post_db_id = f"post_{job_id[:8]}"

        # Step 3: Delegate to social-publish-service via event
        if last_step == "db_stored":
            logger.info(f"Enqueueing publish job for {provider} Page {page_id}")
            from shared.queue import RedisQueue
            publish_queue = RedisQueue(redis_client, stream_name="jobs:social-publish")
            publish_queue.enqueue({
                "type": "publish_post",
                "page_id": page_id,
                "provider": provider,
                "message": message,
                "media_url": payload.get("media_url"),
                "post_db_id": post_db_id,
                "idempotency_key": f"pub_{idem_key}",
                "job_id": job_id,
            })
            state_manager.save_step(job_id, "published_event")
        
        # State remains processing as publish service will complete it
    except Exception as e:
        raise e


if __name__ == "__main__":
    worker = Worker(
        redis_client=redis_client,
        stream_name="jobs:social-post",
        consumer_name="social-post-worker-1"
    )
    worker.register_handler("create_post", handle_create_post)
    worker.run()
