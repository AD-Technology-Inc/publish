# Skill: .agent/engineering-standards/saas-architecture/multi-tenancy.md

## 📌 Core Philosophy & Constraints
- **Strict Data Isolation**: No database query MUST ever return cross-tenant data.
- **Tenant Context Injection**: Tenant ID MUST be extracted from authenticated JWT claims or domain context, never trusted directly from unverified request body parameters.
- **Mandatory Foreign Key**: All tenant-scoped database tables MUST include an indexed `tenant_id` column.

## ⚡ Production Boilerplate / Standard Pattern

### SQLAlchemy 2.0 Tenant-Scoped Base Query Pattern
```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.invoice import Invoice

class TenantScopedRepository:
    def __init__(self, db: AsyncSession, tenant_id: str):
        self.db = db
        self.tenant_id = tenant_id

    async def get_invoice_by_id(self, invoice_id: int) -> Invoice | None:
        stmt = (
            select(Invoice)
            .where(Invoice.id == invoice_id)
            .where(Invoice.tenant_id == self.tenant_id)  # Mandatory tenant scoping
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Unscoped SQL Selects**: Executing `select(Invoice).where(Invoice.id == id)` without appending `tenant_id` criteria.
- ❌ **Client-Provided Tenant IDs**: Allowing API requests to pass `?tenant_id=XYZ` to access resources without token verification.
- ❌ **Shared In-Memory Caches**: Caching tenant records under generic keys without namespace prefixes (e.g. `cache:invoice:1` instead of `tenant_id:invoice:1`).

## 🔍 Verification & Testing
- **Cross-Tenant Access Test**: Unit test attempting to fetch Tenant A's record using Tenant B's session, asserting `404 Not Found` or `None`.
- **Schema Linting**: Migration check asserting all new domain models define `tenant_id` foreign key.
