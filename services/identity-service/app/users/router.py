from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.users import service
from app.users.schemas import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_me(db: Annotated[AsyncSession, Depends(get_db)]):
    """Retrieve the active logged-in user profile (or default system user)."""
    users = await service.get_all_users(db)
    if users:
        return users[0]

    # Return default admin profile if database has no users yet
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No registered user profile found.",
    )


@router.get("", response_model=list[UserResponse])
async def get_users(db: Annotated[AsyncSession, Depends(get_db)]):
    return await service.get_all_users(db)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    user = await service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found",
        )
    return user


@router.post("", response_model=UserResponse)
async def create_user(
    user: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]
):
    return await service.create_user(db, user)
