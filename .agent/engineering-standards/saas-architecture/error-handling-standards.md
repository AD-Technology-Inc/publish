# Skill: .agent/engineering-standards/saas-architecture/error-handling-standards.md

## 📌 Core Philosophy & Constraints
- **RFC 7807 Problem Details**: All API error responses MUST strictly adhere to RFC 7807 JSON format.
- **Unified Error Structure**: Response JSON MUST contain `type`, `title`, `status`, `detail`, `instance`, and optional `errors`.
- **Zero Stack Traces in Production**: Internal exceptions MUST NOT leak internal traces or server filesystem paths to API clients.

## ⚡ Production Boilerplate / Standard Pattern

### FastAPI Global RFC 7807 Exception Handler
```python
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

class ProblemDetails(BaseModel):
    type: str = Field(default="about:blank")
    title: str
    status: int
    detail: str
    instance: str
    errors: list[dict] | None = None

app = FastAPI()

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Log internal error safely
    problem = ProblemDetails(
        title="Internal Server Error",
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="An unexpected error occurred. Please contact support with the request ID.",
        instance=request.url.path
    )
    return JSONResponse(
        status_code=problem.status,
        content=problem.model_dump(exclude_none=True),
        headers={"Content-Type": "application/problem+json"}
    )
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Inconsistent Error JSON**: Returning `{ "error": "msg" }` on some endpoints and `{ "message": "msg" }` on others.
- ❌ **Leaking Exception Stack Traces**: Exposing Python tracebacks or PHP stack traces in response payloads.
- ❌ **200 OK with Error Body**: Returning HTTP status code 200 while payload contains `{ "success": false }`.

## 🔍 Verification & Testing
- **Error Assertion Test**: Trigger 404, 422, and 500 responses and assert header `Content-Type: application/problem+json` and body field `status`.
