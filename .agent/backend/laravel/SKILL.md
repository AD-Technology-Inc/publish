# Skill: .agent/backend/laravel/SKILL.md

# Laravel 12 Backend Framework Skill Registry

This document serves as the master decision matrix and architecture reference for AI agents building scalable, high-reliability enterprise APIs and microservices using Laravel 12+.

---

## 🛠️ Tech Stack & Version Manifest

- **Language / Runtime**: PHP 8.2 / 8.3 / 8.4 (Strict Types `declare(strict_types=1);`)
- **Core Framework**: Laravel 12+
- **Authentication**: Laravel Sanctum 4.x (Bearer Tokens & SPA Sessions)
- **WebSockets / Real-Time**: Laravel Reverb 1.x (Native WebSocket Server)
- **Testing Framework**: Pest PHP 4.x (Functional & Dataset-Driven Syntax)
- **Static Analysis**: PHPStan 2.x (Level 8+ Strictness)
- **Cache & Queue Broker**: Redis 8.6 (`redis:8.6-alpine`)

---

## 🔗 Sub-Skill Deep Dive References

- 🏗️ **Controllers & Actions**: [controllers-and-actions.md](./architecture/controllers-and-actions.md)
- 📦 **Services & Repositories**: [services-and-repositories.md](./architecture/services-and-repositories.md)
- 🛡️ **Middleware & Requests**: [middleware-and-requests.md](./architecture/middleware-and-requests.md)
- 🌐 **REST Endpoints v1**: [rest-endpoints-v1.md](./router-development/rest-endpoints-v1.md)
- 🔐 **Authorization Policies**: [authorization.md](./router-development/authorization.md)
- 🔑 **Sanctum Authentication**: [authentication.md](./router-development/authentication.md)
- 🚦 **Rate Limiting**: [rate-limiting.md](./router-development/rate-limiting.md)
- 🔒 **Security Headers**: [security.md](./router-development/security.md)
- 🆔 **Correlation Middleware**: [middleware.md](./router-development/middleware.md)
- 🚨 **Error Handling**: [error-handling.md](./router-development/error-handling.md)
- 📄 **Request & Resources**: [request-response.md](./router-development/request-response.md)
- 📑 **Pagination & Filtering**: [pagination-filter-sort.md](./router-development/pagination-filter-sort.md)
- ⚡ **Queue Workers & Jobs**: [queue-workers-jobs.md](./async-events-jobs/queue-workers-jobs.md)
- 📡 **Event Listeners**: [event-listeners-subscribers.md](./async-events-jobs/event-listeners-subscribers.md)
- 🔌 **Reverb WebSockets**: [websockets-reverb.md](./async-events-jobs/websockets-reverb.md)
- 🧪 **Pest Testing**: [pest.md](./testing/pest.md)
- 🏭 **DB Factories & Fakes**: [database-factories-mocks.md](./testing/database-factories-mocks.md)

---

## 🧭 1. Laravel Architecture & Decision Matrix

| Layer / Responsibility | Standard Class Type | Architectural Rule |
| :--- | :--- | :--- |
| **HTTP Layer** | Invokable Controllers (`__invoke`) | Thin controllers only. Validate input, call Action, return `JsonResource`. |
| **Business Operations** | Single-Purpose Action Classes | Encapsulate business logic inside invokable classes (`CreateOrderAction`). |
| **Input Validation** | Form Requests (`FormRequest`) | Isolate validation rules & authorization logic in dedicated request objects. |
| **Response Format** | JSON Resources (`JsonResource`) | Transform Eloquent models into explicit JSON schemas (`OrderResource`). |
| **Background Processing** | Queueable Jobs (`ShouldQueue`) | Offload heavy I/O and external API calls to Redis background workers. |
| **Exception Handling** | `bootstrap/app.php` | Handle exceptions centrally returning RFC 7807 Problem Details. |
| **Automated Testing** | Pest 4.x Test Suites | Write functional feature tests using `test()`, `expect()`, and `beforeEach()`. |

---

## 🛠️ 2. Production Code Standard Pattern

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
            data: $request->validated()
        );

        return OrderResource::make($order)
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
```

---

## 🚫 Forbidden Anti-Patterns

- ❌ **Fat Controllers**: Writing raw Eloquent queries or business logic directly inside HTTP controller methods.
- ❌ **Legacy PHPUnit Class Syntax**: Writing `class OrderTest extends TestCase` instead of Pest 4.x functional syntax (`test()`, `expect()`).
- ❌ **Unprotected API Endpoints**: Omitting Sanctum bearer token middleware or authorization policies on sensitive mutations.
- ❌ **Direct Database Writes in Routes**: Executing database mutations directly inside `routes/api.php` closures.

---

## 🔍 Verification & Quality Assurance

- **Pest 4 Test Execution**: `./vendor/bin/pest` verifying 100% pass rate under parallel execution (`--parallel`).
- **PHPStan Static Analysis**: `./vendor/bin/phpstan analyse --level=8` verifying strict type hints across all Action classes.
