import json

import pytest
from httpx import AsyncClient

from main import redis_client


@pytest.mark.asyncio
async def test_list_posts_empty(client: AsyncClient):
    response = await client.get("/posts")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_create_post_success(client: AsyncClient):
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

    # Verify post entry persisted in Redis
    raw = redis_client.get(f"posts:{post_id}")
    assert raw is not None
    post_record = json.loads(raw)
    assert post_record["message"] == "Exciting product launch!"
    assert post_record["page_id"] == "page_fb_123"
    assert post_record["provider"] == "facebook"

    # Verify job state set to pending
    state = redis_client.get(f"job_state:{job_id}")
    assert state is not None
    assert state.decode("utf-8") == "pending"


@pytest.mark.asyncio
async def test_create_post_validation_error(client: AsyncClient):
    # Missing required message and page_id
    response = await client.post("/posts", json={"provider": "twitter"})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_post_with_idempotency_header(client: AsyncClient):
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
