from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.users import service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/verify-email")
async def verify_email(
    token: Annotated[str, Query(description="Email verification token")],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Verify user email address using the supplied token."""
    await service.verify_email(db, token)
    return {"message": "Email verified successfully."}
