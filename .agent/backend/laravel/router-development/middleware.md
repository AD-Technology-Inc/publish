# Skill: .agent/backend/laravel/router-development/middleware.md

## 📌 Core Philosophy & Constraints
- **Correlation ID Middleware**: Assign and propagate `X-Request-ID` UUID headers across request lifecycles.
- **Request Context Binding**: Store trace IDs in Log context to bind every log entry to the active request.
- **Laravel 12 Bootstrap**: Register global middleware in `bootstrap/app.php`.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

final class CorrelationIdMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $correlationId = $request->header('X-Request-ID') ?? (string) Str::uuid();

        $request->headers->set('X-Request-ID', $correlationId);
        Log::shareContext(['correlation_id' => $correlationId]);

        /** @var Response $response */
        $response = $next($request);
        $response->headers->set('X-Request-ID', $correlationId);

        return $response;
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Dropping Trace Headers**: Overwriting incoming `X-Request-ID` headers with newly generated UUIDs.
- ❌ **Inline Middleware Logic in Controllers**: Embedding request timing or correlation logging directly inside controller methods.
- ❌ **Modifying Sealed Request Objects**: Overwriting `$request` parameters destructively without `$request->merge()`.

## 🔍 Verification & Testing
- **Pest Header Propagation**: Send `X-Request-ID: test-123` header in Pest request asserting response contains `X-Request-ID: test-123`.
