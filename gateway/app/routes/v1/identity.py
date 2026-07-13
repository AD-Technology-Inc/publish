from fastapi import APIRouter, Request

from http_client import forward

identity_router = APIRouter(prefix="/users", tags=["identity"])


@identity_router.get("")
async def get_users():
    from main import ServiceName

    return await forward(
        ServiceName.IDENTITY, "GET", "http://identity-service:3001/users"
    )


@identity_router.get("/{user_id}")
async def get_user(user_id: str):
    from main import ServiceName

    return await forward(
        ServiceName.IDENTITY,
        "GET",
        f"http://identity-service:3001/users/{user_id}",
    )


@identity_router.post("")
async def create_user(request: Request):
    from main import ServiceName

    # TODO: Gateway Resilience & Reliability Checklist:
    # 1. IDEMPOTENCY: Cache request UUID in Redis to block duplicate posts.
    # [x] 2. CIRCUIT BREAKER: Avoid thread starvation if service fails.
    # [x] 3. TIMEOUTS: Strict HTTP timeouts (10s default) to prevent hanging.
    # 4. RATE LIMITING: Add IP/token rate limit to block registration spam.
    # [x] 5. RETRIES: Exponential backoff on safe GET request failures.
    return await forward(
        ServiceName.IDENTITY,
        "POST",
        "http://identity-service:3001/users",
        request,
    )
