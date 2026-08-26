from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from app.config import settings
from app.database import get_db
from main import app, redis_client

# NullPool test engine to prevent cross-event-loop connection reuse issues
test_engine = create_async_engine(settings.database_url, poolclass=NullPool)
TestAsyncSessionMaker = async_sessionmaker(
    bind=test_engine,
    expire_on_commit=False,
)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestAsyncSessionMaker() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(autouse=True)
async def clean_database_and_redis():
    """Clean Postgres tables and Redis keys before and after each test."""
    async with test_engine.begin() as conn:
        await conn.execute(text("TRUNCATE TABLE social_posts CASCADE;"))

    keys = (
        redis_client.keys("jobs:social-post*")
        + redis_client.keys("job_state:*")
    )
    if keys:
        redis_client.delete(*keys)

    yield

    async with test_engine.begin() as conn:
        await conn.execute(text("TRUNCATE TABLE social_posts CASCADE;"))

    keys = (
        redis_client.keys("jobs:social-post*")
        + redis_client.keys("job_state:*")
    )
    if keys:
        redis_client.delete(*keys)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with TestAsyncSessionMaker() as session:
        yield session


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP test client for social-post-service."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
