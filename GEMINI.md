# Project Context

## Purpose

This project is a production-ready backend API built with FastAPI. The architecture prioritizes maintainability, scalability, type safety, and clear domain separation. All business logic should remain framework-agnostic and organized by domain.

## Tech Stack

- Python 3.12+
- FastAPI
- SQLAlchemy 2.0 (Async)
- Alembic
- PostgreSQL
- Pydantic v2
- uv (Package Management)
- Pytest
- Ruff

## Project Structure

```text
pyproject.toml
app/
├── src/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   │
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── router.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   ├── service.py
│   │   └── dependencies.py
│   │
│   ├── users/
│   │   ├── __init__.py
│   │   ├── router.py
│   │   ├── schemas.py
│   │   ├── models.py
│   │   └── service.py
│   │
│   └── shared/
│       ├── __init__.py
│       └── exceptions.py
│
└── tests/
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

- Defines API endpoints.
- Handles request validation and response serialization.
- Delegates business logic to services.
- Must remain thin.

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

- Use SQLAlchemy 2.0 async engine.
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

- Use dependency injection.
- Prefer async endpoints.
- Return typed response models.
- Keep route handlers lightweight.

### SQLAlchemy

- Use SQLAlchemy 2.0 style APIs.
- Prefer select() statements.
- Avoid legacy query syntax.
- Use async database sessions.

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

- Do not modify Alembic migrations without explicit instruction.
- Do not commit secrets or credentials.
- Do not place business logic in routers.
- Do not use synchronous database sessions.
- Do not bypass Pydantic validation.
- Do not introduce unnecessary abstractions.
- Do not use wildcard imports.
- Do not use global mutable state.
- Do not expose internal database models in API responses.
- Do not ignore type errors without justification.