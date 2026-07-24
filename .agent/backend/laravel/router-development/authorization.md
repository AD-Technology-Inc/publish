# Skill: .agent/backend/laravel/router-development/authorization.md

## 📌 Core Philosophy & Constraints
- **Policy Classes**: Enforce resource authorization via Policy classes registered in `AuthServiceProvider`.
- **Method-Level Verification**: Use `$this->authorize('update', $order)` or `$user->can('view', $order)`.
- **Resource Ownership Scoping**: Validate model tenant/user matching before granting access.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

final class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $user->tenant_id === $order->tenant_id 
            && ($user->id === $order->user_id || $user->hasRole('admin'));
    }

    public function update(User $user, Order $order): bool
    {
        return $user->tenant_id === $order->tenant_id 
            && $user->hasPermissionTo('edit-orders');
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Inline If-Role Checks**: Writing `if ($user->role === 'admin')` inside controllers instead of Policy methods.
- ❌ **Missing Policy Registration**: Invoking `$this->authorize()` without linking the Policy to the Model entity.
- ❌ **Unchecked Route Parameters**: Accessing `{order}` model bindings without triggering policy checks.

## 🔍 Verification & Testing
- **Pest Policy Test**: Test unauthorized user access to `OrderPolicy` asserting HTTP 403 Forbidden.
