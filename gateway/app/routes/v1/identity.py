from fastapi import APIRouter, Request
from http_client import _forward

identity_router = APIRouter(prefix="/users", tags=["identity"])


@identity_router.get("")
async def get_users():
    return await _forward("GET", "http://identity-service:3001/users")


@identity_router.get("/{user_id}")
async def get_user(user_id: str):
    return await _forward("GET", f"http://identity-service:3001/users/{user_id}")


@identity_router.post("")
async def create_user(request: Request):
    print(await request.json())
    # TODO: Implement Gateway Resilience and Reliability Patterns:
    # 1. IDEMPOTENCY: Use the client-provided request 'uuid' (cached in Redis) to prevent duplicate processing.
    # 2. CIRCUIT BREAKER: Trip the connection if identity-service fails repeatedly to prevent thread starvation.
    # [x] 3. TIMEOUTS: Enforce strict HTTP timeouts (e.g. 10s default in _forward) so slow service calls don't hang the gateway.
    # 4. RATE LIMITING: Apply IP or Token-based rate limiting to prevent registration spam.
    # 5. RETRIES: Add safe GET retries (using exponential backoff) for transient upstream connection drops.
    return await _forward("POST", "http://identity-service:3001/users", request)