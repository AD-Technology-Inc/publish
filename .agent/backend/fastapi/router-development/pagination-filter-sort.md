# Skill: .agent/backend/fastapi/router-development/pagination-filter-sort.md

## 📌 Core Philosophy & Constraints
- **Generic Pagination Container**: Wrap paginated lists in a generic `PageResponse[T]` schema.
- **Allowed Query Sorting**: Whitelist sortable database columns to prevent SQL injection or un-indexed queries.
- **SQLAlchemy 2.0 Async Limit/Offset**: Execute `select().offset().limit()` or cursor filters asynchronously.

## ⚡ Production Boilerplate / Standard Pattern

```python
from typing import Generic, TypeVar
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order
from app.api.deps import get_db_session

T = TypeVar("T")

class PageResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    size: int

router = APIRouter()
ALLOWED_SORT_FIELDS = {"created_at": Order.created_at, "total_amount": Order.total_amount}

@router.get("/orders", response_model=PageResponse[dict])
async def list_orders(
    page: int = Query(1, ge=1),
    size: int = Query(15, ge=1, le=100),
    sort_by: str = Query("created_at"),
    db: AsyncSession = Depends(get_db_session)
):
    sort_column = ALLOWED_SORT_FIELDS.get(sort_by, Order.created_at)
    offset = (page - 1) * size

    count_stmt = select(func.count()).select_from(Order)
    total_result = await db.execute(count_stmt)
    total = total_result.scalar_one()

    stmt = select(Order).order_by(sort_column.desc()).offset(offset).limit(size)
    result = await db.execute(stmt)
    orders = result.scalars().all()

    return PageResponse(
        items=[{"id": o.id, "total_amount": o.total_amount} for o in orders],
        total=total,
        page=page,
        size=size
    )
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Unbounded Queries**: Executing `await db.execute(select(Order))` without `.limit()` clause.
- ❌ **Unsanitized Column Strings in `order_by`**: Passing arbitrary user string inputs into `order_by(text(sort_by))`.
- ❌ **Unbound Page Sizes**: Allowing client query parameters like `?size=1000000`.

## 🔍 Verification & Testing
- **Pytest Pagination Limits**: Send `?size=5` in test request asserting length of `items` array is <= 5.
