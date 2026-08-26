import uuid
import structlog
from redis import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from shared.queue import RedisQueue

from app.models import SocialPublish
from app.schemas import PublishRequest

logger = structlog.get_logger(__name__)


async def get_publish_by_job_id(
    db: AsyncSession, job_id: str
) -> SocialPublish | None:
    result = await db.execute(
        select(SocialPublish).where(SocialPublish.job_id == job_id)
    )
    return result.scalar_one_or_none()


async def create_publish_job(
    db: AsyncSession,
    req: PublishRequest,
    queue: RedisQueue,
    redis_client: Redis,
) -> dict:
    idem_key = req.idempotency_key or str(uuid.uuid4())
    job_id = idem_key
    publish_id = str(uuid.uuid4())

    new_publish = SocialPublish(
        id=publish_id,
        job_id=job_id,
        page_id=req.page_id.strip(),
        provider=req.provider.lower().strip(),
        message=req.message.strip(),
        media_url=req.media_url,
        post_db_id=req.post_db_id,
        status="pending",
    )

    db.add(new_publish)
    await db.commit()
    await db.refresh(new_publish)

    stream_msg_id = queue.enqueue(
        {
            "type": "publish_post",
            "page_id": req.page_id.strip(),
            "provider": req.provider.lower().strip(),
            "message": req.message.strip(),
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
