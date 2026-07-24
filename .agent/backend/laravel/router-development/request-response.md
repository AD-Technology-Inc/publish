# Skill: .agent/backend/laravel/router-development/request-response.md

## 📌 Core Philosophy & Constraints
- **API Resource Transformers**: Always transform Eloquent model outputs through `JsonResource` or `ResourceCollection` classes.
- **Strict Data Scrubbing**: Never return raw Eloquent model instances directly (`return Order::all()`).
- **ISO-8601 Timestamps**: Format date fields explicitly using `$this->created_at->toIso8601String()`.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Http\Resources\V1;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Order */
final class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'total_amount' => (float) $this->total_amount,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Direct Eloquent Serialization**: Returning Eloquent models directly leaking hidden `$hidden` columns or unformatted timestamps.
- ❌ **Triggering N+1 in Resources**: Accessing unloaded relations inside resources without `$this->whenLoaded('items')`.
- ❌ **Untyped Resource Maps**: Transforming arrays using inline `array_map()` inside controllers instead of JsonResource collection.

## 🔍 Verification & Testing
- **Pest Resource Test**: Test `OrderResource::make($order)` asserting expected JSON dictionary keys.
