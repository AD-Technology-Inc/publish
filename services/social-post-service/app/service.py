import uuid

import structlog
from fastapi import HTTPException, status
from redis import Redis
from shared.queue import RedisQueue
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import SocialPost
from app.schemas import PostRequest

logger = structlog.get_logger(__name__)


async def get_all_posts(
    db: AsyncSession, redis_client: Redis
) -> list[dict]:
    result = await db.execute(
        select(SocialPost).order_by(SocialPost.created_at.desc()).limit(100)
    )
    posts = list(result.scalars().all())

    output = []
    for p in posts:
        live_status = p.status
        if p.job_id:
            cached_status = redis_client.get(f"job_state:{p.job_id}")
            if cached_status:
                live_status = cached_status.decode("utf-8")

        output.append(
            {
                "id": p.id,
                "job_id": p.job_id,
                "page_id": p.page_id,
                "provider": p.provider,
                "message": p.message,
                "media_url": p.media_url,
                "status": live_status,
                "created_at": p.created_at.strftime("%b %d, %Y"),
            }
        )
    return output


async def get_post_by_id(db: AsyncSession, post_id: str) -> SocialPost | None:
    result = await db.execute(
        select(SocialPost).where(SocialPost.id == post_id)
    )
    return result.scalar_one_or_none()


async def create_post(
    db: AsyncSession,
    req: PostRequest,
    idempotency_key: str | None,
    queue: RedisQueue,
    redis_client: Redis,
) -> dict:
    # Backpressure check on queue
    try:
        q_len = redis_client.xlen("jobs:social-post")
        if q_len > 10000:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Queue overload, please try again later",
            )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        logger.warning("Failed to check queue length", error=str(e))

    idem_key = idempotency_key if idempotency_key else str(uuid.uuid4())
    job_id = idem_key
    post_id = str(uuid.uuid4())

    new_post = SocialPost(
        id=post_id,
        job_id=job_id,
        page_id=req.page_id.strip(),
        provider=req.provider.lower().strip(),
        message=req.message.strip(),
        media_url=req.media_url,
        status="pending",
    )

    db.add(new_post)
    await db.commit()
    await db.refresh(new_post)

    # Enqueue to stream
    queue.enqueue(
        {
            "type": "create_post",
            "post_id": post_id,
            "page_id": req.page_id.strip(),
            "provider": req.provider.lower().strip(),
            "message": req.message.strip(),
            "media_url": req.media_url,
            "idempotency_key": idem_key,
            "job_id": job_id,
        }
    )

    redis_client.set(f"job_state:{job_id}", "pending", ex=86400)
    logger.info("Post enqueued", post_id=post_id, job_id=job_id)

    return {"status": "enqueued", "job_id": job_id, "post_id": post_id}
