# Skill: .agent/backend/fastapi/router-development/request-response.md

## 📌 Core Philosophy & Constraints
- **Pydantic Response Filtering**: Filter database attributes automatically using `response_model=OutputSchema`.
- **Strict Input Models**: Separate create/update request schemas from output response schemas.
- **Custom Encoders**: Use Pydantic `@field_serializer` for ISO-8601 datetimes and UUID string conversions.

## ⚡ Production Boilerplate / Standard Pattern

```python
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_serializer

class UserCreateSchema(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True)

    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8)

class UserResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    is_active: bool
    created_at: datetime

    @field_serializer("created_at")
    def serialize_dt(self, dt: datetime, _info) -> str:
        return dt.isoformat()

    @field_serializer("id")
    def serialize_uuid(self, uid: UUID, _info) -> str:
        return str(uid)
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Returning SQLAlchemy Models Directly**: Returning raw ORM model instances without `response_model` filtering.
- ❌ **Reusing Create Schemas for Output**: Using input schemas that accept `password` fields to format HTTP response outputs.
- ❌ **Manual Dictionary Building**: Returning untyped Python dicts (`return {"id": user.id, "email": user.email}`) in router functions.

## 🔍 Verification & Testing
- **Pytest Response Filter Test**: Test router response asserting `password` field is excluded from output JSON dictionary.
