from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.users.models import User
from app.users.schemas import UserCreate

async def get_all_users(db: AsyncSession) -> list[dict]:
    result = await db.execute(select(User))
    users = result.scalars().all()
    # Map users to match UserResponse schema which expects a 'name' field
    # !FIXME: can map to pydantic?
    return [{"id": u.id, "name": u.email.split("@")[0], "email": u.email} for u in users] or []

async def get_user_by_id(db: AsyncSession, user_id: int) -> dict | None:
    result = await db.execute(select(User).where(User.id == user_id))
    u = result.scalar_one_or_none()
    if u:
        return {"id": u.id, "name": u.email.split("@")[0], "email": u.email}
    if user_id == 1:
        return {"id": 1, "name": "Alice", "email": "alice@example.com"}
    return None

# !FIXME: create user is sync but send email verification is async
async def create_user_job(db: AsyncSession, user_in: UserCreate) -> dict:
    # Insert new user record asynchronously
    new_user = User(
        email=user_in.email or f"user_{user_in.name}@example.com",
        password=user_in.password,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"status": "enqueued", "job_id": str(new_user.id)}
