# Troubleshooting & Diagnostic Guide

## Purpose
This document provides diagnostic playbooks for resolving common failure modes, network timeouts, and circuit breaker trip states in **AD. Publish**.

---

## Diagnostic Playbook Matrix

| Symptom | Probable Root Cause | Verification Command | Resolution Action |
| :--- | :--- | :--- | :--- |
| **HTTP 503 `circuit_open` from Gateway** | Downstream service failing > 50% of calls in 10s window. | `docker-compose logs gateway` | Inspect downstream microservice logs; fix underlying 500 error; wait 30s for circuit cooldown. |
| **HTTP 429 `Queue overload`** | Redis Stream length exceeded 10,000 items. | `redis-cli XLEN jobs:social-post` | Check worker container status (`docker-compose ps`); scale up worker instances to consume backlog. |
| **Jobs stuck in `pending` status** | Worker daemon process crashed or stopped. | `docker-compose ps` | Restart worker container (`docker-compose restart identity-service`). Stalled PEL items auto-reclaim after 5m. |
| **`NonRetryableError` in logs** | Invalid payload parameters or 4xx API response. | `curl http://gateway.localhost/dlq/{service}` | Inspect DLQ payload; update invalid client request parameters or fix social platform OAuth credentials. |
| **`psycopg2.OperationalError`** | PostgreSQL container unreachable or connection pool exhausted. | `docker-compose logs identity-db` | Check PostgreSQL container status. Verify `DATABASE_URL` environment variable. `StateManager` falls back to Redis automatically. |

---

## Investigating Gateway Circuit Breaker OPEN State

When Gateway returns:
```json
{
  "message": "circuit_open"
}
```

1. **Check FailureStore Keys in Redis**:
   ```bash
   docker-compose exec redis redis-cli KEYS "resilience:*"
   ```
2. **Inspect Downstream HTTP Responses**:
   Check if target service (`http://identity-service:3001` or `http://social-post-service:3001`) is throwing 500 exceptions.
3. **Reset Circuit Breaker (Emergency Override)**:
   Delete resilience keys in Redis to force circuit back to `CLOSED`:
   ```bash
   docker-compose exec redis redis-cli DEL "resilience:identity:state" "resilience:identity:failures"
   ```
