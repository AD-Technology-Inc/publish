# Skill: .agent/backend/fastapi/architecture/async-pydantic-v2.md

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
- **Pydantic v2 BaseModels**: Use Pydantic v2 `ConfigDict` and `model_config = ConfigDict(strict=True, frozen=True)`.
- **Field & Annotated Validation**: Enforce field constraints using `Field()` and `Annotated`.
- **Async Execution**: Write async functions for IO operations; never block the async event loop with synchronous calls.

## ⚡ Production Boilerplate / Standard Pattern

```python
from typing import Annotated
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class OrderItemRequest(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True)

    item_id: Annotated[str, Field(min_length=1, max_length=64, description="Unique product ID")]
    quantity: Annotated[int, Field(gt=0, le=100, description="Quantity of items")]
    unit_price: Annotated[float, Field(gt=0.0, description="Price per unit")]

class CreateOrderSchema(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True)

    customer_email: EmailStr
    items: Annotated[list[OrderItemRequest], Field(min_items=1, max_items=50)]

class OrderResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    customer_email: EmailStr
    total_amount: float
    status: str
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Pydantic v1 Legacy Syntax**: Using `class Config:` or `.dict()` instead of `model_config` and `.model_dump()`.
- ❌ **Blocking I/O in Async Handlers**: Calling `time.sleep()`, synchronous `requests.get()`, or non-async DB drivers.
- ❌ **Untyped Generic Lists**: Using plain `items: list` without specifying element schema type annotations.

## 🔍 Verification & Testing
- **Pytest Schema Validation Test**: Test invalid schema inputs asserting `pydantic.ValidationError` raised with field details.
