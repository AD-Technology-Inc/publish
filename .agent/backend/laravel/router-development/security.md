# Skill: .agent/backend/laravel/router-development/security.md

## 📌 Core Philosophy & Constraints
- **Security Headers**: Inject `X-Frame-Options`, `X-Content-Type-Options`, and `Strict-Transport-Security` headers in middleware.
- **SQL Injection Prevention**: Always use Eloquent query builder or PDO parameterized bindings. Never concatenate SQL strings.
- **Strict CORS**: Configure `config/cors.php` explicitly.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class SecurityHeadersMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return $response;
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Raw DB SQL Concatenation**: Executing `DB::select("SELECT * FROM users WHERE email = '$email'")`.
- ❌ **Disabling CSRF Middleware Broadly**: Excluding entire domain paths from CSRF protection without justification.
- ❌ **Exposing Debug Traces**: Setting `APP_DEBUG=true` in production environment configuration.

## 🔍 Verification & Testing
- **Pest Header Test**: Execute API call in Pest test asserting `X-Content-Type-Options: nosniff` header is present.
