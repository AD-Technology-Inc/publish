# Skill: .agent/backend/laravel/async-events-jobs/websockets-reverb.md

## 📌 Core Philosophy & Constraints
- **Laravel Reverb Server**: Use native Laravel Reverb for real-time WebSocket broadcasting.
- **Private Channels**: Broadcast sensitive tenant updates via `PrivateChannel` authorization wrappers.
- **ShouldBroadcastNow vs ShouldBroadcast**: Use `ShouldBroadcast` to push broadcast payloads through queues.

## ⚡ Production Boilerplate / Standard Pattern

```php
<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

final class OrderStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Order $order
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("tenant.{$this->order->tenant_id}.orders"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order.status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->order->id,
            'status' => $this->order->status,
        ];
    }
}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Public Broadcasting Sensitive Data**: Broadcasting user order details on unauthenticated public `Channel`.
- ❌ **Overloading Payload Sizes**: Broadcasting entire bloated model objects with relations over WebSocket connections.
- ❌ **Missing Channel Authorization**: Omitting channel authorization rules in `routes/channels.php`.

## 🔍 Verification & Testing
- **Broadcasting Assertions**: Use `Event::fake()` in Pest verifying `OrderStatusUpdated` broadcasts on correct channel name.
