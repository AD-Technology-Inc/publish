# Skill: .agent/backend/fastapi/testing-and-tooling/mock-dependencies.md

## 📌 Core Philosophy & Constraints
- **Dependency Overrides**: Use `app.dependency_overrides[target_dep] = mock_dep` to replace services or auth checks in tests.
- **Fixture Cleanup**: Always clear `app.dependency_overrides.clear()` in test teardown.
- **AsyncMock Layering**: Use `unittest.mock.AsyncMock` for mocking asynchronous service dependencies.

## ⚡ Production Boilerplate / Standard Pattern

```python
import pytest
from unittest.mock import AsyncMock
from httpx import AsyncClient
from app.main import app
from app.api.deps import get_current_user

@pytest.fixture(autouse=True)
def override_auth_dependency():
    async def mock_get_current_user():
        return {"sub": "usr_test123", "tenant_id": "tenant_test123", "roles": ["admin"]}

    app.dependency_overrides[get_current_user] = mock_get_current_user
    yield
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_protected_route_with_mocked_auth(async_client: AsyncClient):
    response = await async_client.get("/api/v1/admin/dashboard")
    assert response.status_code == 200
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Monkeypatching Internal Functions**: Monkeypatching deep internal logic instead of leveraging `app.dependency_overrides`.
- ❌ **Dangling Dependency Overrides**: Failing to clear `dependency_overrides` causing test contamination across specs.
- ❌ **Mocking Non-Existent Parameters**: Overriding dependencies with incorrect function signatures.

## 🔍 Verification & Testing
- **Dependency Test**: Run test suite verifying `dependency_overrides` returns mock payload without invoking real auth check.
