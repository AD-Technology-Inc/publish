# Skill: .agent/backend/laravel/architecture/services-and-repositories.md

## 📌 Core Philosophy & Constraints
- **Service Layer Encapsulation**: Complex multi-step business transactions MUST be handled in Service classes inside `DB::transaction()`.
- **Repository Interface Abstraction**: Decouple Eloquent persistence logic behind interface contracts when multiple storage adapters or caching are required.
- **Strict Return Types**: Methods MUST declare explicit parameters and return type hints.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Order;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

final class OrderProcessingService
{
    public function __construct(
        private readonly OrderRepositoryInterface $orderRepository
    ) {}

    public function processOrder(string $tenantId, array $data): Order
    {
        return DB::transaction(function () use ($tenantId, $data) {
            $order = $this->orderRepository->create(array_merge($data, [
                'tenant_id' => $tenantId,
                'status' => 'processing',
            ]));

            if ($order->total_amount <= 0) {
                throw new InvalidArgumentException('Order total amount must be positive.');
            }

            return $order;
        });
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **DB Queries in Controllers or Views**: Executing `Order::where(...)` outside Service/Repository layers.
- ❌ **Unprotected Multi-Table Mutations**: Updating multiple DB tables without wrapping operations in `DB::transaction()`.
- ❌ **Hardcoded Class Dependencies**: Instantiating concrete repositories with `new OrderRepository()` instead of interface DI.

## 🔍 Verification & Testing
- **Pest Unit Test**: Mock `OrderRepositoryInterface` testing `OrderProcessingService` exception handling.
