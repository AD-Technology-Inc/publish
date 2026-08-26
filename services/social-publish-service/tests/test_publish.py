import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import SocialPublish
from main import redis_client


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_publish_post_success(
    client: AsyncClient, db_session: AsyncSession
):
    payload = {
        "page_id": "page_fb_123",
        "provider": "facebook",
        "message": "Exciting new announcement!",
        "media_url": "https://example.com/banner.png",
        "post_db_id": "custom-post-uuid",
        "idempotency_key": "custom_pub_idem_key_1",
    }
    response = await client.post("/publish", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "enqueued"
    assert data["job_id"] == "custom_pub_idem_key_1"

    # Verify record is persisted in PostgreSQL
    db_job = (
        await db_session.execute(
            select(SocialPublish).where(
                SocialPublish.job_id == "custom_pub_idem_key_1"
            )
        )
    ).scalar_one_or_none()
    assert db_job is not None
    assert db_job.page_id == "page_fb_123"
    assert db_job.provider == "facebook"
    assert db_job.message == "Exciting new announcement!"
    assert db_job.post_db_id == "custom-post-uuid"
    assert db_job.status == "pending"

    # Verify job state initialized in Redis
    state = redis_client.get("job_state:custom_pub_idem_key_1")
    assert state is not None
    assert state.decode("utf-8") == "pending"

    # Verify job placed in stream
    stream_len = redis_client.xlen("jobs:social-publish")
    assert stream_len >= 1


@pytest.mark.asyncio
async def test_publish_post_without_idempotency_key(
    client: AsyncClient, db_session: AsyncSession
):
    payload = {
        "page_id": "page_ig_456",
        "provider": "instagram",
        "message": "Photo of the day!",
    }
    response = await client.post("/publish", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "enqueued"
    assert "job_id" in data

    # Verify job in PostgreSQL
    db_job = (
        await db_session.execute(
            select(SocialPublish).where(SocialPublish.job_id == data["job_id"])
        )
    ).scalar_one_or_none()
    assert db_job is not None
    assert db_job.page_id == "page_ig_456"
    assert db_job.provider == "instagram"


@pytest.mark.asyncio
async def test_publish_post_validation_error(client: AsyncClient):
    # Missing required 'message' and 'page_id'
    response = await client.post("/publish", json={"provider": "facebook"})
    assert response.status_code == 422
