# Skill: .agent/backend/fastapi/router-development/rest-endpoints-v1.md

## 📌 Core Philosophy & Constraints
- **APIRouter Modularization**: Organize endpoints inside modular `APIRouter` instances grouped by domain feature.
- **Thin Routers**: Routers MUST only parse inputs, validate schemas, delegate to Service classes, and return response models.
- **Strict Response Models**: Specify `response_model=...` and `status_code=...` on every router decorator.

## ⚡ Production Boilerplate / Standard Pattern

```python
from fastapi import APIRouter, Depends, status, HTTPException
from app.schemas.order import CreateOrderSchema, OrderResponseSchema
from app.services.order_service import OrderService
from app.api.deps import get_order_service, get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post(
    "",
    response_model=OrderResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new tenant order"
)
async def create_order(
    payload: CreateOrderSchema,
    current_user: dict = Depends(get_current_user),
    service: OrderService = Depends(get_order_service)
) -> OrderResponseSchema:
    order = await service.create_order(
        tenant_id=current_user["tenant_id"],
        payload=payload
    )
    if not order:
        raise HTTPException(status_code=400, detail="Unable to process order request")
    return order
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Raw DB Queries in Routers**: Executing `await session.execute(select(...))` directly inside router functions.
- ❌ **Missing Response Model Typing**: Omitted `response_model` decorators causing internal schema data leaks.
- ❌ **Monolithic Router Files**: Putting 2,000 lines of disparate API routes inside a single `main.py` router file.

## 🔍 Verification & Testing
- **AsyncClient API Test**: Test endpoint with `httpx.AsyncClient` in Pytest asserting HTTP status 201 and validated JSON keys.
