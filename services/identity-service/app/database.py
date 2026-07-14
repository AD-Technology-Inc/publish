from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True, # check if connection is alive before using it
)

async_session_maker = async_sessionmaker(
    bind=engine,
    # Keeps data in memory after commit to prevent errors
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


# Async database session injector
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
