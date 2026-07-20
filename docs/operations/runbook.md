# Operations Runbook & Standard Operating Procedures

## Purpose
This document provides step-by-step procedures for handling day-to-day operational tasks, queue maintenance, and dead letter queue (DLQ) replays.

---

## SOP 1: Replaying Dead Letter Queue (DLQ) Jobs

When a job is sent to `jobs:{service_name}:dlq` due to temporary downstream outage or invalid credentials (that have since been fixed):

### Step 1: Inspect DLQ Messages
Send an HTTP GET request to the Gateway DLQ inspection route:
```bash
curl -X GET "http://gateway.localhost/dlq/social-publish?count=10"
```
Sample response:
```json
{
  "dlq_jobs": [
    {
      "message_id": "1721476100000-0",
      "payload": "{\"type\":\"publish_post\",\"job_id\":\"4392019a\"}",
      "error": "Facebook API error: Invalid OAuth 2.0 Access Token",
      "retry_count": "5"
    }
  ]
}
```

### Step 2: Trigger Manual Replay
Issue an HTTP POST to replay the specific `message_id`:
```bash
curl -X POST "http://gateway.localhost/dlq/social-publish/1721476100000-0/replay"
```
Expected response:
```json
{
  "status": "requeued",
  "new_job_id": "1721476200000-0"
}
```

---

## SOP 2: Monitoring Redis Consumer Group Lag

To inspect total pending items in Redis Streams:

```bash
docker-compose exec redis redis-cli XPENDING jobs:social-publish workers
```

Sample output:
```text
1) (integer) 3           # Total pending messages in PEL
2) "1721476000000-0"     # Min pending ID
3) "1721476000500-0"     # Max pending ID
4) 1) 1) "worker-1"      # Consumer name
      2) "3"             # Count of pending items
```

---

## SOP 3: Database Schema Migrations

To apply new Alembic database migrations to `identity-db`:

```bash
docker-compose exec identity-service uv run alembic upgrade head
```

To roll back the last migration step:
```bash
docker-compose exec identity-service uv run alembic downgrade -1
```
