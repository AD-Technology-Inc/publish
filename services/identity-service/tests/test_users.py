import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_user_success(client: AsyncClient):
    payload = {
        "first_name": "Alice",
        "last_name": "Smith",
        "email": "alice.smith@example.com",
        "password": "StrongPassword123!",
        "password_confirmation": "StrongPassword123!",
    }
    response = await client.post("/users", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Alice"
    assert data["last_name"] == "Smith"
    assert data["email"] == "alice.smith@example.com"
    assert data["name"] == "Alice Smith"
    assert "id" in data
    assert "password" not in data


@pytest.mark.asyncio
async def test_create_user_duplicate_email(client: AsyncClient):
    payload = {
        "first_name": "Alice",
        "last_name": "Smith",
        "email": "alice.smith@example.com",
        "password": "StrongPassword123!",
        "password_confirmation": "StrongPassword123!",
    }
    response1 = await client.post("/users", json=payload)
    assert response1.status_code == 200

    # Attempt to register with the same email
    response2 = await client.post("/users", json=payload)
    assert response2.status_code == 400
    assert "already exists" in response2.json()["detail"] or "Duplicate" in response2.json()["detail"]


@pytest.mark.asyncio
async def test_get_all_users_empty(client: AsyncClient):
    response = await client.get("/users")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_get_all_users(client: AsyncClient):
    # Register two users
    await client.post(
        "/users",
        json={
            "first_name": "User",
            "last_name": "One",
            "email": "user1@example.com",
            "password": "Password123!",
            "password_confirmation": "Password123!",
        },
    )
    await client.post(
        "/users",
        json={
            "first_name": "User",
            "last_name": "Two",
            "email": "user2@example.com",
            "password": "Password123!",
            "password_confirmation": "Password123!",
        },
    )

    response = await client.get("/users")
    assert response.status_code == 200
    users = response.json()
    assert len(users) == 2
    assert users[0]["email"] == "user1@example.com"
    assert users[1]["email"] == "user2@example.com"


@pytest.mark.asyncio
async def test_get_user_by_id(client: AsyncClient):
    create_res = await client.post(
        "/users",
        json={
            "first_name": "Bob",
            "last_name": "Jones",
            "email": "bob.jones@example.com",
            "password": "Password123!",
            "password_confirmation": "Password123!",
        },
    )
    user_id = create_res.json()["id"]

    response = await client.get(f"/users/{user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id
    assert data["email"] == "bob.jones@example.com"


@pytest.mark.asyncio
async def test_get_user_by_id_not_found(client: AsyncClient):
    response = await client.get("/users/99999")
    assert response.status_code == 404
    assert response.json()["detail"] == "User with ID 99999 not found"


@pytest.mark.asyncio
async def test_get_me_empty(client: AsyncClient):
    response = await client.get("/users/me")
    assert response.status_code == 404
    assert response.json()["detail"] == "No registered user profile found."


@pytest.mark.asyncio
async def test_get_me_success(client: AsyncClient):
    await client.post(
        "/users",
        json={
            "first_name": "Primary",
            "last_name": "Admin",
            "email": "admin@example.com",
            "password": "Password123!",
            "password_confirmation": "Password123!",
        },
    )
    response = await client.get("/users/me")
    assert response.status_code == 200
    assert response.json()["email"] == "admin@example.com"
