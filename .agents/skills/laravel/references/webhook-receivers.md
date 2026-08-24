## 📌 Core Philosophy & Constraints
- **HMAC Signature Verification**: Always verify incoming webhook signatures using `hash_equals()` and HMAC-SHA256.
- **Immediate ACK & Async Queue**: Return HTTP 200 OK immediately and dispatch payload to background Queue Workers (`ShouldQueue`).
- **Idempotent Execution**: Check `webhook_calls` or Redis key event IDs to prevent duplicate webhook processing.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Jobs\ProcessWebhookJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final class StripeWebhookController
{
    public function __invoke(Request $request): JsonResponse
    {
        $signature = $request->header('X-Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        $computed = hash_hmac('sha256', $request->getContent(), $secret);

        if (! hash_equals($computed, (string) $signature)) {
            return response()->json(['error' => 'Invalid signature'], Response::HTTP_UNAUTHORIZED);
        }

        ProcessWebhookJob::dispatch($request->input('id'), $request->all());

        return response()->json(['status' => 'queued'], Response::HTTP_OK);
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Unverified Webhook Requests**: Processing webhook payloads without verifying HMAC cryptographic signatures.
- ❌ **Synchronous Execution in Controller**: Running database updates or third-party calls directly inside the webhook HTTP handler.
- ❌ **Insecure Signature Equality**: Using `==` instead of `hash_equals()` exposing signature timing attacks.

## 🔍 Verification & Testing
- **Pest Webhook Test**: Dispatch HTTP request with valid HMAC signature in Pest asserting `ProcessWebhookJob::assertPushed()`.
