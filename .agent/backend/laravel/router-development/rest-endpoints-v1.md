# Skill: .agent/backend/laravel/router-development/rest-endpoints-v1.md

## 📌 Core Philosophy & Constraints
- **RESTful API Versioning**: All API routes MUST be versioned under `routes/api/v1.php` with `/api/v1/` prefix.
- **Noun-Based Endpoints**: Route paths MUST use plural nouns (`/api/v1/orders`, `/api/v1/users`).
- **Standard HTTP Verbs**: `GET` (read), `POST` (create), `PUT`/`PATCH` (update), `DELETE` (destroy).

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

// routes/api/v1.php
use App\Http\Controllers\Api\V1\CreateOrderController;
use App\Http\Controllers\Api\V1\GetOrderController;
use App\Http\Controllers\Api\V1\ListOrdersController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    Route::get('/orders', ListOrdersController::class)->name('api.v1.orders.index');
    Route::post('/orders', CreateOrderController::class)->name('api.v1.orders.store');
    Route::get('/orders/{order}', GetOrderController::class)->name('api.v1.orders.show');
});
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Verb-Based Path URLs**: Creating routes like `/api/v1/create-order` or `/api/v1/getOrders`.
- ❌ **Unversioned API Routes**: Defining API routes directly in `web.php` or omitting version prefixes.
- ❌ **Mixed Response Types**: Returning HTML views or plain text strings from API v1 routes.

## 🔍 Verification & Testing
- **Pest Route Test**: `getJson('/api/v1/orders')` asserting 200 OK and valid JSON response content-type.
