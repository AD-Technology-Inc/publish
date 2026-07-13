import bcrypt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.users.models import User
from app.users.schemas import UserCreate


async def get_all_users(db: AsyncSession) -> list[User]:
    result = await db.execute(select(User))
    return list(result.scalars().all())


async def get_user_by_id(db: AsyncSession, user_id: int) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


# !FIXME: async: send email verification
async def create_user(db: AsyncSession, user: UserCreate) -> User:
    # Hash password using bcrypt
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user.password.encode("utf-8"), salt).decode(
        "utf-8"
    )

    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_password,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    # send email verification
    return new_user
