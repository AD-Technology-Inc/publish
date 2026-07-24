# Skill: .agent/backend/shared/third-party-integrations/circuit-breaker-pattern.md

## 📌 Core Philosophy & Constraints
- **Circuit Breaker States**: Manage 3 states: `CLOSED` (normal operation), `OPEN` (fail-fast, block requests), `HALF-OPEN` (probe recovery).
- **Consecutive Failure Thresholds**: Trip circuit breaker to `OPEN` after $N$ consecutive failures within a time window.
- **Fallback Recovery Strategies**: Provide static fallback responses or cached data when circuit is `OPEN`.

## ⚡ Production Boilerplate / Standard Pattern

```python
import time
from pybreaker import CircuitBreaker, CircuitBreakerError

# Configure Circuit Breaker: Trip after 5 failures, reset after 30 seconds
api_circuit_breaker = CircuitBreaker(fail_max=5, reset_timeout=30)

class PaymentServiceAdapter:
    @api_circuit_breaker
    async def process_external_charge(self, payload: dict) -> dict:
        # Outbound API call
        return {"status": "success", "charge_id": "ch_999"}

    async def safe_charge(self, payload: dict) -> dict:
        try:
            return await self.process_external_charge(payload)
        except CircuitBreakerError:
            # Fallback strategy when external provider is down
            return {
                "status": "queued_offline",
                "message": "Payment provider unavailable. Request queued for offline retry."
            }
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Missing Fallback Handlers**: Letting `CircuitBreakerError` bubble unhandled up to end-user UI screens.
- ❌ **Un-resetting Breaker States**: Creating circuit breakers without configuring auto-reset timeout durations.
- ❌ **Tripping Breaker on 4xx Errors**: Counting client 4xx validation errors towards circuit breaker failure thresholds.

## 🔍 Verification & Testing
- **Circuit Breaker Test**: Simulate 5 consecutive 500 errors in Pytest verifying 6th call triggers `CircuitBreakerError` fallback.
