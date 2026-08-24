import uuid

import structlog
from fastapi import FastAPI
from pydantic import BaseModel
from redis import Redis
from shared.queue import RedisQueue
from shared.telemetry import init_telemetry, setup_logging

SERVICE_NAME = "social-publish-service"
setup_logging(SERVICE_NAME)

app = FastAPI(title="Social Publish Service")
init_telemetry(SERVICE_NAME, app=app)
logger = structlog.get_logger(__name__)

redis_client = Redis(host="redis", port=6379, db=0)
queue = RedisQueue(redis_client, stream_name="jobs:social-publish")


class PublishRequest(BaseModel):
    page_id: str
    provider: str  # "facebook" | "instagram" | "linkedin" | "threads"
    message: str
    media_url: str | None = None
    post_db_id: str | None = None
    idempotency_key: str | None = None


@app.post("/publish")
def publish_post(req: PublishRequest):
    idem_key = req.idempotency_key or str(uuid.uuid4())
    job_id = idem_key

    stream_msg_id = queue.enqueue(
        {
            "type": "publish_post",
            "page_id": req.page_id,
            "provider": req.provider,
            "message": req.message,
            "media_url": req.media_url,
            "post_db_id": req.post_db_id,
            "idempotency_key": idem_key,
            "job_id": job_id,
        }
    )
    redis_client.set(f"job_state:{job_id}", "pending", ex=86400)
    logger.info(
        "Publish job enqueued",
        job_id=job_id,
        stream_msg_id=stream_msg_id,
        provider=req.provider,
        page_id=req.page_id,
    )
    return {"status": "enqueued", "job_id": job_id}


@app.get("/health")
def health():
    return {"status": "ok"}
