# Skill: .agent/backend/laravel/testing/pest.md

## 📌 Core Philosophy & Constraints
- **Pest PHP Testing Framework**: Use Pest PHP testing syntax (`test()`, `it()`, `expect()`) exclusively over PHPUnit.
- **Dataset Driven Testing**: Utilize `with()` datasets for multi-input test matrix coverage.
- **Fluent HTTP Assertions**: Assert API endpoints with `$response->assertStatus(200)->assertJsonStructure(...)`.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

// tests/Feature/Api/V1/CreateOrderTest.php
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use function Pest\Laravel\postJson;

beforeEach(function () {
    $this->user = User::factory()->create(['tenant_id' => 'tenant-123']);
    Sanctum::actingAs($this->user);
});

test('authenticated user can create a valid order', function () {
    $payload = [
        'item_id' => '00000000-0000-0000-0000-000000000001',
        'quantity' => 2,
    ];

    postJson('/api/v1/orders', $payload)
        ->assertStatus(201)
        ->assertJsonPath('data.quantity', 2)
        ->assertJsonStructure([
            'data' => ['id', 'status', 'created_at'],
        ]);
});

test('invalid order payload triggers 422 error', function (array $invalidData) {
    postJson('/api/v1/orders', $invalidData)
        ->assertStatus(422)
        ->assertJsonValidationErrors(array_keys($invalidData));
})->with([
    'missing item_id' => [['quantity' => 2]],
    'negative quantity' => [['item_id' => '00000000-0000-0000-0000-000000000001', 'quantity' => -1]],
]);
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Legacy PHPUnit Class Syntax**: Writing `class OrderTest extends TestCase` instead of Pest functional syntax.
- ❌ **Shared State Between Tests**: Modifying class property variables across Pest tests without `beforeEach()` reset.
- ❌ **Missing Validation Dataset Coverage**: Writing 10 separate test functions for validation errors instead of Pest datasets.

## 🔍 Verification & Testing
- **Execution Command**: `./vendor/bin/pest` asserting 100% test pass execution.
