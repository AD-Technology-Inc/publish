import uuid

import structlog
from fastapi import HTTPException, status
from redis import Redis
from shared.queue import RedisQueue
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import SocialAccount
from app.schemas import PROVIDER_LABELS, ConnectAccountRequest

logger = structlog.get_logger(__name__)


async def get_all_accounts(db: AsyncSession) -> list[SocialAccount]:
    result = await db.execute(
        select(SocialAccount).order_by(SocialAccount.created_at.desc())
    )
    return list(result.scalars().all())


async def get_account_by_id(db: AsyncSession, account_id: str) -> SocialAccount | None:
    result = await db.execute(
        select(SocialAccount).where(SocialAccount.id == account_id)
    )
    return result.scalar_one_or_none()


async def get_account_by_provider_page(
    db: AsyncSession, provider: str, page_id: str
) -> SocialAccount | None:
    result = await db.execute(
        select(SocialAccount).where(
            SocialAccount.provider == provider,
            SocialAccount.page_id == page_id,
        )
    )
    return result.scalar_one_or_none()


async def create_account(
    db: AsyncSession,
    req: ConnectAccountRequest,
    queue: RedisQueue,
    redis_client: Redis,
) -> SocialAccount:
    provider = req.provider.lower().strip()
    if provider not in PROVIDER_LABELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported provider: {req.provider}",
        )

    # Check for duplicate
    existing = await get_account_by_provider_page(db, provider, req.page_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Account already connected for {provider} / {req.page_id}",
        )

    account_id = str(uuid.uuid4())
    new_account = SocialAccount(
        id=account_id,
        provider=provider,
        name=req.name.strip(),
        page_id=req.page_id.strip(),
        access_token=req.access_token.strip(),
        status="connected",
    )

    try:
        db.add(new_account)
        await db.commit()
        await db.refresh(new_account)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Account already connected for {provider} / {req.page_id}",
        ) from None

    # Cache token in Redis for high-speed lookup by worker/publishing services
    redis_client.set(
        f"token:{provider}:{req.page_id.strip()}",
        req.access_token.strip(),
    )

    # Enqueue validation job to Redis stream
    idem_key = f"link:{account_id}"
    job_id = queue.enqueue(
        {
            "type": "account_link",
            "account_id": account_id,
            "provider": provider,
            "page_id": req.page_id.strip(),
            "idempotency_key": idem_key,
        }
    )
    logger.info("Account queued for validation", account_id=account_id, job_id=job_id)

    return new_account


async def delete_account(
    db: AsyncSession, account_id: str, redis_client: Redis
) -> None:
    account = await get_account_by_id(db, account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )

    provider = account.provider
    page_id = account.page_id

    await db.delete(account)
    await db.commit()

    # Clear cached token in Redis
    redis_client.delete(f"token:{provider}:{page_id}")


async def update_account_status(
    db: AsyncSession, account_id: str, new_status: str
) -> bool:
    account = await get_account_by_id(db, account_id)
    if not account:
        return False

    account.status = new_status
    await db.commit()
    return True
