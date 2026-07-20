# Database Transaction Isolation & Boundaries

## Purpose
This document specifies the database transaction boundaries, isolation levels, and concurrency semantics used in **AD. Publish**.

---

## Transaction Layer Overview

**AD. Publish** maintains two distinct database transaction patterns depending on the context:

1. **Async REST Microservices (e.g. Identity Service)**:
   - Built on SQLAlchemy 2.0 with `asyncpg` async sessions (`AsyncSession`).
   - Uses explicit `await session.commit()` and `await session.rollback()` blocks.
   - Enforces PostgreSQL `READ COMMITTED` isolation level by default.
   - Converts `IntegrityError` (e.g. `UniqueViolationError` on duplicate username/email) into structured `HTTP 400 Bad Request` responses using custom exception handlers (`app/main.py`).

2. **Synchronous Worker Checkpointing (`StateManager`)**:
   - Built on synchronous `psycopg2` driver.
   - Uses auto-committing context managers (`with psycopg2.connect() as conn:`).
   - Executes atomic single-statement SQL upserts (`INSERT ... ON CONFLICT DO UPDATE`).

---

## Error Handling & Exception Translation (`services/identity-service/app/main.py`)

```python
@app.exception_handler(IntegrityError)
async def integrity_error_handler(request, exc: IntegrityError):
    message = str(exc.orig)
    detail = "Database integrity violation"
    if "DETAIL:" in message:
        detail = message.split("DETAIL:")[-1].strip()
    elif "duplicate key" in message:
        detail = "Duplicate entry detected"

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST, content={"detail": detail}
    )
```

---

## Transaction Boundary Safety Rules

1. **No Distributed Transactions Across Services**: Cross-service operations (e.g. Social Post $\rightarrow$ Social Publish) DO NOT share a database transaction. Isolation is maintained via Redis Stream event payloads and idempotency keys.
2. **Explicit Session Rollbacks**: In async microservice routes, any unhandled error triggers an automatic rollback of the active `AsyncSession` before raising the HTTP exception.
