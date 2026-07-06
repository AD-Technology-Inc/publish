from fastapi import APIRouter
from http_client import _forward

identity_router = APIRouter(prefix="/users", tags=["identity"])


@identity_router.get("/")
async def get_users():
    return await _forward("GET", "http://identity-service:3001/users")


@identity_router.get("/{user_id}")
async def get_user(user_id: int):
    return await _forward("GET", f"http://identity-service:3001/users/{user_id}")



@identity_router.post("/")
async def create_user(user: dict):
    return await _forward("POST", "http://identity-service:3001/users", json=user)
