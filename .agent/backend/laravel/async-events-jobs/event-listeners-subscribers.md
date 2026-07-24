# Skill: .agent/backend/laravel/async-events-jobs/event-listeners-subscribers.md

## 📌 Core Philosophy & Constraints
- **Domain Event Decoupling**: Fire domain events (`OrderCreated`) to decouple core business logic from auxiliary actions (analytics, notifications).
- **Queued Listeners**: Implement `ShouldQueue` on event listeners for asynchronous execution.
- **Event Subscribers**: Group related event handlers using Event Subscriber classes.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class OrderCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Order $order
    ) {}
}

namespace App\Listeners;

use App\Events\OrderCreated;
use App\Notifications\OrderConfirmationNotification;
use Illuminate\Contracts\Queue\ShouldQueue;

final class SendOrderNotification implements ShouldQueue
{
    public function handle(OrderCreated $event): void
    {
        $event->order->user->notify(
            new OrderConfirmationNotification($event->order)
        );
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Tightly Coupled Side Effects**: Writing notification email code directly in the order creation service action.
- ❌ **Synchronous Heavy Listeners**: Omitting `ShouldQueue` on event listeners executing external HTTP calls.
- ❌ **Modifying Event Data in Listeners**: Mutating event payload objects in listeners causing side-effects for subsequent listeners.

## 🔍 Verification & Testing
- **Pest Event Fake**: Use `Event::fake()` in Pest tests asserting `OrderCreated` event was dispatched.
