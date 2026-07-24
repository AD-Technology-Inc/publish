# Skill: .agent/backend/shared/authentication-authz/session-security.md

## 📌 Core Philosophy & Constraints
- **Secure Cookie Flags**: Session cookies MUST set `SameSite=Lax` or `Strict`, `Secure=True`, and `HttpOnly=True`.
- **Token Revocation List (TRL)**: Store revoked token IDs (JTI) in Redis with TTL matching token expiry.
- **CSRF Double-Submit Cookie**: Enforce CSRF protection for cookie-authenticated sessions.

## ⚡ Production Boilerplate / Standard Pattern

```python
# Redis Token Revocation Implementation
import redis.asyncio as redis

redis_client = redis.from_url("redis://localhost:6379/2")

async def revoke_token(jti: str, ttl_seconds: int):
    await redis_client.setex(name=f"revoked_token:{jti}", time=ttl_seconds, value="1")

async def is_token_revoked(jti: str) -> bool:
    res = await redis_client.get(f"revoked_token:{jti}")
    return res is not None
```

## 🚫 Forbidden Anti-Patterns
- ❌ **HttpOnly Flag Omission**: Allowing JavaScript access to session cookies (`HttpOnly=False`) exposing XSS session hijacking.
- ❌ **Unflagged `SameSite=None`**: Setting `SameSite=None` without enforcing `Secure=True` HTTPS.
- ❌ **No Token Revocation Ability**: Inability to invalidate user access tokens upon password reset or logout.

## 🔍 Verification & Testing
- **Revocation Test**: Revoke JTI token in Redis test asserting `is_token_revoked(jti)` returns `True`.
