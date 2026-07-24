# Skill: .agent/engineering-standards/saas-architecture/fault-tolerance-reliability.md

## 📌 Core Philosophy & Constraints
- **Strict Timeouts**: Every outbound HTTP request or RPC call MUST enforce a explicit timeout (< 5s).
- **Exponential Backoff with Jitter**: Retries on transient 5xx errors MUST use exponential backoff and randomized jitter to prevent thundering herd.
- **Circuit Breaker Protection**: Calls to third-party services MUST open circuit breakers after repeated consecutive failures.

## ⚡ Production Boilerplate / Standard Pattern

### Python Resilient Outbound HTTP Client Pattern (HTTPX + Tenacity)
```python
import random
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential_jitter, retry_if_exception_type

class ResilientApiClient:
    def __init__(self, base_url: str):
        self.client = httpx.AsyncClient(base_url=base_url, timeout=httpx.Timeout(5.0, connect=2.0))

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential_jitter(initial=0.5, max=4.0),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.RequestError)),
        reraise=True
    )
    async def fetch_payment_status(self, payment_id: str) -> dict:
        response = await self.client.get(f"/payments/{payment_id}")
        response.raise_for_status()
        return response.json()
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Infinite Retries**: Retrying requests infinitely without max attempt cutoffs.
- ❌ **Missing Timeouts**: Invoking external APIs without timeout parameters causing thread pool exhaustion.
- ❌ **Fixed Delay Retries**: Retrying requests every 1 second without exponential backoff or jitter.

## 🔍 Verification & Testing
- **Timeout Assertion Test**: Mock slow external endpoint (10s delay) and assert client throws timeout exception at 5 seconds.
- **Retry Count Test**: Mock 503 response and verify exact 3 retry attempts before raising exception.
