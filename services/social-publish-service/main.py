import uuid

import structlog
from fastapi import FastAPI
from pydantic import BaseModel
from shared.queue import RedisQueue
from shared.telemetry import init_telemetry, setup_logging

SERVICE_NAME = "social-publish-service"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)

app = FastAPI(title="Social Publish Service")

redis_client = Redis(host="redis", port=6379, db=0)
queue = RedisQueue(redis_client, stream_name="jobs:social-publish")


class PublishRequest(BaseModel):
    page_id: str
    provider: str  # "facebook" | "instagram" | etc
    message: str
    media_url: str | None = None
    post_db_id: str | None = (
        None  # reference back to social-post-service record
    )


# /api/v1/
@app.post("/publish")
def publish_post(req: PublishRequest):
    idem_key = str(uuid.uuid4())
    job_id = queue.enqueue(
        {
            "type": "publish_post",
            "account_id": req.account_id,
            "provider": req.provider,
            "message": req.message,
            "media_url": req.media_url,
            "post_db_id": req.post_db_id,
            "idempotency_key": idem_key,
            "job_id": idem_key,
        }
    )
    redis_client.set(f"job_state:{job_id}", "pending", ex=86400)
    return {"status": "enqueued", "job_id": job_id}


@app.get("/health")
def health():
    return {"status": "ok"}
