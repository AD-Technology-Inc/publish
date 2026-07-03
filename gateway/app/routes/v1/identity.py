from fastapi import APIRouter
from http_client import fetch

identity_router = APIRouter(prefix="/users", tags=["identity"])


@identity_router.get("/")
async def get_users():
    return await fetch("GET", "http://identity-service:3001/users")


@identity_router.get("/{user_id}")
async def get_user(user_id: int):
    return await fetch("GET", f"http://identity-service:3001/users/{user_id}")



@identity_router.post("/")
async def create_user(user: dict):
    return await fetch("POST", "http://identity-service:3001/users", json=user)
