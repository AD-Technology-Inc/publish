# Laravel Authorization & RBAC Policies

## 📌 Core Philosophy & Constraints
- **Laravel Policy Classes**: Define explicit resource policies for authorization checks (`OrderPolicy`).
- **Tenant Scope Guard**: Always verify `$user->tenant_id === $model->tenant_id` before granting access.

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
            && ($user->hasPermissionTo('orders:read') || $user->id === $order->user_id);
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Inline Controller Authorization**: Writing `if ($user->role !== 'admin')` directly inside controller methods.
