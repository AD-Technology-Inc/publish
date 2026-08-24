## 📌 Core Philosophy & Constraints
- **Domain-Driven Organization**: Group codebase by business feature (`auth/`, `users/`), not technical layer.
- **Framework-Agnostic Core**: Business logic in `service.py` must remain completely decoupled from FastAPI HTTP routers.
- **Explicit File Boundaries**: Each domain owns its models, schemas, routers, and services.

## 📂 Standard Domain Directory Layout

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
    ├── __init__.py
    ├── conftest.py
    └── test_main.py
```

## 🏛️ Layer Responsibilities

| File / Component | Layer | Primary Responsibility |
| :--- | :--- | :--- |
| `router.py` | HTTP Boundary | Validates input HTTP requests, calls service methods, returns response schemas. |
| `service.py` | Business Logic | Framework-agnostic domain logic, database operations, and external services coordination. |
| `models.py` | Persistence | SQLAlchemy 2.0 ORM database models (`DeclarativeBase`, `Mapped[]`). |
| `schemas.py` | Contract & Validation | Pydantic V2 request/response validation schemas (`model_config = ConfigDict(...)`). |
| `dependencies.py` | Injection | Domain-specific FastAPI dependency injectors (`OAuth2PasswordBearer`, permissions). |
| `shared/exceptions.py` | Common | Custom domain exceptions (`DomainException`, `EntityNotFoundException`). |

## 🚫 Forbidden Anti-Patterns
- ❌ **Technical Layer Grouping**: Creating global `controllers/`, `services/`, and `models/` dumping ground directories.
- ❌ **Monolithic `utils.py`**: Placing un-categorized helper functions in a central `utils.py` file.
