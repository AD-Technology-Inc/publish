# Redis Streams Architecture & Schema

## Purpose
This document specifies the Redis Streams stream layout, key naming conventions, entry payload structures, and stream capping mechanisms implemented in **AD. Publish**.

---

## Stream Topology & Key Naming Conventions

Redis Streams act as the core asynchronous transport broker across all microservice boundaries.

| Stream Key | Owning Microservice | Consumer Group | Message Type | Stream Description |
| :--- | :--- | :--- | :--- | :--- |
| `jobs:identity` | Identity Service | `workers` | `create_user` | Asynchronous user registration pipeline. |
| `jobs:social-account` | Social Account Service | `workers` | `account_link` | Social account validation & token check. |
| `jobs:social-post` | Social Post Service | `workers` | `create_post` | Initial post validation and state store creation. |
| `jobs:social-publish` | Social Publish Service | `workers` | `publish_post` | Downstream social platform API publication. |
| `jobs:{service}:dlq` | Microservices | N/A (Direct Read) | Dead Letter Payload | Isolated dead letter stream for unrecoverable errors. |
| `jobs:{service}:delayed`| Microservices | N/A (ZSET) | Delayed Retry Payload | Sorted Set storing scheduled retries with timestamp scores. |

---

## Message Entry Payload Schemas

### 1. Main Stream Entry Structure (`RedisQueue.enqueue()`)
Every item written to a main stream (`XADD`) contains two key-value string fields:
```json
{
  "payload": "{\"type\": \"create_post\", \"job_id\": \"...\", \"idempotency_key\": \"...\"}",
  "status": "pending"
}
```

### 2. Payload Field Breakdown Across Job Types

#### `jobs:social-post` Payload (`create_post`)
```json
{
  "type": "create_post",
  "job_id": "4392019a-9e70-4d2b-a81d-2895e638ef12",
  "idempotency_key": "4392019a-9e70-4d2b-a81d-2895e638ef12",
  "page_id": "fb_page_9912",
  "provider": "facebook",
  "message": "Publishing release 2.0 notes!",
  "media_url": "https://cdn.example.com/image.jpg",
  "attempt_count": 1,
  "last_attempt_timestamp": 1721476000.12
}
```

#### `jobs:social-publish` Payload (`publish_post`)
```json
{
  "type": "publish_post",
  "job_id": "4392019a-9e70-4d2b-a81d-2895e638ef12",
  "idempotency_key": "pub_4392019a-9e70-4d2b-a81d-2895e638ef12",
  "page_id": "fb_page_9912",
  "provider": "facebook",
  "message": "Publishing release 2.0 notes!",
  "media_url": "https://cdn.example.com/image.jpg",
  "post_db_id": "post_4392019a",
  "attempt_count": 1
}
```

#### DLQ Entry Structure (`RedisQueue.dlq_job()`)
```json
{
  "payload": "{\"type\": \"publish_post\", ...}",
  "error": "Facebook API error: Invalid OAuth 2.0 Access Token",
  "retry_count": "5"
}
```

---

## Stream Trimming & Capping (`maxlen=10000`)

To prevent unbounded Redis RAM growth under high ingestion volume, `RedisQueue` caps streams on every `XADD` operation:

```python
message_id = self.redis.xadd(self.stream_name, data, maxlen=10000)
```

- **Max Length**: 10,000 items per stream.
- **Trimming Behavior**: When a stream exceeds 10,000 items, Redis automatically trims the oldest entries.
- **Data Protection**: Because processed jobs are acknowledged (`XACK`) and removed (`XDEL`) immediately upon completion, active stream length rarely approaches the 10,000 item limit under normal operating conditions.
