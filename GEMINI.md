# Project Context

## Purpose

This project is a backend application built with FastAPI. The architecture prioritizes maintainability, scalability, type safety, and clear domain separation. All business logic should remain framework-agnostic and organized by domain.

## Tech Stack

- Python >=3.12
- fastapi[standard]>=0.136.0
- sqlalchemy[asyncio]>=2.0.51
- alembic>=1.18.5
- asyncpg>=0.31.0
- PostgreSQL>=18.x
- pydantic>=2.x
- pydantic-settings>=2.x
- uv>=0.11.26
- pytest>=9.1.1
- pytest-asyncio>=1.x
- httpx>=0.28.1
- ruff>=0.15.20
- mypy>=2.x

## Project Structure

```text
pyproject.toml
app/
├── __init__.py
├── main.py
├── config.py
├── database.py
├── auth/
│   ├── __init__.py
│   ├── router.py
│   ├── schemas.py
│   ├── models.py
│   ├── service.py
│   └── dependencies.py
├── users/
│   ├── __init__.py
│   ├── router.py
│   ├── schemas.py
│   ├── models.py
│   └── service.py
└── shared/
    ├── __init__.py
    └── exceptions.py
tests/
    └── test_main.py
```

## Architecture

### Domain-Driven Organization

Organize code by business domain, not by technical layer.
Each domain owns its:

- router.py
- schemas.py
- models.py
- service.py
- dependencies.py (if needed)

### Layer Responsibilities

#### Router Layer

- Defines v1 API endpoints.
- Handles request validation and response serialization.
- Delegates business logic to services.
- Must remain thin.
- Maps HTTP requests to the appropriate service methods while maintaining API version compatibility.

#### Service Layer

- Contains all business logic.
- Coordinates repositories, database operations, and external services.
- Should be independently testable.

#### Model Layer

- Contains SQLAlchemy ORM models.
- Responsible only for persistence representation.

#### Schema Layer

- Contains Pydantic request and response models.
- Used for validation and serialization.

### Database

- Use SQLAlchemy 2.0 with the async engine.
- Use asyncpg as the PostgreSQL driver.
- Use AsyncSession exclusively.
- Database sessions should be dependency-injected.
- Use Alembic for schema migrations.

### Shared Components

- Common exceptions belong in shared/exceptions.py.
- Shared utilities should remain generic and reusable.
- Avoid creating a large "utils.py" dumping ground.

## Coding Standards

### Python

- Target Python 3.12+.
- Use type hints everywhere.
- Prefer explicit types over Any.
- Use modern Python syntax and standard library features.

### Formatting & Linting

- Ruff for linting and formatting.
- Code must pass linting before completion.
- Maintain consistent import ordering.

### Typing

- Enforce strict Ruff linting rules for code quality and type-related issues.
- Avoid type: ignore unless absolutely necessary.
- Public functions must have explicit return types.

### FastAPI

- Use dependency injection with `typing.Annotated` for clear, type-safe annotations (e.g., `db: Annotated[AsyncSession, Depends(get_db)]`).
- Prefer async endpoints.
- Return typed response models using Pydantic schemas.
- Keep route handlers lightweight and delegate business logic to services.

### SQLAlchemy

- Use SQLAlchemy 2.0 style APIs and `select()` statements.
- Use async database sessions (`AsyncSession` and `async_sessionmaker`) exclusively.
- Implement the async database session factory pattern:
  ```python
  from collections.abc import AsyncGenerator
  from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

  engine = create_async_engine(DATABASE_URL, pool_pre_ping=True)
  async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

  async def get_db() -> AsyncGenerator[AsyncSession, None]:
      async with async_session_maker() as session:
          yield session
  ```

### Configuration Management

- Use `pydantic-settings` to specify configuration and environment variables explicitly.
- Define settings classes inheriting from `BaseSettings`:
  ```python
  from pydantic_settings import BaseSettings, SettingsConfigDict

  class Settings(BaseSettings):
      model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

      database_url: str
      secret_key: str
  ```
- Store settings objects in a single configuration entrypoint (e.g., `config.py`).

### Error Handling

- Raise domain-specific exceptions.
- Convert exceptions to HTTP responses at the API boundary.
- Avoid broad exception catching.

## Testing Standards

### Test Requirements

- Every new feature should include tests.
- Cover both success and failure paths.
- Prefer isolated unit tests for business logic.

### Test Organization

- Mirror source structure inside tests/.
- Use descriptive test names.
- Follow Arrange-Act-Assert pattern.

### Coverage

- Business logic should have high test coverage.
- Critical authentication and authorization paths must be tested.

## API Design Guidelines

### REST Principles

- Use resource-oriented endpoints.
- Use appropriate HTTP status codes.
- Keep naming consistent.

### Request/Response Models

- Always use Pydantic schemas.
- Never expose ORM models directly.
- Separate create, update, and response schemas.
- Use Pydantic V2 config style via `model_config = ConfigDict(from_attributes=True)`.

### Validation

- Validate input at the schema level.
- Keep validation close to the data it protects.

## Security

### Authentication

- Use dependency-based authentication.
- Protect sensitive endpoints.
- Validate user permissions explicitly.

### Secrets

- Store secrets in environment variables.
- Never hardcode credentials.
- Never commit secrets.

### Database Safety

- Use parameterized queries through SQLAlchemy.
- Avoid raw SQL unless necessary.

## Dependencies

### Package Management

- Use uv for dependency management.
- Prefer actively maintained packages.
- Keep dependencies minimal.

### Adding Dependencies

- Justify new dependencies.
- Prefer standard library solutions when reasonable.
- Avoid overlapping libraries.

## Agent Instructions

- Follow the defined project structure.
- Maintain clear domain boundaries.
- Generate type-safe code.
- Prefer async implementations.
- Write maintainable and production-ready solutions.
- Explain significant architectural decisions.
- Generate tests for new features.
- Reuse existing patterns before introducing new ones.
- Keep API handlers thin and business logic in services.
- Ask before making breaking architectural changes.

## Forbidden

- DO NOT modify Alembic migrations without explicit instruction.
- DO NOT commit secrets or credentials.
- DO NOT place business logic in routers.
- DO NOT use synchronous database sessions.
- DO NOT bypass Pydantic validation.
- DO NOT introduce unnecessary abstractions.
- DO NOT use wildcard imports.
- DO NOT use global mutable state.
- DO NOT expose internal database models in API responses.
- DO NOT ignore type errors without justification.

