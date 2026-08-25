import logging
import os
from typing import Optional

from redis import Redis

try:
    import psycopg2
except ImportError:
    psycopg2 = None

logger = logging.getLogger(__name__)


class NonRetryableError(Exception):
    """Exception indicating that an error is permanent and should immediately route to DLQ."""
    def __init__(self, message: str = "Non-retryable error"):
        self.message = message
        self.retryable = False
        super().__init__(self.message)


class RateLimitExceeded(Exception):
    """Exception indicating that an external API rate limit was encountered."""
    def __init__(self, message: str = "Rate limit exceeded"):
        self.message = message
        self.retryable = True
        super().__init__(self.message)


class IdempotencyMiddleware:
    """
    Enforces atomic idempotency guards across distributed workers using Redis SET NX.
    Prevents duplicate side-effects under at-least-once delivery guarantees.
    """
    def __init__(self, redis_client: Redis, ttl_seconds: int = 86400):
        self.redis = redis_client
        self.ttl = ttl_seconds

    def check_and_set(self, key: Optional[str]) -> bool:
        """
        Atomically claim an idempotency key via Redis SET NX.

        Returns True if the key was successfully set (first execution).
        Returns False if the key already exists (duplicate — skip side-effects).
        """
        if not key or not str(key).strip():
            raise ValueError(
                "idempotency_key is required but was not provided. "
                "Refusing to execute without a deduplication guard."
            )

        redis_key = f"idempotency:{key}"
        result = self.redis.set(redis_key, "1", nx=True, ex=self.ttl)
        return bool(result)

    def is_processed(self, key: Optional[str]) -> bool:
        """Check if an idempotency key has already been claimed."""
        if not key:
            return False
        return bool(self.redis.exists(f"idempotency:{key}"))

    def clear(self, key: Optional[str]) -> None:
        """Clear the idempotency key so a failed job can be re-run if needed."""
        if key:
            self.redis.delete(f"idempotency:{key}")


class RateLimiter:
    """Sliding-window / counter rate limiter backed by Redis."""
    def __init__(self, redis_client: Redis, max_requests: int, window_seconds: int):
        self.redis = redis_client
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    def is_allowed(self, key: str) -> bool:
        redis_key = f"ratelimit:{key}"
        current = self.redis.incr(redis_key)
        if current == 1:
            self.redis.expire(redis_key, self.window_seconds)

        return current <= self.max_requests


class StateManager:
    """
    Manages durable state checkpoints for partial failure recovery.
    Persists step milestones to PostgreSQL with resilient fallback to Redis.
    """

    def __init__(self, redis_client: Redis, ttl_seconds: int = 86400):
        self.redis = redis_client
        self.ttl = ttl_seconds
        self.db_url = os.getenv("DATABASE_URL")
        self._table_initialized = False
        self._init_db()

    def _get_connection(self):
        if not self.db_url or not psycopg2:
            return None
        conn_url = self.db_url.replace("postgresql+asyncpg://", "postgresql://")
        return psycopg2.connect(conn_url, connect_timeout=3)

    def _init_db(self) -> None:
        if not self.db_url or not psycopg2 or self._table_initialized:
            return
        try:
            with self._get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        CREATE TABLE IF NOT EXISTS job_execution_state (
                            job_id VARCHAR(255) PRIMARY KEY,
                            last_step VARCHAR(255) NOT NULL,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    """)
                conn.commit()
            self._table_initialized = True
        except Exception as e:
            logger.warning("Failed to initialize PostgreSQL state table: %s. Will retry on demand.", e)

    def save_step(self, job_id: str, step_name: str) -> None:
        """
        Record a milestone checkpoint for a job.
        Writes to PostgreSQL and mirrors to Redis.
        """
        redis_key = f"job_checkpoint:{job_id}"
        self.redis.set(redis_key, step_name, ex=self.ttl)

        if self.db_url and psycopg2:
            try:
                if not self._table_initialized:
                    self._init_db()

                with self._get_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            """
                            INSERT INTO job_execution_state (job_id, last_step, updated_at)
                            VALUES (%s, %s, CURRENT_TIMESTAMP)
                            ON CONFLICT (job_id) DO UPDATE
                            SET last_step = EXCLUDED.last_step, updated_at = EXCLUDED.updated_at;
                            """,
                            (job_id, step_name),
                        )
                    conn.commit()
                return
            except Exception as e:
                logger.error("Failed to save step checkpoint to Postgres: %s. Redis fallback active.", e)

    def get_last_step(self, job_id: str) -> Optional[str]:
        """
        Retrieve the latest completed step milestone for a job.
        Checks PostgreSQL first, falling back to Redis if unavailable.
        """
        if self.db_url and psycopg2:
            try:
                with self._get_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            "SELECT last_step FROM job_execution_state WHERE job_id = %s;",
                            (job_id,),
                        )
                        row = cur.fetchone()
                        if row:
                            return row[0]
            except Exception as e:
                logger.error("Failed to fetch step from Postgres: %s. Using Redis checkpoint.", e)

        redis_key = f"job_checkpoint:{job_id}"
        val = self.redis.get(redis_key)
        return val.decode("utf-8") if val else None
