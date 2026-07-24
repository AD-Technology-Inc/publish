# Skill: .agent/backend/shared/authentication-authz/rbac-permissions.md

## 📌 Core Philosophy & Constraints
- **Role-Based Access Control (RBAC)**: Assign permissions to roles, and roles to users (`User -> Roles -> Permissions`).
- **Granular Permission Scopes**: Use colon-separated resource permission scopes (`invoices:create`, `users:delete`).
- **Tenant Scope Guard**: Always evaluate RBAC policies within the context of the user's `tenant_id`.

## ⚡ Production Boilerplate / Standard Pattern

```python
# Shared RBAC Policy Checker Matrix
RBAC_MATRIX: dict[str, set[str]] = {
    "admin": {"users:create", "users:read", "users:update", "users:delete", "billing:manage"},
    "manager": {"users:read", "users:update", "invoices:create"},
    "member": {"users:read"},
}

def has_permission(user_role: str, required_permission: str) -> bool:
    role_permissions = RBAC_MATRIX.get(user_role, set())
    return required_permission in role_permissions
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Hardcoded Role Strings in Business Logic**: Checking `if user.role == 'manager'` instead of `has_permission(user.role, 'invoices:create')`.
- ❌ **Global Cross-Tenant Permissions**: Granting admin rights across all tenants instead of restricting role scope to a single `tenant_id`.
- ❌ **Unverified Role Escalation**: Allowing API clients to update their own role property via profile edit forms.

## 🔍 Verification & Testing
- **RBAC Matrix Test**: Unit test matrix inputs asserting `'member'` role cannot access `'billing:manage'` scope.
