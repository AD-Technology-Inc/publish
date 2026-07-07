from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.config import settings

# Async Engine (connection to DB)
engine = create_async_engine(
    settings.database_url,
    pool_pre_ping=True,
)

# Async Session factory
async_session_maker = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
)

# Base class for models
class Base(DeclarativeBase):
    pass

# Async database session injector
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session
