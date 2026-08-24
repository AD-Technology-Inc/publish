## 📌 Core Philosophy & Constraints
- **Secure Cookie Flags**: Session cookies MUST set `samesite="lax"` or `"strict"`, `secure=True`, and `httponly=True`.
- **Token Revocation List (TRL)**: Store revoked token IDs (JTI) in Redis with TTL matching token expiry.
- **CSRF Protection**: Enforce CSRF token verification for cookie-authenticated API endpoints.

## ⚡ Production Boilerplate / Standard Pattern

```python
import redis.asyncio as redis
from fastapi import Response

redis_client = redis.from_url("redis://localhost:6379/2", decode_responses=True)

async def revoke_token(jti: str, ttl_seconds: int) -> None:
    await redis_client.setex(name=f"revoked_token:{jti}", time=ttl_seconds, value="1")

async def is_token_revoked(jti: str) -> bool:
    res = await redis_client.get(f"revoked_token:{jti}")
    return res is not None

def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=1800
    )
```

## 🚫 Forbidden Anti-Patterns
- ❌ **HttpOnly Flag Omission**: Setting `httponly=False` exposing access cookies to XSS script theft.
- ❌ **Unflagged `samesite="none"`**: Setting `samesite="none"` without enforcing `secure=True` HTTPS.
- ❌ **No Token Revocation Ability**: Inability to invalidate user access tokens upon password reset or logout.

## 🔍 Verification & Testing
- **Revocation Test**: Revoke JTI token in Redis test asserting `is_token_revoked(jti)` returns `True` in Pytest.
