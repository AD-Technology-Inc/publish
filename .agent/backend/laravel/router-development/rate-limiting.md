# Skill: .agent/backend/laravel/router-development/rate-limiting.md

## 📌 Core Philosophy & Constraints
- **RateLimiter Facade**: Define rate limits in `AppServiceProvider` using `RateLimiter::for()`.
- **Dynamic Throttle Keys**: Limit requests by IP address or authenticated user ID (`$request->user()?->id ?: $request->ip()`).
- **Standard Headers**: Return `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers on HTTP responses.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

// app/Providers/AppServiceProvider.php
namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by(
                $request->user()?->id ?: $request->ip()
            )->response(function () {
                return response()->json([
                    'message' => 'Too many requests. Please slow down.',
                '], 429);
            });
        });
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Unthrottled Authentication Routes**: Leaving `/login` endpoints without rate limiting leading to brute-force vulnerability.
- ❌ **Static Global Keys**: Using fixed rate limit keys (`'global'`) throttling all application users together.
- ❌ **Missing 429 Payload Handler**: Returning raw HTML 429 error pages from JSON API throttle limits.

## 🔍 Verification & Testing
- **Pest Throttle Test**: Execute 61 rapid requests in Pest test asserting HTTP status 429 Too Many Requests on 61st call.
