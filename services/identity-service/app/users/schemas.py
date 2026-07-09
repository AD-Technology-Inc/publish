from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    first_name: str = Field(min_length=3, max_length=100)
    last_name: str = Field(min_length=3, max_length=100)
    email: Optional[EmailStr] = None


class UserCreate(UserBase):
    password: str
    password_confirmation: str


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
