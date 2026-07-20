# Dead Letter Queue (DLQ) & Manual Replay Engine

## Purpose
This document details poison message isolation, Dead Letter Queue (DLQ) stream routing, inspection APIs, and manual job replay mechanics in **AD. Publish**.

---

## DLQ Problem Statement & Architecture

When a job fails due to unrecoverable errors (e.g. invalid client parameters, revoked platform access tokens, non-retryable 4xx API errors) or exhausts all 5 retry attempts, keeping the job in the active stream saturates worker resources.

**AD. Publish** isolates failed jobs into service-specific Dead Letter Streams (`jobs:{service_name}:dlq`), removing them from active stream iteration while preserving complete payload context for manual inspection and replay.

```mermaid
graph TD;
    Worker["Worker Processing Job"] --> CatchErr{Error Type?}

    CatchErr -- NonRetryableError OR Attempt >= 5 --> DLQRoute["RedisQueue.dlq_job()"]
    
    DLQRoute --> DLQStream[("Redis Stream: jobs:{service}:dlq")]
    DLQRoute --> AckOriginal["XACK & XDEL Main Stream Message"]

    subgraph Operations & Replay Management
        Admin["System Operator"] -->|GET /dlq/{service}| InspectAPI["Gateway Inspection Endpoint"]
        Admin -->|POST /dlq/{service}/{msg_id}/replay| ReplayAPI["Gateway Replay Endpoint"]
    end

    InspectAPI --> DLQStream
    ReplayAPI -->|1. Read DLQ Entry| DLQStream
    ReplayAPI -->|2. Reset attempt_count=0 & XADD| MainStream[("Redis Stream: jobs:{service}")]
    ReplayAPI -->|3. XDEL DLQ Entry| DLQStream
```

---

## Technical Routing Mechanics (`services/shared/shared/queue.py`)

When `Worker._process_message()` detects terminal failure:

```python
self.queue.dlq_job(payload_str, error_msg, attempt)
self.queue.ack_job(message_id)
```

`RedisQueue.dlq_job()` writes to `jobs:{service_name}:dlq`:

```python
def dlq_job(self, payload: str, error: str, retry_count: int, max_len: int = 10000) -> str:
    dlq_stream = f"{self.stream_name}:dlq"
    data = {
        "payload": payload,
        "error": error,
        "retry_count": str(retry_count)
    }
    message_id = self.redis.xadd(dlq_stream, data, maxlen=max_len)
    return message_id.decode("utf-8") if isinstance(message_id, bytes) else message_id
```

---

## Management & Replay Endpoints (`gateway/app/routes/v1/dlq.py`)

### 1. Inspect DLQ Messages (`GET /dlq/{service_name}`)
Queries the last 10 messages isolated in `jobs:{service_name}:dlq`:

- **URL**: `GET /dlq/social-publish?count=10`
- **Response Payload**:
```json
{
  "dlq_jobs": [
    {
      "message_id": "1721476100000-0",
      "payload": "{\"type\":\"publish_post\",\"job_id\":\"...\"}",
      "error": "Facebook API error: Invalid OAuth 2.0 Access Token",
      "retry_count": "5"
    }
  ]
}
```

### 2. Replay Failed Message (`POST /dlq/{service_name}/{message_id}/replay`)
Re-enqueues a dead-lettered message back into the active service stream:

- **URL**: `POST /dlq/social-publish/1721476100000-0/replay`
- **Execution Workflow**:
  1. Fetches item `1721476100000-0` from `jobs:social-publish:dlq` via `XRANGE`.
  2. Decodes JSON payload, resets `attempt_count = 0`, clears previous error messages.
  3. Re-enqueues payload to `jobs:social-publish` via `XADD`.
  4. Deletes entry `1721476100000-0` from `jobs:social-publish:dlq` via `XDEL`.
  5. Clears any stale idempotency key (`idempotency:pub_{job_id}`) so re-execution can proceed cleanly.
- **Response Payload**:
```json
{
  "status": "requeued",
  "new_job_id": "1721476200000-0"
}
```
