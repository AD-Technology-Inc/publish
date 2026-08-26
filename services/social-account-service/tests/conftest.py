from unittest.mock import MagicMock, patch

import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from main import app, redis_client


@pytest_asyncio.fixture(autouse=True)
def clean_redis_accounts():
    """Clean test account data from redis before and after each test."""
    # Delete all account and token keys
    keys = redis_client.keys("accounts:*") + redis_client.keys("token:*") + redis_client.keys("jobs:social-account*")
    if keys:
        redis_client.delete(*keys)
    yield
    keys = redis_client.keys("accounts:*") + redis_client.keys("token:*") + redis_client.keys("jobs:social-account*")
    if keys:
        redis_client.delete(*keys)


@pytest_asyncio.fixture
async def client():
    """Async HTTP test client for social-account-service."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
