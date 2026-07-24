# Skill: .agent/engineering-standards/testing-strategy/unit-testing.md

## 📌 Core Philosophy & Constraints
- **AAA Pattern**: Every test MUST follow Arrange-Act-Assert explicitly.
- **Strict Isolation**: Unit tests MUST run in memory without real network, database, or filesystem dependencies.
- **Fast Execution**: Individual unit tests MUST execute in < 10ms.
- **Deterministic**: Tests must never rely on system clock, random seeds, or external service state.

## ⚡ Production Boilerplate / Standard Pattern

### Pytest AsyncIO Unit Test (FastAPI Service Layer)
```python
import pytest
from unittest.mock import AsyncMock
from app.services.user_service import UserService
from app.schemas.user import UserCreate

@pytest.mark.asyncio
async def test_create_user_success():
    # Arrange
    user_repo_mock = AsyncMock()
    user_repo_mock.get_by_email.return_value = None
    user_repo_mock.create.return_value = {"id": 1, "email": "test@example.com"}
    
    service = UserService(user_repository=user_repo_mock)
    payload = UserCreate(email="test@example.com", password="SecurePassword123!")

    # Act
    result = await service.register_user(payload)

    # Assert
    assert result["id"] == 1
    assert result["email"] == "test@example.com"
    user_repo_mock.get_by_email.assert_awaited_once_with("test@example.com")
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Real DB Calls in Unit Tests**: Querying live databases instead of mocking repository adapters.
- ❌ **Testing Implementation Details**: Asserting internal private state instead of public function returns/side-effects.
- ❌ **Shared Global State**: Modifying shared variables across tests without teardown fixtures.

## 🔍 Verification & Testing
- **Execution Command**: `pytest tests/unit/` or `vitest run src/components/`
- **Speed Threshold**: Assert unit test suite runs in under 5 seconds total.
