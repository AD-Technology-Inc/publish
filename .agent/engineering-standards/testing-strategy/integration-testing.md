# Skill: .agent/engineering-standards/testing-strategy/integration-testing.md

## 📌 Core Philosophy & Constraints
- **Real Component Wireup**: Integration tests MUST test HTTP routes, database interactions, and middleware together.
- **Isolated Transactions**: Database state MUST be wiped or rolled back between test runs.
- **Strict HTTP Assertions**: Assert exact status codes, JSON payload keys, and database side-effects.

## ⚡ Production Boilerplate / Standard Pattern

### FastAPI HTTP Integration Test with Pytest & AsyncClient
```python
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.models.user import User

@pytest.mark.asyncio
async def test_create_user_endpoint_integration(async_client: AsyncClient, db_session: AsyncSession):
    # Arrange
    payload = {"email": "integration@example.com", "password": "SecurePassword123!"}

    # Act
    response = await async_client.post("/api/v1/users", json=payload)

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "integration@example.com"
    assert "id" in data

    # Verify DB persistence
    db_user = await db_session.get(User, data["id"])
    assert db_user is not None
    assert db_user.email == "integration@example.com"
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Mocking DB in Integration Tests**: Mocking SQLAlchemy or Eloquent queries in an integration test suite.
- ❌ **Leaking Database State**: Leaving created rows in the test database affecting subsequent test cases.
- ❌ **Hardcoded Foreign Keys**: Inserting fixed ID numbers instead of generating relational entities dynamically.

## 🔍 Verification & Testing
- **Execution Command**: `pytest tests/integration/` (FastAPI) or `./vendor/bin/pest tests/Feature` (Laravel).
- **Environment Isolation**: Run against an isolated PostgreSQL test instance or container.
