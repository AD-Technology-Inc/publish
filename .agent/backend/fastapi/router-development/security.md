# Skill: .agent/backend/fastapi/router-development/security.md

## 📌 Core Philosophy & Constraints
- **Security Headers Middleware**: Inject `X-Frame-Options`, `X-Content-Type-Options`, and `Content-Security-Policy` via Starlette middleware.
- **Strict CORS Origin Whitelisting**: Specify exact allowed origins in `CORSMiddleware`.
- **SQLAlchemy Parameterization**: Utilize SQLAlchemy 2.0 statement builders exclusively to prevent SQL injection.

## ⚡ Production Boilerplate / Standard Pattern

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

def setup_security(app: FastAPI):
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://app.yourdomain.com"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"]
    )
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Wildcard CORS with Credentials**: Setting `allow_origins=["*"]` when `allow_credentials=True`.
- ❌ **Raw String Query Building**: Formatting SQL queries using f-strings (`f"SELECT * FROM users WHERE email='{email}'"`).
- ❌ **Exposing Debug Interactive Docs in Production**: Leaving `/docs` and `/redoc` enabled publicly in production environments.

## 🔍 Verification & Testing
- **Header Inspection Test**: Send test request using `httpx.AsyncClient` asserting all security headers are present in response headers.
