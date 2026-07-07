from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.users.schemas import UserCreate, UserResponse
from app.users import service

router = APIRouter(prefix="/users", tags=["users"])

@router.get("", response_model=list[UserResponse])
async def get_users(db: Annotated[AsyncSession, Depends(get_db)]):
    return await service.get_all_users(db)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Annotated[AsyncSession, Depends(get_db)]):
    user = await service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found"
        )
    return user

@router.post("")
async def create_user(user: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    return await service.create_user_job(db, user)
