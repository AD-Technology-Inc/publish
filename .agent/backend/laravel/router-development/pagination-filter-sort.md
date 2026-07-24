# Skill: .agent/backend/laravel/router-development/pagination-filter-sort.md

## 📌 Core Philosophy & Constraints
- **Cursor & Length-Aware Pagination**: Use `$query->cursorPaginate()` for high-volume datasets or `$query->paginate()` for standard paginated UI grids.
- **Allowed Query Filtering**: Whitelist valid filterable/sortable columns to prevent arbitrary SQL column injection.
- **Default Page Limits**: Enforce maximum page size limit (`min($request->integer('per_page', 15), 100)`).

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\V1\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class ListOrdersController
{
    private const ALLOWED_SORTS = ['created_at', 'total_amount'];

    public function __invoke(Request $request): AnonymousResourceCollection
    {
        $perPage = min($request->integer('per_page', 15), 100);
        $sortField = in_array($request->query('sort'), self::ALLOWED_SORTS, true) 
            ? $request->query('sort') 
            : 'created_at';
        $sortDirection = $request->query('direction') === 'asc' ? 'asc' : 'desc';

        $orders = Order::query()
            ->where('tenant_id', $request->user()->tenant_id)
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->orderBy($sortField, $sortDirection)
            ->cursorPaginate($perPage);

        return OrderResource::collection($orders);
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Unbounded `.get()` Returns**: Executing `Order::all()` or `Order::get()` without pagination constraints.
- ❌ **Raw Column Names in `orderBy`**: Passing user input directly into `$query->orderBy($request->input('sort'))` without whitelist validation.
- ❌ **Offset Pagination on Millions of Rows**: Using `.skip(100000)->take(15)` causing high database scan overhead instead of cursor pagination.

## 🔍 Verification & Testing
- **Pest Pagination Test**: Request `/api/v1/orders?per_page=5` asserting metadata contains `next_cursor` or `next_page_url`.
