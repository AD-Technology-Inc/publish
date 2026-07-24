# Skill: .agent/backend/fastapi/architecture/dependency-injection.md

## 📌 Core Philosophy & Constraints
- **`Depends()` Pattern**: Inject database sessions, services, and security providers using FastAPI `Depends()`.
- **AsyncSession Yield Pattern**: Yield SQLAlchemy `AsyncSession` instances inside generator dependencies ensuring automatic cleanup/close.
- **Service Layer Injection**: Inject domain service classes directly into router endpoints.

## ⚡ Production Boilerplate / Standard Pattern

```python
from typing import AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.services.order_service import OrderService

DATABASE_URL = "postgresql+asyncpg://user:pass@localhost:5432/dbname"
engine = create_async_engine(DATABASE_URL, pool_size=20, max_overflow=10)
AsyncSessionFactory = async_sessionmaker(engine, expire_on_commit=False)

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

def get_order_service(session: AsyncSession = Depends(get_db_session)) -> OrderService:
    return OrderService(db_session=session)
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Global Unmanaged Sessions**: Instantiating a single global database session object across concurrent requests.
- ❌ **Manual Try/Finally in Routers**: Opening and closing DB connections manually inside route handler functions.
- ❌ **Ignoring Exception Rollbacks**: Yielding sessions without catching exceptions to trigger `await session.rollback()`.

## 🔍 Verification & Testing
- **Dependency Override Test**: Use `app.dependency_overrides[get_db_session] = override_db` in Pytest integration test suite.
