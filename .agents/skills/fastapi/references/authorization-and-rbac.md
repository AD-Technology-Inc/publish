# FastAPI Authorization & RBAC Permissions

## 📌 Core Philosophy & Constraints
- **Role-Based Access Control (RBAC)**: Assign permissions to roles, and roles to users (`User -> Roles -> Permissions`).
- **Granular Permission Scopes**: Use colon-separated resource permission scopes (`invoices:create`, `users:delete`).
- **Tenant Scope Guard**: Always evaluate RBAC policies within the context of the active user's `tenant_id`.

## ⚡ Production Boilerplate / Standard Pattern

```python
from typing import Annotated
from fastapi import Depends, HTTPException, status
from pydantic import BaseModel

RBAC_MATRIX: dict[str, set[str]] = {
    "admin": {"users:create", "users:read", "users:update", "users:delete", "billing:manage"},
    "manager": {"users:read", "users:update", "invoices:create"},
    "member": {"users:read"},
}

class UserContext(BaseModel):
    id: str
    tenant_id: str
    role: str

def has_permission(user_role: str, required_permission: str) -> bool:
    role_permissions = RBAC_MATRIX.get(user_role, set())
    return required_permission in role_permissions

class PermissionChecker:
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def __call__(self, current_user: UserContext) -> UserContext:
        if not has_permission(current_user.role, self.required_permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{self.required_permission}' required."
            )
        return current_user
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Hardcoded Role Checks**: Checking `if user.role == 'manager'` inline inside router handlers.
- ❌ **Cross-Tenant Data Exposure**: Granting permissions without asserting resource `tenant_id == current_user.tenant_id`.
