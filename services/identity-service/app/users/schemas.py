from pydantic import BaseModel, ConfigDict, EmailStr, Field, computed_field


class UserBase(BaseModel):
    first_name: str = Field(min_length=3, max_length=100)
    last_name: str = Field(min_length=3, max_length=100)
    email: EmailStr


class UserCreate(UserBase):
    password: str
    password_confirmation: str


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int

    @computed_field
    @property
    def name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()
