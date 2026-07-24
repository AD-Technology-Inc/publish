# Skill: .agent/backend/laravel/architecture/controllers-and-actions.md

## 📌 Core Philosophy & Constraints
- **Thin Controllers**: Controllers MUST only handle HTTP I/O (Form Request validation, Action invocation, JsonResource return). Zero domain logic permitted.
- **Single-Purpose Action Classes**: Business operations MUST be encapsulated in invokable Action classes (`__invoke()`).
- **Laravel 12+ Conventions**: Utilize Laravel 12 routing, service providers, and strict return type hints.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\Orders\CreateOrderAction;
use App\Http\Requests\Api\V1\CreateOrderRequest;
use App\Http\Resources\V1\OrderResource;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

final class CreateOrderController
{
    public function __invoke(
        CreateOrderRequest $request,
        CreateOrderAction $action
    ): JsonResponse {
        $order = $action->execute(
            tenantId: $request->user()->tenant_id,
            payload: $request->validated()
        );

        return OrderResource::make($order)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Fat Controllers**: Writing Eloquent queries, DB transactions, or mail dispatch logic inside Controller methods.
- ❌ **Multi-Action Monolithic Controllers**: Putting 15 CRUD methods into one single `OrderController.php`.
- ❌ **Direct Input Array Access**: Accessing `$request->all()` without Form Request validation.

## 🔍 Verification & Testing
- **Pest HTTP Test**: Test route invocation asserting 201 status code and `OrderResource` JSON structure.
