## 📌 Core Philosophy & Constraints
- **Laravel Http Facade**: Use Laravel `Http::timeout()` and `Http::retry()` for all outbound HTTP communications.
- **Strict Outbound Timeouts**: Configure connect timeouts (2s) and request timeouts (5s).
- **Exponential Backoff & Retries**: Retry on 5xx server errors or connection exceptions with randomized backoff.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\RequestException;

final class ResilientPaymentClient
{
    public function sendChargePayload(string $endpoint, array $payload): array
    {
        return Http::baseUrl('https://api.payment-gateway.com/v1')
            ->timeout(5)
            ->connectTimeout(2)
            ->retry(3, 100, function (\Exception $exception) {
                return $exception instanceof RequestException && $exception->response->failed();
            })
            ->post($endpoint, $payload)
            ->throw()
            ->json();
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Unbounded Outbound Requests**: Calling `Http::get()` without setting an explicit timeout value.
- ❌ **Retrying Client 4xx Errors**: Retrying HTTP 400 or 401 client validation errors.
- ❌ **Using Raw cURL or `file_get_contents`**: Bypassing Laravel `Http` client facade which prevents test mocking.

## 🔍 Verification & Testing
- **Pest Http Fake Test**: Use `Http::fake()` in Pest test suite to mock external timeouts and assert retry counts.
