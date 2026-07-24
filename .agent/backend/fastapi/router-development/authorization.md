# Skill: .agent/backend/fastapi/router-development/authorization.md

## 📌 Core Philosophy & Constraints
- **Permission Dependencies**: Enforce authorization checks via reusable FastAPI dependency functions (`PermissionChecker`).
- **RBAC Role Scoping**: Verify current user permissions match target endpoint scopes.
- **Tenant Data Isolation**: Assert resource `tenant_id` matches current authenticated user's `tenant_id`.

## ⚡ Production Boilerplate / Standard Pattern

```python
from typing import Callable
from fastapi import Depends, HTTPException, status
from app.api.deps import get_current_user

class PermissionChecker:
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def __call__(self, current_user: dict = Depends(get_current_user)) -> dict:
        user_permissions = current_user.get("permissions", [])
        if self.required_permission not in user_permissions and "admin" not in current_user.get("roles", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires '{self.required_permission}' permission"
            )
        return current_user

require_order_write = PermissionChecker("orders:write")
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Inline Authorization Statements**: Writing `if user.role != 'admin': raise` inside every router function.
- ❌ **Client-Controlled User Roles**: Reading user permission roles from unverified request JSON bodies.
- ❌ **Missing Tenant Ownership Check**: Returning resources without asserting `resource.tenant_id == current_user.tenant_id`.

## 🔍 Verification & Testing
- **Pytest 403 Assertion**: Test API endpoint with unauthorized user token asserting HTTP status 403 Forbidden response.
