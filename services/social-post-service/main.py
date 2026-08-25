import json
import uuid
from datetime import UTC, datetime

import structlog
from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel
from redis import Redis
from shared.queue import RedisQueue
from shared.telemetry import init_telemetry, setup_logging

SERVICE_NAME = "social-post-service"
setup_logging(SERVICE_NAME)

app = FastAPI(title="Social Post Service")
init_telemetry(SERVICE_NAME, app=app)
logger = structlog.get_logger(__name__)

redis_client = Redis(host="redis", port=6379, db=0)
queue = RedisQueue(redis_client, stream_name="jobs:social-post")


class PostRequest(BaseModel):
    page_id: str
    provider: str = "facebook"
    message: str
    media_url: str | None = None
    platforms: list[str] | None = None


class PostResponse(BaseModel):
    id: str
    job_id: str
    page_id: str
    provider: str
    message: str
    media_url: str | None = None
    status: str
    created_at: str


@app.get("/posts", response_model=list[PostResponse])
def list_posts():
    """Retrieve all posts recorded in the system."""
    post_ids_raw = redis_client.get("posts:all")
    if not post_ids_raw:
        return []

    try:
        post_ids = json.loads(post_ids_raw)
    except Exception:
        return []

    results = []
    for pid in post_ids:
        raw = redis_client.get(f"posts:{pid}")
        if raw:
            try:
                pdata = json.loads(raw)
                # Fetch live status from job_state if available
                job_id = pdata.get("job_id")
                if job_id:
                    live_status = redis_client.get(f"job_state:{job_id}")
                    if live_status:
                        pdata["status"] = live_status.decode("utf-8")
                results.append(pdata)
            except Exception:
                continue

    return results


@app.post("/posts")
def create_post(
    request: PostRequest, x_idempotency_key: str | None = Header(None)
):
    # Backpressure check
    try:
        q_len = redis_client.xlen("jobs:social-post")
        if q_len > 10000:
            raise HTTPException(
                status_code=429, detail="Queue overload, please try again later"
            )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        logger.warning("Failed to check queue length", error=str(e))

    idem_key = x_idempotency_key if x_idempotency_key else str(uuid.uuid4())
    job_id = idem_key
    post_id = str(uuid.uuid4())

    # Record post entry
    now_str = datetime.now(UTC).strftime("%b %d, %Y")
    post_record = {
        "id": post_id,
        "job_id": job_id,
        "page_id": request.page_id,
        "provider": request.provider,
        "message": request.message,
        "media_url": request.media_url,
        "status": "pending",
        "created_at": now_str,
    }
    redis_client.set(f"posts:{post_id}", json.dumps(post_record), ex=86400 * 7)
    all_ids_raw = redis_client.get("posts:all")
    all_ids = json.loads(all_ids_raw) if all_ids_raw else []
    if post_id not in all_ids:
        all_ids.insert(0, post_id)
        redis_client.set("posts:all", json.dumps(all_ids[:100]))

    # Enqueue to stream
    queue.enqueue(
        {
            "type": "create_post",
            "post_id": post_id,
            "page_id": request.page_id,
            "provider": request.provider,
            "message": request.message,
            "media_url": request.media_url,
            "idempotency_key": idem_key,
            "job_id": job_id,
        }
    )

    redis_client.set(f"job_state:{job_id}", "pending", ex=86400)
    return {"status": "enqueued", "job_id": job_id, "post_id": post_id}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/dlq/{stream_name}")
def get_dlq(stream_name: str, limit: int = 50):
    dlq_stream = f"jobs:{stream_name}:dlq"
    try:
        messages = redis_client.xrange(
            dlq_stream, min="-", max="+", count=limit
        )
        results = []
        for msg_id, data in messages:
            results.append(
                {
                    "message_id": msg_id.decode("utf-8"),
                    "data": {
                        k.decode("utf-8"): v.decode("utf-8")
                        for k, v in data.items()
                    },
                }
            )
        return {"stream": dlq_stream, "messages": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/dlq/{stream_name}/replay/{message_id}")
def replay_dlq_message(stream_name: str, message_id: str):
    dlq_stream = f"jobs:{stream_name}:dlq"
    main_stream = f"jobs:{stream_name}"

    messages = redis_client.xrange(
        dlq_stream, min=message_id, max=message_id, count=1
    )
    if not messages:
        raise HTTPException(status_code=404, detail="Message not found in DLQ")

    _, data = messages[0]
    payload_str = data.get(b"payload")
    if not payload_str:
        raise HTTPException(
            status_code=400, detail="Invalid DLQ message format"
        )

    try:
        payload = json.loads(payload_str.decode("utf-8"))
        payload["attempt_count"] = 0
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Cannot decode payload")

    q = RedisQueue(redis_client, stream_name=main_stream)
    new_id = q.enqueue(payload)
    redis_client.xdel(dlq_stream, message_id)

    return {
        "status": "replayed",
        "new_message_id": new_id,
        "original_message_id": message_id,
    }
