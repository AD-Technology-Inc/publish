# Skill: .agent/engineering-standards/logging-and-monitoring/context-and-tracing.md

## 📌 Core Philosophy & Constraints
- **Correlation ID Propagation**: Every incoming HTTP request MUST be assigned a unique `correlation_id` (`X-Request-ID`).
- **End-to-End Tracing**: The correlation ID MUST propagate across HTTP responses, database queries, and async queue jobs.
- **Context Availability**: Logs emitted anywhere within a request lifecycle MUST automatically bind the active request context.

## ⚡ Production Boilerplate / Standard Pattern

### FastAPI ASGI Correlation Middleware
```python
import uuid
import structlog
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

class CorrelationIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        correlation_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(correlation_id=correlation_id)
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = correlation_id
        return response
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Dropping Context Across Async Boundaries**: Launching background threads/tasks without copying `contextvars`.
- ❌ **Generating New IDs Internally**: Overwriting an incoming `X-Request-ID` header supplied by an API gateway.
- ❌ **Missing Response Headers**: Failing to return the correlation ID back to client API consumers.

## 🔍 Verification & Testing
- **Header Propagation Test**: Send `curl -H "X-Request-ID: test-id-123" http://localhost:8000/api/v1/healthz` and assert response header `X-Request-ID: test-id-123`.
- **Log Correlation Test**: Assert all logs emitted during test request contain `correlation_id: test-id-123`.
