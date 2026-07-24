# Skill: .agent/backend/laravel/router-development/error-handling.md

## 📌 Core Philosophy & Constraints
- **Standardized Exception Handling**: Format exception responses centrally via `bootstrap/app.php` exception handler.
- **RFC 7807 Problem Details**: Return JSON error payloads containing `status`, `title`, `detail`, and `instance`.
- **Zero Traces in Production**: Hide stack traces completely when `APP_DEBUG=false`.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

// bootstrap/app.php (Laravel 12 Exception Handler Configuration)
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'type' => 'https://tools.ietf.org/html/rfc7231#section-6.5.4',
                    'title' => 'Resource Not Found',
                    'status' => 404,
                    'detail' => 'The requested resource could not be found.',
                    'instance' => $request->path(),
                ], 404, ['Content-Type' => 'application/problem+json']);
            }
        });
    })->create();
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Try/Catch Swallowing in Controllers**: Catching exceptions inside controller actions and returning dummy status 200 payloads.
- ❌ **Leaking Internal Stack Traces**: Exposing PHP file paths or line numbers to API clients.
- ❌ **Inconsistent Status Codes**: Returning status 500 for validation errors instead of status 422.

## 🔍 Verification & Testing
- **Pest Exception Test**: Request non-existent API endpoint in Pest test asserting HTTP status 404 and problem+json response structure.
