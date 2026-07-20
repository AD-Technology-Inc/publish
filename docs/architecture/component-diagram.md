# Component Diagram & Subsystem Boundaries

## Purpose
This document specifies the exact structural relationships, component boundaries, and internal interfaces of the **AD. Publish** distributed execution platform.

---

## Component Boundaries

```mermaid
componentDiagram
    package "Edge Ingestion Layer" {
        [Traefik Proxy] --> [FastAPI Gateway]
        [FastAPI Gateway] --> [ResilientHttpClient]
        [ResilientHttpClient] --> [FailureStore]
        [FastAPI Gateway] --> [OpenAPIMerger]
    }

    package "Microservices Layer" {
        [Identity Service]
        [Social Account Service]
        [Social Post Service]
        [Social Publish Service]
    }

    package "Shared Core Library" {
        [Worker Daemon]
        [RedisQueue]
        [StateManager]
        [IdempotencyMiddleware]
        [RateLimiter]
        [FailureSimulator]
    }

    package "State & Message Infrastructure" {
        database "PostgreSQL (identity_db)" as IdentityDB
        database "PostgreSQL (State Store)" as StateDB
        database "Redis (Streams & KV)" as RedisStore
    }

    [FastAPI Gateway] ..> [Identity Service] : HTTP Forward
    [FastAPI Gateway] ..> [Social Account Service] : HTTP Forward
    [FastAPI Gateway] ..> [Social Post Service] : HTTP Forward

    [Social Account Service] --> [RedisQueue]
    [Social Post Service] --> [RedisQueue]
    [Social Publish Service] --> [RedisQueue]

    [Worker Daemon] --> [RedisQueue]
    [Worker Daemon] --> [StateManager]
    [Worker Daemon] --> [IdempotencyMiddleware]

    [FailureStore] --> RedisStore
    [IdempotencyMiddleware] --> RedisStore
    [RedisQueue] --> RedisStore
    [StateManager] --> StateDB
    [StateManager] ..> RedisStore : Fallback
    [Identity Service] --> IdentityDB
```

---

## Subsystem Descriptions

### 1. Ingestion Subsystem (`gateway/app/`)
- **`main.py`**: Initializes FastAPI application (`AD. Publish Gateway`), registers routes, and invokes `setup_openapi_merger()`.
- **`http_client.py`**: Exports `forward(service_name, method, url, request, **kwargs)` which instantiates a `ResilientHttpClient` configured with a 30s cooldown, max 3 retries, 5s timeout, 10s sliding time window, and 50% failure rate threshold.
- **`openapi_merger.py`**: Intercepts `/openapi.json` requests, queries downstream microservices (`http://identity-service:3001/openapi.json`), and merges Pydantic component schemas and endpoint routes into a unified Swagger doc.
- **`routes/v1/dlq.py`**: Provides direct administrative access to inspect (`GET /dlq/{service_name}`) and replay (`POST /dlq/{service_name}/{message_id}/replay`) dead-lettered messages in Redis Streams.

### 2. Core Worker Engine (`services/shared/shared/`)
- **`Worker` (`worker.py`)**: Stateless daemon class responsible for polling Redis Streams via `XREADGROUP`, maintaining active heartbeat leases in Redis (`job_lease:{message_id}`), handling retry exponential backoffs ($1\text{s} \to 5\text{s} \to 25\text{s} \to 125\text{s}$), and claiming orphan messages via `XAUTOCLAIM`.
- **`RedisQueue` (`queue.py`)**: Wraps low-level Redis Stream commands (`xgroup_create`, `xadd`, `xreadgroup`, `xack`, `xdel`). Handles DLQ stream routing (`jobs:{service}:dlq`).
- **`StateManager` (`utils.py`)**: Microservice progress persistence manager. Manages SQL upsert into `job_execution_state` using `psycopg2`. Automatically falls back to Redis key `job_state:{job_id}` if PostgreSQL is unreachable.
- **`IdempotencyMiddleware` (`utils.py`)**: Atomic lock middleware executing `SET idempotency:{key} 1 NX EX 86400`.
- **`RateLimiter` (`utils.py`)**: Redis sliding window rate limiter using atomic `INCR` and `EXPIRE`.

### 3. Service Subsystems (`services/`)
- **Identity Service**: `app/users/router.py`, `service.py`, `models/EmailVerification.py`. Persists relational records via AsyncSession to PostgreSQL database (`identity_db`). Worker handles `create_user` events.
- **Social Account Service**: `main.py`, `worker.py`. Manages platform token storage (`token:{provider}:{page_id}`) in Redis KV. Worker executes `account_link` validation with `RateLimiter` protection (max 100 requests/60s).
- **Social Post Service**: `main.py`, `worker.py`. Enforces queue length backpressure checks (`XLEN > 10000`). Worker processes `create_post` using `StateManager` steps (`started` -> `db_stored` -> `published_event`) and dispatches publish events.
- **Social Publish Service**: `main.py`, `worker.py`. Implements platform publish adapters (`FacebookAdapter`, `LinkedInAdapter`, `InstagramAdapter`, `ThreadsAdapter`). Manages multi-stage publication steps (`started` -> `token_retrieved` -> `completed`).

---

## Data Flow Across Components

1. **Ingestion Flow**:
   Client $\xrightarrow{\text{HTTP POST}}$ Traefik $\xrightarrow{\text{Forward}}$ Gateway $\xrightarrow{\text{Circuit Breaker}}$ Service API $\xrightarrow{\text{XADD}}$ Redis Stream `jobs:{service}`.

2. **Execution Flow**:
   Worker Daemon $\xrightarrow{\text{XREADGROUP}}$ Redis Stream $\xrightarrow{\text{SET NX}}$ Idempotency Check $\xrightarrow{\text{Heartbeat Thread}}$ Refresh `job_lease:{id}` $\xrightarrow{\text{Read/Write}}$ `StateManager` (PostgreSQL/Redis) $\xrightarrow{\text{API Call}}$ Social Platform Adapter $\xrightarrow{\text{XACK \& XDEL}}$ Redis Stream.

3. **Retry Flow**:
   Worker catches retryable exception $\rightarrow$ calculates backoff duration $\rightarrow$ `ZADD` payload into `jobs:{service}:delayed` with timestamp score $\rightarrow$ `XACK` original message $\rightarrow$ background loop `ZRANGEBYSCORE` re-enqueues payload to main stream when ready.

---

## Failure Recovery Dynamics

```mermaid
stateDiagram-v2
    [*] --> Ingested: Gateway Enqueue
    Ingested --> Claimed: XREADGROUP by Worker
    
    state Claimed {
        [*] --> HeartbeatActive: Start Heartbeat Thread (30s)
        HeartbeatActive --> HeartbeatActive: SET job_lease:{id} ex=120
    }

    Claimed --> Executing: Acquire Idempotency Lock
    
    state Executing {
        [*] --> Step1: StateManager.get_last_step()
        Step1 --> Step2: Execute & StateManager.save_step()
        Step2 --> Completed: Final Step Done
    }

    Executing --> RetryDelayed: Transient Error Encountered
    Executing --> DLQIsolated: NonRetryableError / Max Retries (5)
    Claimed --> StalledInPEL: Worker Process Dies (SIGKILL)

    StalledInPEL --> RecoveredByAutoclaim: Lease Expired + Idle > 5m
    RecoveredByAutoclaim --> Executing: XAUTOCLAIM by Peer Worker

    RetryDelayed --> Ingested: Re-enqueue from ZSET when ready
    DLQIsolated --> Ingested: Admin POST /dlq/{service}/{id}/replay
    Completed --> [*]: XACK & XDEL
```
