import json
from typing import Annotated

import structlog
from fastapi import Depends, FastAPI, Header, HTTPException
from redis import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from shared.queue import RedisQueue
from shared.telemetry import init_telemetry, setup_logging

from app.config import settings
from app.database import get_db
from app.schemas import CreatePostResponse, PostRequest, PostResponse
from app import service

SERVICE_NAME = "social-post-service"
setup_logging(SERVICE_NAME)

app = FastAPI(title="Social Post Service")
init_telemetry(SERVICE_NAME, app=app)
logger = structlog.get_logger(__name__)

redis_client = Redis(
    host=settings.redis_host, port=settings.redis_port, db=0
)
queue = RedisQueue(redis_client, stream_name="jobs:social-post")


@app.get("/posts", response_model=list[PostResponse])
async def list_posts(db: Annotated[AsyncSession, Depends(get_db)]):
    """Retrieve all posts from PostgreSQL with live job state."""
    return await service.get_all_posts(db=db, redis_client=redis_client)


@app.post("/posts", response_model=CreatePostResponse)
async def create_post(
    request: PostRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    x_idempotency_key: str | None = Header(None),
):
    """Save post to PostgreSQL and enqueue for publishing."""
    return await service.create_post(
        db=db,
        req=request,
        idempotency_key=x_idempotency_key,
        queue=queue,
        redis_client=redis_client,
    )


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
        raise HTTPException(status_code=500, detail=str(e)) from e


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
