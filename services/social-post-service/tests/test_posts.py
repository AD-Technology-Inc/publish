import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import SocialPost
from main import redis_client


@pytest.mark.asyncio
async def test_list_posts_empty(client: AsyncClient):
    response = await client.get("/posts")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_post_success(
    client: AsyncClient, db_session: AsyncSession
):
    payload = {
        "page_id": "page_fb_123",
        "provider": "facebook",
        "message": "Exciting product launch!",
        "media_url": "https://example.com/banner.png",
    }
    response = await client.post("/posts", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "enqueued"
    assert "job_id" in data
    assert "post_id" in data

    post_id = data["post_id"]
    job_id = data["job_id"]

    # Verify post entry persisted in PostgreSQL
    db_post = (
        await db_session.execute(
            select(SocialPost).where(SocialPost.id == post_id)
        )
    ).scalar_one_or_none()
    assert db_post is not None
    assert db_post.message == "Exciting product launch!"
    assert db_post.page_id == "page_fb_123"
    assert db_post.provider == "facebook"
    assert db_post.status == "pending"

    # Verify job state set to pending in Redis
    state = redis_client.get(f"job_state:{job_id}")
    assert state is not None
    assert state.decode("utf-8") == "pending"


@pytest.mark.asyncio
async def test_create_post_validation_error(client: AsyncClient):
    # Missing required message and page_id
    response = await client.post("/posts", json={"provider": "twitter"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_post_with_idempotency_header(
    client: AsyncClient, db_session: AsyncSession
):
    payload = {
        "page_id": "page_tw_456",
        "provider": "twitter",
        "message": "Idempotent tweet",
    }
    headers = {"X-Idempotency-Key": "unique-client-key-12345"}
    response = await client.post("/posts", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["job_id"] == "unique-client-key-12345"

    # Verify job_id matches in PostgreSQL
    db_post = (
        await db_session.execute(
            select(SocialPost).where(SocialPost.id == data["post_id"])
        )
    ).scalar_one_or_none()
    assert db_post is not None
    assert db_post.job_id == "unique-client-key-12345"


@pytest.mark.asyncio
async def test_list_posts_with_live_status(client: AsyncClient):
    create_res = await client.post(
        "/posts",
        json={
            "page_id": "page_li_789",
            "provider": "linkedin",
            "message": "Company Milestone reached!",
        },
    )
    job_id = create_res.json()["job_id"]

    # Simulate worker updating job_state to completed
    redis_client.set(f"job_state:{job_id}", "completed")

    response = await client.get("/posts")
    assert response.status_code == 200
    posts = response.json()
    assert len(posts) == 1
    assert posts[0]["status"] == "completed"
    assert posts[0]["message"] == "Company Milestone reached!"
    assert "created_at" in posts[0]


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_dlq_inspection(client: AsyncClient):
    response = await client.get("/dlq/social-post")
    assert response.status_code == 200
    data = response.json()
    assert "stream" in data
    assert "messages" in data
    assert isinstance(data["messages"], list)
