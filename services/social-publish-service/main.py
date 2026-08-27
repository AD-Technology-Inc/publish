from typing import Annotated

import structlog
from fastapi import Depends, FastAPI
from redis import Redis
from shared.queue import RedisQueue
from shared.telemetry import init_telemetry, setup_logging
from sqlalchemy.ext.asyncio import AsyncSession

from app import service
from app.config import settings
from app.database import get_db
from app.schemas import PublishRequest, PublishResponse

SERVICE_NAME = "social-publish-service"
setup_logging(SERVICE_NAME)

app = FastAPI(title="Social Publish Service")
init_telemetry(SERVICE_NAME, app=app)
logger = structlog.get_logger(__name__)

redis_client = Redis(
    host=settings.redis_host, port=settings.redis_port, db=0
)
queue = RedisQueue(redis_client, stream_name="jobs:social-publish")


@app.post("/publish", response_model=PublishResponse)
async def publish_post(
    req: PublishRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Save publish job to PostgreSQL and enqueue to stream jobs:social-publish."""
    return await service.create_publish_job(
        db=db, req=req, queue=queue, redis_client=redis_client
    )


@app.get("/healthz")
def health():
    return {"status": "ok"}
