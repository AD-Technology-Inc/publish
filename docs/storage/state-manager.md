# StateManager Implementation & Hybrid Fallback

## Purpose
This document details the architecture, connection lifecycle, and fallback mechanisms of `StateManager` in `services/shared/shared/utils.py`.

---

## StateManager Architecture

`StateManager` manages milestone progress persistence across worker steps. It operates a hybrid storage strategy: primary persistence to PostgreSQL with transparent fallback to Redis.

```mermaid
flowchart TD
    Init[StateManager.__init__] --> CheckConfig{DATABASE_URL set & psycopg2 installed?}
    
    CheckConfig -- Yes --> InitPG[Execute CREATE TABLE IF NOT EXISTS job_execution_state]
    InitPG --> InitSuccess{Success?}
    InitSuccess -- Yes --> PrimaryPG[Active Engine: PostgreSQL]
    InitSuccess -- No (Exception) --> FallbackRedis[Active Engine: Redis Key-Value]
    CheckConfig -- No --> FallbackRedis

    subgraph OperationSaveStep ["Operation: save_step(job_id, step_name)"]
        SaveCall[save_step Call] --> IsPGActive{Active Engine PostgreSQL?}
        IsPGActive -- Yes --> ExecUPSERT[Execute SQL UPSERT in psycopg2 connection]
        ExecUPSERT -- Success --> Done1([Saved to Postgres])
        ExecUPSERT -- Exception --> WriteRedisFallback[Write f'job_state:{job_id}' to Redis]
        IsPGActive -- No --> WriteRedisFallback
        WriteRedisFallback --> Done2([Saved to Redis Fallback])
    end
```

---

## Technical Source Reference (`services/shared/shared/utils.py`)

```python
class StateManager:
    """Manages state for partial failure handling using Postgres (fallback to Redis)"""
    def __init__(self, redis_client: Redis, ttl_seconds: int = 86400):
        self.redis = redis_client
        self.ttl = ttl_seconds
        self.db_url = os.getenv("DATABASE_URL")
        self._init_db()

    def _init_db(self):
        if not self.db_url or not psycopg2:
            return
        try:
            with psycopg2.connect(self.db_url) as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        CREATE TABLE IF NOT EXISTS job_execution_state (
                            job_id VARCHAR(255) PRIMARY KEY,
                            last_step VARCHAR(255) NOT NULL,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    """)
                conn.commit()
        except Exception as e:
            logger.warning(f"Failed to initialize Postgres state table: {e}. Falling back to Redis.")
            self.db_url = None

    def save_step(self, job_id: str, step_name: str):
        if self.db_url:
            try:
                with psycopg2.connect(self.db_url) as conn:
                    with conn.cursor() as cur:
                        cur.execute("""
                            INSERT INTO job_execution_state (job_id, last_step, updated_at)
                            VALUES (%s, %s, CURRENT_TIMESTAMP)
                            ON CONFLICT (job_id) DO UPDATE 
                            SET last_step = EXCLUDED.last_step, updated_at = EXCLUDED.updated_at;
                        """, (job_id, step_name))
                    conn.commit()
                return
            except Exception as e:
                logger.error(f"Failed to save step to Postgres: {e}")
        
        # Fallback to Redis
        redis_key = f"job_state:{job_id}"
        self.redis.set(redis_key, step_name, ex=self.ttl)
```

---

## Key Operational Characteristics

1. **Transactional Step Upserts**: PostgreSQL `ON CONFLICT (job_id) DO UPDATE` ensures step updates are strictly idempotent and atomic per `job_id`.
2. **Short-Lived Connections**: Each step operation uses a context-managed `psycopg2.connect()` block to guarantee connection cleanup.
3. **Resilient Failover**: If PostgreSQL shuts down or encounters connection pool starvation, worker execution does not break; `StateManager` writes step state to Redis and logs a warning.
