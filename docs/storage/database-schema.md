# Database Schemas & Storage Design

## Purpose
This document details the PostgreSQL relational schemas, Alembic migrations, and Redis key space schemas implemented in **AD. Publish**.

---

## PostgreSQL Relational Schemas

### 1. Identity Service Database (`identity_db`)
Managed via Alembic in `services/identity-service/alembic/versions/fef4c6877fb8_add_users_and_verify_email_tables.py`.

#### `users` Table Schema
```sql
CREATE TABLE users (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_users_email ON users (email);
CREATE INDEX ix_users_username ON users (username);
```

#### `email_verifications` Table Schema
```sql
CREATE TABLE email_verifications (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_email_verifications_token ON email_verifications (token);
```

### 2. Microservice State Manager Table (`job_execution_state`)
Initialized dynamically by `StateManager` in `services/shared/shared/utils.py`.

```sql
CREATE TABLE job_execution_state (
    job_id VARCHAR(255) PRIMARY KEY,
    last_step VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Redis Key Space Layout

| Key Pattern | Data Type | TTL | Purpose |
| :--- | :--- | :--- | :--- |
| `jobs:{service}` | Stream | Bounded (`maxlen=10000`) | Main job queue transport stream. |
| `jobs:{service}:dlq` | Stream | Bounded (`maxlen=10000`) | Isolated dead letter stream. |
| `jobs:{service}:delayed` | Sorted Set (ZSET) | None (Explicit ZREM) | Retry backlog sorted by `execute_at` timestamp score. |
| `idempotency:{key}` | String | 24 Hours (`ex=86400`) | Idempotency lock marker (`SET NX`). |
| `job_lease:{message_id}`| String | 120 Seconds (`ex=120`) | Active worker lease heartbeat marker. |
| `job_state:{job_id}` | String | 24 Hours (`ex=86400`) | Current state snapshot (`pending`, `processing`, `completed`, `failed`). |
| `job_result:{job_id}` | String | 24 Hours (`ex=86400`) | Result payload / platform post ID upon completion. |
| `job_token:{job_id}` | String | 1 Hour (`ex=3600`) | Inter-step cached OAuth access token during worker execution. |
| `accounts:{account_id}` | String (JSON) | None | Stored social account profile record. |
| `accounts:all` | String (JSON array) | None | List of connected account IDs. |
| `token:{provider}:{page_id}`| String | None | Stored platform OAuth access token. |
| `ratelimit:{key}` | String (Counter) | Window Seconds (60s) | Rate limiter request counter. |
| `resilience:{service}:*` | String / Hash | Variable | Circuit breaker failure store counters. |
