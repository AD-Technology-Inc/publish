from fastapi import APIRouter, Request

from enums import ServiceName
from http_client import forward

identity_router = APIRouter(prefix="/identity", tags=["identity"])


# -------------------------
# Authentication & User Profile
# -------------------------
@identity_router.get(path="/me")
async def get_me():
    return await forward(
        service_name=ServiceName.IDENTITY,
        method="GET",
        url="http://identity-service:8000/users/me",
    )


@identity_router.post(path="/register")
async def create_user(request: Request):
    return await forward(
        service_name=ServiceName.IDENTITY,
        method="POST",
        url="http://identity-service:8000/users",
        request=request,
    )


@identity_router.get(path="/verify-email")
async def verify_email(token: str):
    return await forward(
        service_name=ServiceName.IDENTITY,
        method="GET",
        url=f"http://identity-service:8000/auth/verify-email?token={token}",
    )


# -------------------------
# User
# -------------------------
@identity_router.get(path="")
async def get_users():
    return await forward(
        service_name=ServiceName.IDENTITY,
        method="GET",
        url="http://identity-service:8000/users",
    )


@identity_router.get(path="/{user_id}")
async def get_user(user_id: str):
    return await forward(
        service_name=ServiceName.IDENTITY,
        method="GET",
        url=f"http://identity-service:8000/users/{user_id}",
    )
