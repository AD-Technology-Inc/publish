# Skill: .agent/backend/fastapi/router-development/rate-limiting.md

## 📌 Core Philosophy & Constraints
- **SlowAPI Rate Limiter**: Use SlowAPI rate limiter backed by Redis storage.
- **Client Identifier Keys**: Limit requests based on client IP address (`get_remote_address`) or authenticated user ID.
- **Standard Error Payload**: Return HTTP 429 status code with clear retry-after headers.

## ⚡ Production Boilerplate / Standard Pattern

```python
from fastapi import FastAPI, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

def setup_rate_limiting(app: FastAPI):
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Usage on individual router endpoint
from fastapi import APIRouter

router = APIRouter()

@router.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request):
    return {"message": "Login attempt processed"}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **In-Memory Rate Limiting in Multi-Worker Setup**: Using local memory limiters across multi-process Gunicorn/Uvicorn deployments.
- ❌ **Missing Request Parameter in Limited Routes**: Omitting mandatory `request: Request` parameter on `@limiter.limit()` routes.
- ❌ **Unthrottled Public Write Endpoints**: Leaving registration or password reset routes un-throttled.

## 🔍 Verification & Testing
- **Pytest Rate Limit Assertion**: Execute 6 requests on `@limiter.limit("5/minute")` endpoint in Pytest verifying 6th request yields HTTP 429.
