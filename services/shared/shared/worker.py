from collections.abc import Callable
import json
import random
import socket
import threading
import time
from typing import Any

import structlog
from redis import Redis

from .queue import RedisQueue
from .telemetry import (
    get_tracer,
    record_job_failure,
    record_job_success,
)

try:
    from opentelemetry.trace import SpanKind, StatusCode
except ImportError:
    SpanKind = None  # type: ignore[assignment]
    StatusCode = None  # type: ignore[assignment]

logger = structlog.get_logger(__name__)


class Worker:
    def __init__(
        self,
        redis_client: Redis,
        stream_name: str,
        group_name: str = "workers",
        consumer_name: str | None = None,
        max_retries: int = 5,
        base_backoff: float = 1.0,  # 1s -> 5s -> 25s -> 125s
        backoff_multiplier: float = 5.0,
        lease_duration: int = 120,  # 2 minutes lease
        claim_min_idle_ms: int = 60000,  # 60 seconds min idle time for XAUTOCLAIM
    ):
        self.redis = redis_client
        self.queue = RedisQueue(redis_client, stream_name, group_name)
        self.consumer_name = consumer_name or socket.gethostname()
        self.max_retries = max_retries
        self.base_backoff = base_backoff
        self.backoff_multiplier = backoff_multiplier
        self.lease_duration = lease_duration
        self.claim_min_idle_ms = claim_min_idle_ms
        self.handlers: dict[str, Callable[[dict[str, Any]], Any]] = {}
        self.running = False
        self.active_jobs: set[str] = set()
        self.heartbeat_thread: threading.Thread | None = None
        self.last_claim_time: float = 0.0
        self.last_autoclaim_id: str = "0-0"

    def _heartbeat_loop(self) -> None:
        """Background thread renewing leases for all currently active jobs."""
        while self.running:
            try:
                for message_id in list(self.active_jobs):
                    lease_key = f"job_lease:{message_id}"
                    self.redis.set(lease_key, self.consumer_name, ex=self.lease_duration)
            except Exception as e:
                logger.error("Heartbeat error", error=str(e))
            time.sleep(30)

    def register_handler(self, job_type: str, handler: Callable[[dict[str, Any]], Any]) -> None:
        self.handlers[job_type] = handler

    def calculate_backoff(self, attempt: int) -> float:
        """Calculates exponential backoff with full jitter to avoid thundering herds."""
        base = self.base_backoff * (self.backoff_multiplier ** (attempt - 1))
        # Add jitter: between 80% and 120% of base
        jitter = random.uniform(0.8, 1.2)
        return round(base * jitter, 2)

    def _process_message(self, message_id: str, data: dict[bytes, bytes] | dict[str, Any]) -> None:
        raw_payload = data.get(b"payload") or data.get("payload", b"{}")
        if isinstance(raw_payload, bytes):
            payload_str = raw_payload.decode("utf-8")
        else:
            payload_str = str(raw_payload)

        try:
            payload = json.loads(payload_str)
        except json.JSONDecodeError as exc:
            logger.error("Failed to decode payload", message_id=message_id, payload=payload_str, error=str(exc))
            self.queue.dlq_job(payload_str, f"JSONDecodeError: {exc}", 0)
            self.queue.ack_job(message_id)
            return

        job_id = payload.get("job_id") or payload.get("idempotency_key")
        job_type = payload.get("type")

        if not job_type or job_type not in self.handlers:
            logger.warning("No handler found for job type", job_type=job_type, message_id=message_id)
            if job_id:
                self.redis.set(f"job_state:{job_id}", "failed", ex=86400)
                self.redis.set(f"job_error:{job_id}", f"No handler registered for type {job_type}", ex=86400)
            self.queue.dlq_job(payload_str, f"No handler for type {job_type}", 0)
            self.queue.ack_job(message_id)
            return

        attempt = payload.get("attempt_count", 0) + 1
        payload["attempt_count"] = attempt
        payload["last_attempt_timestamp"] = time.time()

        t0 = time.monotonic()
        tracer = get_tracer()
        _span_kind = SpanKind.INTERNAL if SpanKind is not None else None

        try:
            with tracer.start_as_current_span(
                f"job.{job_type}",
                kind=_span_kind,
            ) as span:
                if span is not None and hasattr(span, "set_attribute"):
                    span.set_attribute("job.type", str(job_type))
                    span.set_attribute("job.id", str(message_id))
                    span.set_attribute("job.attempt", attempt)

                logger.info(
                    "Processing job",
                    job_type=job_type,
                    message_id=message_id,
                    job_id=job_id,
                    attempt=attempt,
                )
                self.handlers[job_type](payload)

            duration = time.monotonic() - t0
            record_job_success(job_type, duration)
            logger.info("Job processed successfully", job_type=job_type, message_id=message_id, duration_s=duration)
            self.queue.ack_job(message_id)

        except Exception as e:
            duration = time.monotonic() - t0
            error_msg = str(e)
            logger.error("Job failed", job_type=job_type, message_id=message_id, error=error_msg, attempt=attempt)

            try:
                if 'span' in locals() and span is not None:
                    span.record_exception(e)
                    if StatusCode is not None:
                        span.set_status(StatusCode.ERROR, error_msg)
            except Exception:
                pass

            is_retryable = getattr(e, "retryable", True)
            record_job_failure(job_type, duration, is_retryable)

            if not is_retryable or attempt >= self.max_retries:
                logger.warning(
                    "Sending job to DLQ",
                    job_type=job_type,
                    retryable=is_retryable,
                    attempt=attempt,
                    max_retries=self.max_retries,
                )
                if job_id:
                    self.redis.set(f"job_state:{job_id}", "failed", ex=86400)
                    self.redis.set(f"job_error:{job_id}", error_msg, ex=86400)

                self.queue.dlq_job(json.dumps(payload), error_msg, attempt)
                self.queue.ack_job(message_id)
            else:
                # Schedule retry using delayed queue (ZSET)
                backoff = self.calculate_backoff(attempt)
                execute_at = time.time() + backoff
                logger.info(
                    "Scheduling job retry via delayed ZSET",
                    job_type=job_type,
                    attempt=attempt,
                    backoff_seconds=backoff,
                )

                delayed_key = f"{self.queue.stream_name}:delayed"
                self.redis.zadd(delayed_key, {json.dumps(payload): execute_at})
                self.queue.ack_job(message_id)

    def _process_delayed_jobs(self) -> None:
        """Move matured retry jobs from delayed ZSET back to the main stream."""
        delayed_key = f"{self.queue.stream_name}:delayed"
        now = time.time()

        ready_jobs = self.redis.zrangebyscore(delayed_key, 0, now)
        if not ready_jobs:
            return

        for payload_bytes in ready_jobs:
            try:
                payload = json.loads(payload_bytes.decode("utf-8"))
                self.queue.enqueue(payload)
                self.redis.zrem(delayed_key, payload_bytes)
                logger.info("Moved delayed job back to stream", stream=self.queue.stream_name)
            except Exception as e:
                logger.error("Failed to re-enqueue delayed job", error=str(e))
                self.redis.zrem(delayed_key, payload_bytes)

    def _claim_stalled_jobs(self) -> None:
        """
        Recover stalled jobs from dead/dropped workers via XAUTOCLAIM.
        Respects active worker lease locks before taking ownership.
        """
        try:
            response = self.redis.xautoclaim(
                self.queue.stream_name,
                self.queue.group_name,
                self.consumer_name,
                min_idle_time=self.claim_min_idle_ms,
                start_id=self.last_autoclaim_id,
                count=10,
            )
            if not response or len(response) < 2:
                return

            next_id = response[0]
            self.last_autoclaim_id = next_id.decode("utf-8") if isinstance(next_id, bytes) else str(next_id)
            if self.last_autoclaim_id == "0-0" or not self.last_autoclaim_id:
                self.last_autoclaim_id = "0-0"

            messages = response[1]
            if not messages:
                return

            for msg in messages:
                if len(msg) == 2:
                    message_id, data = msg
                    message_id_str = (
                        message_id.decode("utf-8")
                        if isinstance(message_id, bytes)
                        else str(message_id)
                    )

                    lease_key = f"job_lease:{message_id_str}"
                    current_lease = self.redis.get(lease_key)
                    if current_lease and current_lease.decode("utf-8") != self.consumer_name:
                        logger.debug("Job has active lease held by another worker, skipping", message_id=message_id_str)
                        continue

                    # Claim and execute
                    logger.info("Autoclaimed stalled job from PEL", message_id=message_id_str)
                    self.active_jobs.add(message_id_str)
                    self.redis.set(lease_key, self.consumer_name, ex=self.lease_duration)
                    try:
                        self._process_message(message_id_str, data)
                    finally:
                        self.active_jobs.discard(message_id_str)
                        self.redis.delete(lease_key)

        except Exception as e:
            if "NOGROUP" not in str(e) and "ERR no such key" not in str(e):
                logger.error("Error claiming stalled jobs", error=str(e))

    def run(self) -> None:
        self.running = True
        self.last_claim_time = time.time()

        self.heartbeat_thread = threading.Thread(
            target=self._heartbeat_loop, daemon=True
        )
        self.heartbeat_thread.start()

        logger.info(
            "Worker started listening",
            consumer_name=self.consumer_name,
            stream=self.queue.stream_name,
        )
        while self.running:
            try:
                # Process delayed retries
                self._process_delayed_jobs()

                # Periodically claim abandoned jobs
                if time.time() - self.last_claim_time > 30:
                    self._claim_stalled_jobs()
                    self.last_claim_time = time.time()

                # Read 1 message from stream, block for 5 seconds
                messages = self.queue.read_jobs(self.consumer_name, count=1, block=5000)
                if not messages:
                    continue

                for stream, msgs in messages:
                    for message_id, data in msgs:
                        message_id_str = (
                            message_id.decode("utf-8")
                            if isinstance(message_id, bytes)
                            else str(message_id)
                        )
                        self.active_jobs.add(message_id_str)
                        lease_key = f"job_lease:{message_id_str}"
                        self.redis.set(lease_key, self.consumer_name, ex=self.lease_duration)
                        try:
                            self._process_message(message_id_str, data)
                        finally:
                            self.active_jobs.discard(message_id_str)
                            self.redis.delete(lease_key)

            except Exception as e:
                logger.error("Error in worker loop", error=str(e))
                time.sleep(2)
