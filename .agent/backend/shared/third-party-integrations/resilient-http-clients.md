# Skill: .agent/backend/shared/third-party-integrations/resilient-http-clients.md

## 📌 Core Philosophy & Constraints
- **Strict Outbound Timeouts**: Configure connect timeouts (2s) and read timeouts (5s) for external HTTP clients.
- **Exponential Backoff & Retries**: Retry 5xx server errors and network timeouts with randomized jitter.
- **Async HTTP Clients**: Use Guzzle (PHP) or HTTPX (Python) async capabilities.

## ⚡ Production Boilerplate / Standard Pattern

```python
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential_jitter, retry_if_exception_type

class ResilientExternalClient:
    def __init__(self, base_url: str):
        self.client = httpx.AsyncClient(
            base_url=base_url,
            timeout=httpx.Timeout(connect=2.0, read=5.0, write=5.0, pool=10.0)
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential_jitter(initial=0.5, max=3.0),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.RequestError)),
        reraise=True
    )
    async def post_payload(self, endpoint: str, payload: dict) -> dict:
        response = await self.client.post(endpoint, json=payload)
        response.raise_for_status()
        return response.json()
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Unbounded Outbound Requests**: Invoking external APIs without explicit timeouts causing thread pool starvation.
- ❌ **Retrying Client 4xx Errors**: Retrying HTTP 400 or 401 response errors which will never succeed on retry.
- ❌ **Creating New Client Instances Per Request**: Re-instantiating HTTP client objects without pooling connections.

## 🔍 Verification & Testing
- **HTTPX Mock Test**: Mock external API delay with `respx` asserting client timeouts at 5 seconds.
