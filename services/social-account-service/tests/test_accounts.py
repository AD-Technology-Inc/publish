import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import SocialAccount
from main import redis_client


@pytest.mark.asyncio
async def test_list_accounts_empty(client: AsyncClient):
    response = await client.get("/accounts")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_connect_account_success(
    client: AsyncClient, db_session: AsyncSession
):
    payload = {
        "provider": "twitter",
        "name": "Twitter Page",
        "page_id": "tw_page_100",
        "access_token": "tw_tok_secret",
    }
    response = await client.post("/accounts", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["provider"] == "twitter"
    assert data["name"] == "Twitter Page"
    assert data["page_id"] == "tw_page_100"
    assert data["status"] == "connected"
    assert "connected_at" in data
    assert "id" in data
    assert "access_token" not in data  # Token not leaked in public AccountOut schema

    # Verify record is persisted in PostgreSQL
    account_id = data["id"]
    db_record = (
        await db_session.execute(
            select(SocialAccount).where(SocialAccount.id == account_id)
        )
    ).scalar_one_or_none()
    assert db_record is not None
    assert db_record.name == "Twitter Page"
    assert db_record.page_id == "tw_page_100"
    assert db_record.access_token == "tw_tok_secret"
    assert db_record.status == "connected"

    # Verify token is also cached in Redis
    stored_token = redis_client.get("token:twitter:tw_page_100")
    assert stored_token is not None
    assert stored_token.decode("utf-8") == "tw_tok_secret"


@pytest.mark.asyncio
async def test_connect_account_unsupported_provider(client: AsyncClient):
    payload = {
        "provider": "myspace",
        "name": "Invalid Provider",
        "page_id": "p1",
        "access_token": "tok1",
    }
    response = await client.post("/accounts", json=payload)
    assert response.status_code == 400
    assert "Unsupported provider" in response.json()["detail"]


@pytest.mark.asyncio
async def test_connect_account_duplicate(client: AsyncClient):
    payload = {
        "provider": "facebook",
        "name": "FB Page",
        "page_id": "fb_page_1",
        "access_token": "fb_tok",
    }
    res1 = await client.post("/accounts", json=payload)
    assert res1.status_code == 201

    # Attempt to connect same provider and page_id
    res2 = await client.post("/accounts", json=payload)
    assert res2.status_code == 409
    assert "already connected" in res2.json()["detail"]


@pytest.mark.asyncio
async def test_list_multiple_accounts(client: AsyncClient):
    await client.post(
        "/accounts",
        json={
            "provider": "facebook",
            "name": "FB Page",
            "page_id": "fb_1",
            "access_token": "fb_tok",
        },
    )
    await client.post(
        "/accounts",
        json={
            "provider": "linkedin",
            "name": "LinkedIn Company",
            "page_id": "li_1",
            "access_token": "li_tok",
        },
    )

    response = await client.get("/accounts")
    assert response.status_code == 200
    accounts = response.json()
    assert len(accounts) == 2
    providers = {a["provider"] for a in accounts}
    assert providers == {"facebook", "linkedin"}


@pytest.mark.asyncio
async def test_get_token_endpoint(client: AsyncClient):
    await client.post(
        "/accounts",
        json={
            "provider": "instagram",
            "name": "IG Page",
            "page_id": "ig_999",
            "access_token": "ig_secret_token",
        },
    )

    # Valid token retrieval (from cache or DB)
    res = await client.get("/accounts/token/instagram/ig_999")
    assert res.status_code == 200
    assert res.json()["access_token"] == "ig_secret_token"

    # Nonexistent token
    res404 = await client.get("/accounts/token/instagram/nonexistent")
    assert res404.status_code == 404
    assert res404.json()["detail"] == "Token not found"


@pytest.mark.asyncio
async def test_disconnect_account(
    client: AsyncClient, db_session: AsyncSession
):
    create_res = await client.post(
        "/accounts",
        json={
            "provider": "twitter",
            "name": "Twitter Page",
            "page_id": "tw_disconnect_1",
            "access_token": "tok_del",
        },
    )
    account_id = create_res.json()["id"]

    # Delete existing account
    del_res = await client.delete(f"/accounts/{account_id}")
    assert del_res.status_code == 204

    # Verify account removed from PostgreSQL
    db_record = (
        await db_session.execute(
            select(SocialAccount).where(SocialAccount.id == account_id)
        )
    ).scalar_one_or_none()
    assert db_record is None

    # Verify token removed from Redis
    assert redis_client.get("token:twitter:tw_disconnect_1") is None

    # Delete second time -> 404
    del_res_404 = await client.delete(f"/accounts/{account_id}")
    assert del_res_404.status_code == 404
    assert del_res_404.json()["detail"] == "Account not found"


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
