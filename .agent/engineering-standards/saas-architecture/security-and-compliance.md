# Skill: .agent/engineering-standards/saas-architecture/security-and-compliance.md

## 📌 Core Philosophy & Constraints
- **Zero Trust Security**: Validate and sanitize every request input regardless of origin.
- **Mandatory Security Headers**: Responses MUST include `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Content-Security-Policy`.
- **Strict CORS Rules**: Never use wildcard `Access-Control-Allow-Origin: *` when credentials/cookies are permitted.
- **Secret Hygiene**: Zero plain-text credentials in repository source files or Docker images.

## ⚡ Production Boilerplate / Standard Pattern

### Security Middleware Setup (FastAPI)
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
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        return response

app = FastAPI()
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
- ❌ **Wildcard CORS with Credentials**: Combining `allow_origins=["*"]` with `allow_credentials=True`.
- ❌ **Hardcoded Secrets**: Committing API tokens or database passwords into codebase files.
- ❌ **Raw Query Concatenation**: Constructing SQL or Mongo queries via string formatting instead of parameterized bindings.

## 🔍 Verification & Testing
- **Header Inspection Test**: Execute `curl -I http://localhost:8000/api/v1/healthz` and assert presence of all 4 security headers.
- **Secret Scanner**: Run `gitleaks detect` in CI pipeline to verify zero committed credentials.
