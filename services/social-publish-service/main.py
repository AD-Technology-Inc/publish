import uuid

import structlog
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from redis import Redis
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
    provider: str  # "facebook" | "instagram" | "linkedin" | "threads"
    message: str
    media_url: str | None = None
    # Reference back to the social-post-service record
    post_db_id: str | None = None
    # Client-supplied idempotency key per README contract.
    # If omitted, the service generates a UUID fallback — but clients
    # are strongly encouraged to supply their own stable key to guarantee
    # exactly-once delivery across retries.
    idempotency_key: str | None = None


# /api/v1/
@app.post("/publish")
def publish_post(req: PublishRequest):
    # Honour client-supplied key or generate a server-side fallback.
    idem_key = req.idempotency_key or str(uuid.uuid4())

    # The stream message_id (returned by XADD) is the canonical job_id used
    # by workers and the jobs status route.  We pass idem_key separately so
    # the worker can claim it via SET NX before executing side-effects.
    job_id = queue.enqueue(
        {
            "type": "publish_post",
            "page_id": req.page_id,
            "provider": req.provider,
            "message": req.message,
            "media_url": req.media_url,
            "post_db_id": req.post_db_id,
            "idempotency_key": idem_key,
            # Pass a stable job_id for checkpoint keys.  We use idem_key so
            # that retried publishes with the same key always map to the same
            # checkpoint namespace.
            "job_id": idem_key,
        }
    )
    redis_client.set(f"job_state:{job_id}", "pending", ex=86400)
    logger.info(
        "Publish job enqueued",
        job_id=job_id,
        provider=req.provider,
        page_id=req.page_id,
    )
    return {"status": "enqueued", "job_id": job_id}


@app.get("/health")
def health():
    return {"status": "ok"}
