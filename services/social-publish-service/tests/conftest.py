import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from main import app, redis_client


@pytest_asyncio.fixture(autouse=True)
def clean_redis_publish():
    """Clean test publish jobs from Redis before and after each test."""
    keys = redis_client.keys("jobs:social-publish*") + redis_client.keys("job_state:*")
    if keys:
        redis_client.delete(*keys)
    yield
    keys = redis_client.keys("jobs:social-publish*") + redis_client.keys("job_state:*")
    if keys:
        redis_client.delete(*keys)


@pytest_asyncio.fixture
async def client():
    """Async HTTP test client for social-publish-service."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac
