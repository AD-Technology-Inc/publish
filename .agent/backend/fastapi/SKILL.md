# Skill: .agent/backend/fastapi/SKILL.md

## 🛠️ Tech Stack

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
- ty>=0.0.59

## 📌 Core Philosophy & Constraints
- **Framework-Agnostic Core**: Keep domain and business logic isolated from HTTP routing.
- **Async First**: Utilize async handlers (`async def`) and non-blocking I/O across database operations and third-party API calls.
- **Strict Typing**: Enforce type safety using Pydantic v2 schemas and `ty` type checking.
