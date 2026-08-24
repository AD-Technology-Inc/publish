---
name: laravel
description: "Laravel 12+ enterprise API architecture, Sanctum, Reverb, Actions/Resources, and Pest testing guidelines."
---


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

- 🏗️ **Controllers & Actions**: [controllers-and-actions.md](./references/controllers-and-actions.md)
- 📦 **Services & Repositories**: [services-and-repositories.md](./references/services-and-repositories.md)
- 🛡️ **Middleware & Requests**: [middleware-and-requests.md](./references/middleware-and-requests.md)
- 🌐 **REST Endpoints v1**: [rest-endpoints-v1.md](./references/rest-endpoints-v1.md)
- 🔑 **Authentication & Sanctum Tokens**: [authentication-and-sanctum.md](./references/authentication-and-sanctum.md)
- 🛡️ **Authorization & RBAC Policies**: [authorization-and-rbac.md](./references/authorization-and-rbac.md)
- 🍪 **Session Security**: [session-security.md](./references/session-security.md)
- 🚦 **Rate Limiting**: [rate-limiting.md](./references/rate-limiting.md)
- 🔒 **Security Headers**: [security.md](./references/security.md)
- 🆔 **Correlation Middleware**: [middleware.md](./references/middleware.md)
- 🚨 **Error Handling**: [error-handling.md](./references/error-handling.md)
- 📄 **Request & Resources**: [request-response.md](./references/request-response.md)
- 📑 **Pagination & Filtering**: [pagination-filter-sort.md](./references/pagination-filter-sort.md)
- ⚡ **Queue Workers & Jobs**: [queue-workers-jobs.md](./references/queue-workers-jobs.md)
- 📡 **Event Listeners**: [event-listeners-subscribers.md](./references/event-listeners-subscribers.md)
- 🔌 **Reverb WebSockets**: [websockets-reverb.md](./references/websockets-reverb.md)
- 🌐 **Resilient HTTP Clients**: [resilient-http-clients.md](./references/resilient-http-clients.md)
- 🪝 **Webhook Receivers**: [webhook-receivers.md](./references/webhook-receivers.md)
- 🧪 **Pest Testing**: [pest.md](./references/pest.md)
- 🏭 **DB Factories & Fakes**: [database-factories-mocks.md](./references/database-factories-mocks.md)

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
