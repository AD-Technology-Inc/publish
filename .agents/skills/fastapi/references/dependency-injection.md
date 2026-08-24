## 📌 Core Philosophy & Constraints
- **`typing.Annotated` Dependency Injection**: Use `typing.Annotated` with `Depends()` for clear, reusable, type-safe route handler parameters.
- **AsyncSession Generator Pattern**: Yield SQLAlchemy `AsyncSession` instances inside generator dependencies ensuring automatic cleanup.
- **Explicit Transaction Context**: Prefer `async with db.begin():` (or `async_session_factory.begin()`) for atomic transactions so that `commit()` and `rollback()` are managed automatically without manual `await db.commit()`.
- **Service Layer Injection**: Inject domain service classes into router endpoints via dependencies.

## ⚡ Production Boilerplate / Standard Pattern

```python
from collections.abc import AsyncGenerator
from typing import Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.users.service import UserService

engine = create_async_engine("postgresql+asyncpg://user:pass@localhost:5432/dbname", pool_pre_ping=True)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session

async def get_tx_db(
    session: AsyncSession = Depends(get_db),
) -> AsyncGenerator[AsyncSession, None]:
    async with session.begin():
        yield session

# Type-safe annotated dependency aliases
SessionDep = Annotated[AsyncSession, Depends(get_db)]
TxSessionDep = Annotated[AsyncSession, Depends(get_tx_db)]

def get_user_service(db: SessionDep) -> UserService:
    return UserService(db=db)

UserServiceDep = Annotated[UserService, Depends(get_user_service)]

# Service execution with transactional session:
async def create_user(db: TxSessionDep, user_data: dict) -> None:
    # Transaction is automatically committed on exit or rolled back on exception
    ...
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Unannotated Raw `Depends()`**: Declaring `db: AsyncSession = Depends(get_db)` repeatedly instead of reusable `Annotated` type aliases.
- ❌ **Manual Unsafe `commit()` Calls**: Calling manual `await db.commit()` without error blocks instead of using `async with db.begin():` for automatic commit/rollback.
- ❌ **Global Unmanaged Sessions**: Instantiating a single global database session object shared across concurrent async requests.
- ❌ **Manual Try/Finally in Routers**: Opening and closing DB connections manually inside route handler functions.

## 🔍 Verification & Testing
- **Dependency Override Test**: Use `app.dependency_overrides[get_db] = override_get_db` in Pytest integration test suites.
