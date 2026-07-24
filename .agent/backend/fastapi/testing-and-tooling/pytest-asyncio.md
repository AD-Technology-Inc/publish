# Skill: .agent/backend/fastapi/testing-and-tooling/pytest-asyncio.md

## 📌 Core Philosophy & Constraints
- **Pytest AsyncIO Suite**: Use `@pytest.mark.asyncio` for async test cases.
- **HTTPX AsyncClient Fixtures**: Use `httpx.AsyncClient` for testing FastAPI routes.
- **Scope-Isolated Fixtures**: Use `async_session` fixture yielding clean database state per test.

## ⚡ Production Boilerplate / Standard Pattern

```python
# tests/conftest.py
import pytest
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"

@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client

# tests/test_orders.py
import pytest

@pytest.mark.asyncio
async def test_create_order(async_client: AsyncClient):
    response = await async_client.post(
        "/api/v1/orders",
        json={"customer_email": "test@example.com", "items": [{"item_id": "item1", "quantity": 1, "unit_price": 10.0}]}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["customer_email"] == "test@example.com"
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Using Synchronous `TestClient` for Async Endpoints**: Testing async endpoints with `starlette.testclient.TestClient` causing deadlocks.
- ❌ **Shared Database State**: Leaking created records across tests without fixture teardowns.
- ❌ **Missing Asyncio Marker**: Forgetting `@pytest.mark.asyncio` on `async def test_xxx()` functions.

## 🔍 Verification & Testing
- **Execution Command**: `pytest tests/` asserting clean async test passes.
