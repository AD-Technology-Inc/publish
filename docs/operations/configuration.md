# Configuration Reference & Environment Settings

## Purpose
This document provides a comprehensive configuration matrix for environment variables, Pydantic settings, and default parameter values across all services.

---

## Configuration Matrix

| Environment Variable | Owning Module | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `REDIS_HOST` | `gateway/app/config.py` | `redis` | Redis server hostname. |
| `REDIS_PORT` | `gateway/app/config.py` | `6379` | Redis server port. |
| `DATABASE_URL` | `services/identity-service` | `postgresql+asyncpg://identity_user:identity_pass@identity-db:5432/identity_db` | SQLAlchemy AsyncSession database connection URL. |
| `DATABASE_URL` | `services/shared/shared/utils.py` | None | PostgreSQL database URL for synchronous `StateManager` `psycopg2` fallback connection. |
| `GRAPH_API_BASE_URL` | `services/social-publish-service` | `https://graph.facebook.com/v19.0` | Base URL for Facebook & Instagram Graph API adapters. |
| `THREADS_API_BASE_URL` | `services/social-publish-service` | `https://graph.threads.net/v1.0` | Base URL for Threads API adapter. |
| `FACEBOOK_PAGE_ACCESS_TOKEN` | `services/social-publish-service` | `mocked_token` | Default Facebook access token fallback when no account token is present. |
| `BASE_URL` | `infrastructure/k6/smoke-test.js` | `http://gateway.localhost` | Target API URL for k6 smoke performance tests. |

---

## Hardcoded Operational Parameters

| System Parameter | Code Location | Value | Description |
| :--- | :--- | :--- | :--- |
| `group_name` | `Worker` & `RedisQueue` | `"workers"` | Redis Stream consumer group name. |
| `max_retries` | `Worker` (`worker.py`) | `5` | Maximum retry attempts before sending job to DLQ. |
| `base_backoff` | `Worker` (`worker.py`) | `1.0` s | Base duration for exponential backoff calculations. |
| `backoff_multiplier` | `Worker` (`worker.py`) | `5.0` | Multiplier for exponential backoff (1s -> 5s -> 25s -> 125s). |
| `lease_ttl` | `Worker._heartbeat_loop` | `120` s | TTL for Redis worker lock key (`job_lease:{message_id}`). |
| `heartbeat_interval` | `Worker._heartbeat_loop` | `30` s | Interval between background lease refresh calls. |
| `autoclaim_min_idle` | `Worker._claim_stalled_jobs` | `300000` ms | Min idle time (5 minutes) before claiming PEL messages. |
| `autoclaim_interval` | `Worker.run` | `60` s | Interval between `XAUTOCLAIM` recovery checks. |
| `idempotency_ttl` | `IdempotencyMiddleware` | `86400` s | TTL (24 hours) for Redis idempotency keys (`idempotency:{key}`). |
| `stream_maxlen` | `RedisQueue.enqueue` | `10000` | Stream max length cap on `XADD`. |
| `max_queue_len` | `Social Post Service` | `10000` | Stream length limit before returning `HTTP 429`. |
| `rate_limit_max` | `Social Account Worker` | `100` req / 60s | Downstream provider API rate limit. |
| `cb_cooldown` | Gateway `http_client.py` | `30` s | Circuit Breaker `OPEN` state cooldown duration. |
| `cb_failure_threshold` | Gateway `http_client.py` | `50.0` % | Failure rate percentage that trips circuit breaker. |
