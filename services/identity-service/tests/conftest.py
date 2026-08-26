from unittest.mock import AsyncMock, patch

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
from app.main import app

# Dedicated test engine with NullPool
test_engine = create_async_engine(
    settings.database_url,
    poolclass=NullPool,
)
test_session_maker = async_sessionmaker(
    bind=test_engine,
    expire_on_commit=False,
)


@pytest_asyncio.fixture
async def db_session() -> AsyncSession:
    """Provide a scoped database session per test."""
    async with test_session_maker() as session:
        yield session


async def override_get_db():
    async with test_session_maker() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(autouse=True)
async def mock_background_email():
    """Mock send_verify_email so background asyncio tasks don't linger across test loops."""
    with patch("app.users.service.send_verify_email", new_callable=AsyncMock):
        yield


@pytest_asyncio.fixture(autouse=True)
async def clean_database():
    """Clean database tables before each test to ensure test isolation."""
    async with test_session_maker() as session:
        async with session.begin():
            await session.execute(
                text("TRUNCATE TABLE email_verifications, users RESTART IDENTITY CASCADE;")
            )
    yield


@pytest_asyncio.fixture
async def client():
    """Async HTTP test client bound to FastAPI application."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
