# Skill: .agent/backend/laravel/testing/database-factories-mocks.md

## 📌 Core Philosophy & Constraints
- **Eloquent Factories**: All database state seeding in tests MUST use Eloquent Factories (`User::factory()`).
- **HTTP Client Fakes**: Mock third-party external APIs using `Http::fake()`.
- **Database Refreshing**: Use `use Illuminate\Foundation\Testing\RefreshDatabase;` for clean state rollbacks.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

// tests/Feature/Services/PaymentServiceTest.php
use App\Models\Order;
use App\Services\PaymentGatewayService;
use Illuminate\Support\Facades\Http;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('payment gateway processes order charge via HTTP fake', function () {
    // 1. Arrange HTTP Fake
    Http::fake([
        'https://api.stripe.com/v1/charges' => Http::response(['id' => 'ch_123', 'status' => 'succeeded'], 200),
    ]);

    // 2. Arrange Data Factory
    $order = Order::factory()->create([
        'total_amount' => 99.99,
        'status' => 'pending',
    ]);

    // 3. Act
    $service = app(PaymentGatewayService::class);
    $result = $service->chargeOrder($order);

    // 4. Assert
    expect($result)->toBeTrue();
    Http::assertSent(fn ($request) => $request->url() === 'https://api.stripe.com/v1/charges');
});
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Real Network Requests in Tests**: Executing real HTTP requests to Stripe or Twilio in test suites.
- ❌ **Raw DB Queries in Test Setup**: Inserting test records with `DB::table('users')->insert([...])` instead of model factories.
- ❌ **Hardcoded Fixed IDs**: Seeding entities with static IDs causing duplicate key collision errors on parallel test runs.

## 🔍 Verification & Testing
- **Execution Command**: `./vendor/bin/pest --parallel` verifying zero test failures under parallel execution.
