import time
import structlog
from redis import Redis

from shared.worker import Worker
from shared.utils import IdempotencyMiddleware
from shared.telemetry import setup_logging, init_telemetry, get_tracer

# Manual Initialization
SERVICE_NAME = "identity-worker"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)
tracer = get_tracer()

redis_client = Redis(host="redis", port=6379, db=0)
idempotency = IdempotencyMiddleware(redis_client)

def handle_create_user(payload: dict):
    """
    Handler for user creation. 
    Execution is wrapped in a span by the shared Worker class.
    """
    user = payload.get("user")
    idem_key = payload.get("idempotency_key")
    
    if not idempotency.check_and_set(idem_key):
        logger.info("Skipping duplicate user creation", idempotency_key=idem_key)
        return

    logger.info("Creating user", user=user)
    # Simulating DB write
    time.sleep(0.1)
    logger.info("User created successfully in DB")

if __name__ == "__main__":
    worker = Worker(
        redis_client=redis_client,
        stream_name="jobs:identity",
        consumer_name="identity-worker-1"
    )
    worker.register_handler("create_user", handle_create_user)
    
    logger.info("Identity Worker started")
    worker.run()
