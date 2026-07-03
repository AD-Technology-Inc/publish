from fastapi import FastAPI, Request, Response
from pydantic import BaseModel
from typing import Optional
import structlog
import uuid
import time
from shared.queue import RedisQueue
from shared.telemetry import setup_logging, init_telemetry

SERVICE_NAME = "social-publish-service"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)

app = FastAPI(title="Social Publish Service")

redis_client = Redis(host="redis", port=6379, db=0)
queue = RedisQueue(redis_client, stream_name="jobs:social-publish")


class PublishRequest(BaseModel):
    page_id: str
    provider: str           # "facebook" | "instagram" | etc
    message: str
    media_url: Optional[str] = None
    post_db_id: Optional[str] = None  # reference back to social-post-service record


@app.post("/publish")
def publish_post(req: PublishRequest):
    idem_key = str(uuid.uuid4())
    job_id = queue.enqueue({
        "type": "publish_post",
        "page_id": req.page_id,
        "provider": req.provider,
        "message": req.message,
        "media_url": req.media_url,
        "post_db_id": req.post_db_id,
        "idempotency_key": idem_key,
        "job_id": idem_key,
    })
    redis_client.set(f"job_state:{job_id}", "pending", ex=86400)
    return {"status": "enqueued", "job_id": job_id}


@app.get("/health")
def health():
    return {"status": "ok"}
