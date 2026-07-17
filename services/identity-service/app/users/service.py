import asyncio
from datetime import UTC

import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import settings
from app.users.models.EmailVerification import EmailVerification
from app.users.models.User import User
from app.users.schemas import UserCreate

logger = structlog.get_logger(__name__)


async def get_all_users(db: AsyncSession) -> list[User]:
    result = await db.execute(select(User))
    return list(result.scalars().all())


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


# !FIXME: async: send email verification
async def create_user(db: AsyncSession, user: UserCreate) -> User:
    # Hash password
    from pwdlib import PasswordHash

    password_hash = PasswordHash.recommended()
    hashed_password = password_hash.hash(user.password)

    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_password,
    )

    db.add(new_user)
    await db.flush()  # Populates new_user.id

    # TODO: validate if can move to separate function
    # Create email verification record
    email_verification, code = EmailVerification.create_for_user(
        new_user.id, settings.app_key
    )
    db.add(email_verification)

    await db.commit()
    await db.refresh(new_user)

    # Dispatch email sending in the background
    asyncio.create_task(send_verify_email(new_user.email, code))

    return new_user


# TODO: validate
async def verify_email(db: AsyncSession, token: str) -> bool:
    import hashlib
    import hmac
    from datetime import datetime

    from fastapi import HTTPException, status

    # Compute code hash to search for the record
    code_hash = hmac.new(
        settings.app_key.encode(),
        token.encode(),
        hashlib.sha256,
    ).hexdigest()

    # Find the verification record
    result = await db.execute(
        select(EmailVerification).where(
            EmailVerification.code_hash == code_hash,
            EmailVerification.verified_at.is_(None),
        )
    )
    verification = result.scalar_one_or_none()

    if (
        not verification
        or verification.is_expired
        or not verification.verify_code(token, settings.app_key)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code.",
        )

    # Mark verification record as verified
    verification.verified_at = datetime.now(UTC)

    # Update User verified status
    user_result = await db.execute(
        select(User).where(User.id == verification.user_id)
    )
    user = user_result.scalar_one_or_none()
    if user:
        user.email_verified_at = datetime.now(UTC)

    await db.commit()
    return True


# Send verification email simulation
async def send_verify_email(email: str, code: str):
    try:
        logger.info(
            "Send email verification",
            to_email=email,
            code=code,
            url=f"http://localhost:8000/verify-email?token={code}",
        )
    except Exception:
        pass
