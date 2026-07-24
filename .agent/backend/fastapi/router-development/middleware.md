# Skill: .agent/backend/fastapi/router-development/middleware.md

## 📌 Core Philosophy & Constraints
- **Structlog Correlation Middleware**: Bind request correlation IDs to structlog context variables on every request.
- **Request Response Tracing**: Log HTTP method, path, status code, and execution time (ms) for every API request.
- **ASGI Compatibility**: Use Starlette `BaseHTTPMiddleware` or pure ASGI middleware wrappers.

## ⚡ Production Boilerplate / Standard Pattern

```python
import time
import uuid
import structlog
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = structlog.get_logger()

class StructlogCorrelationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        correlation_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            correlation_id=correlation_id,
            path=request.url.path,
            method=request.method
        )

        start_time = time.perf_counter()
        response = await call_next(request)
        process_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        response.headers["X-Request-ID"] = correlation_id
        response.headers["X-Process-Time-MS"] = str(process_time_ms)

        logger.info(
            "http_request_processed",
            status_code=response.status_code,
            duration_ms=process_time_ms
        )
        return response
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Dropping `contextvars` Across Async Calls**: Failing to clear or bind contextvars in middleware.
- ❌ **Mutating Original Headers**: Overwriting incoming correlation headers instead of preserving supplied upstream values.
- ❌ **Blocking Operations in Middleware**: Performing synchronous disk/network I/O inside `dispatch()`.

## 🔍 Verification & Testing
- **AsyncClient Correlation Test**: Pass `X-Request-ID: req-abc-123` in test request asserting response header `X-Request-ID: req-abc-123`.
