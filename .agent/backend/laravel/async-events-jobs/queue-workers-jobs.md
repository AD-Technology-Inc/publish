# Skill: .agent/backend/laravel/async-events-jobs/queue-workers-jobs.md

## 📌 Core Philosophy & Constraints
- **ShouldQueue Interface**: Offload heavy or external operations (email, webhooks, processing) to queued jobs (`ShouldQueue`).
- **Redis Queue Driver**: Standardize background worker queue connections on Redis.
- **Explicit Backoff & Max Tries**: Always specify `$tries`, `$backoff`, and `$timeout` on Job classes.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Order;
use App\Services\PaymentGatewayService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

final class ProcessPaymentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(
        public readonly Order $order
    ) {}

    public function backoff(): array
    {
        return [5, 30, 120]; // Exponential backoff in seconds
    }

    public function handle(PaymentGatewayService $paymentService): void
    {
        $paymentService->chargeOrder($this->order);
    }

    public function failed(Throwable $exception): void
    {
        $this->order->update(['status' => 'payment_failed']);
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Synchronous Heavy External Calls**: Calling slow payment gateways directly inside HTTP request controllers.
- ❌ **Missing Retries / Backoff**: Creating queued jobs without configuring `$tries` or `$backoff` rules.
- ❌ **Passing Huge In-Memory Models**: Passing large un-serialized objects instead of using `SerializesModels` with Model references.

## 🔍 Verification & Testing
- **Pest Queue Fake**: Use `Queue::fake()` in Pest tests asserting `ProcessPaymentJob::dispatch()` was called.
