import json
import time
import socket
import threading
import structlog
from typing import Callable, Dict, Optional
from redis import Redis
from .queue import RedisQueue
from .telemetry import (
    get_tracer,
    record_job_success,
    record_job_failure,
)

logger = structlog.get_logger(__name__)

class Worker:
    def __init__(
        self,
        redis_client: Redis,
        stream_name: str,
        group_name: str = "workers",
        consumer_name: Optional[str] = None,
        max_retries: int = 5,
        base_backoff: float = 1.0, # 1s -> 5s -> 25s
        backoff_multiplier: float = 5.0
    ):
        self.redis = redis_client
        self.queue = RedisQueue(redis_client, stream_name, group_name)
        self.consumer_name = consumer_name or socket.gethostname()
        self.max_retries = max_retries
        self.base_backoff = base_backoff
        self.backoff_multiplier = backoff_multiplier
        self.handlers: Dict[str, Callable] = {}
        self.running = False
        self.active_jobs = set()
        self.heartbeat_thread = None

    def _heartbeat_loop(self):
        while self.running:
            try:
                for message_id in list(self.active_jobs):
                    lease_key = f"job_lease:{message_id}"
                    self.redis.set(lease_key, "1", ex=120)  # 2 min lease
            except Exception as e:
                logger.error(f"Heartbeat error: {e}")
            time.sleep(30)

    def register_handler(self, job_type: str, handler: Callable):
        self.handlers[job_type] = handler

    def calculate_backoff(self, attempt: int) -> float:
        # e.g. 1s -> 5s -> 25s -> 125s (approx 2min)
        return self.base_backoff * (self.backoff_multiplier ** (attempt - 1))

    def _process_message(self, message_id: str, data: Dict[str, bytes]):
        payload_str = data.get(b"payload", b"{}").decode("utf-8")
        try:
            payload = json.loads(payload_str)
        except json.JSONDecodeError:
            logger.error(f"Failed to decode payload for {message_id}: {payload_str}")
            self.queue.ack_job(message_id)
            return

        job_type = payload.get("type")
        if not job_type or job_type not in self.handlers:
            logger.warning(f"No handler found for job type: {job_type}")
            # Consider this a non-retryable failure if no handler exists
            self.queue.dlq_job(payload_str, f"No handler for type {job_type}", 0)
            self.queue.ack_job(message_id)
            return

        attempt = payload.get("attempt_count", 0) + 1
        payload["attempt_count"] = attempt
        payload["last_attempt_timestamp"] = time.time()

        try:
            # Execute the handler inside an OTel span
            tracer = get_tracer()
            t0 = time.monotonic()
            with tracer.start_as_current_span(
                f"job.{job_type}",
                kind=None,  # internal span
            ) as span:
                span.set_attribute("job.type", job_type)
                span.set_attribute("job.id", message_id)
                span.set_attribute("job.attempt", attempt)

                logger.info(f"Processing job {job_type} (id: {message_id}, attempt: {attempt})")
                self.handlers[job_type](payload)

            duration = time.monotonic() - t0
            record_job_success(job_type, duration)
            logger.info(f"Job {job_type} processed successfully")
            self.queue.ack_job(message_id)
            
        except Exception as e:
            duration = time.monotonic() - t0
            error_msg = str(e)
            logger.error(f"Job {job_type} failed: {error_msg}")

            is_retryable = getattr(e, "retryable", True)
            record_job_failure(job_type, duration, is_retryable)

            if not is_retryable or attempt >= self.max_retries:
                logger.warning(f"Sending job to DLQ. Retryable: {is_retryable}, Attempt: {attempt}")
                self.queue.dlq_job(payload_str, error_msg, attempt)
                self.queue.ack_job(message_id)
            else:
                # Schedule retry using delayed queue (ZSET)
                backoff = self.calculate_backoff(attempt)
                execute_at = time.time() + backoff
                logger.info(f"Scheduling retry in {backoff} seconds via delayed queue...")
                
                delayed_key = f"{self.queue.stream_name}:delayed"
                self.redis.zadd(delayed_key, {json.dumps(payload): execute_at})
                
                self.queue.ack_job(message_id)

    def _process_delayed_jobs(self):
        """Move ready jobs from delayed ZSET to the main stream"""
        delayed_key = f"{self.queue.stream_name}:delayed"
        now = time.time()
        
        # Get ready jobs
        ready_jobs = self.redis.zrangebyscore(delayed_key, 0, now)
        if not ready_jobs:
            return
            
        for payload_bytes in ready_jobs:
            try:
                payload = json.loads(payload_bytes.decode("utf-8"))
                self.queue.enqueue(payload)
                self.redis.zrem(delayed_key, payload_bytes)
                logger.info(f"Moved delayed job back to stream {self.queue.stream_name}")
            except Exception as e:
                logger.error(f"Failed to process delayed job: {e}")
                self.redis.zrem(delayed_key, payload_bytes)


    def _claim_stalled_jobs(self):
        """Claim jobs that have been stuck in the PEL for over 5 minutes (worker crashed)."""
        try:
            # 300000 ms = 5 minutes idle time
            response = self.redis.xautoclaim(
                self.queue.stream_name,
                self.queue.group_name,
                self.consumer_name,
                300000,
                start_id="0-0",
                count=10
            )
            if response and len(response) >= 2:
                messages = response[1]
                for msg in messages:
                    if len(msg) == 2:
                        message_id, data = msg
                        message_id_str = message_id.decode('utf-8') if isinstance(message_id, bytes) else message_id
                        
                        # Check lease
                        lease_key = f"job_lease:{message_id_str}"
                        if self.redis.exists(lease_key):
                            logger.info(f"Job {message_id_str} has active lease. Skipping autoclaim.")
                            continue
                            
                        logger.info(f"Recovered stalled job {message_id_str}")
                        self._process_message(message_id_str, data)
        except Exception as e:
            logger.error(f"Error claiming stalled jobs: {e}")

    def run(self):
        self.running = True
        self.last_claim_time = time.time()
        
        self.heartbeat_thread = threading.Thread(target=self._heartbeat_loop, daemon=True)
        self.heartbeat_thread.start()
        
        logger.info(f"Worker {self.consumer_name} started listening on {self.queue.stream_name}")
        while self.running:
            try:
                # Process delayed jobs
                self._process_delayed_jobs()

                # Periodically claim stalled jobs
                if time.time() - self.last_claim_time > 60:
                    self._claim_stalled_jobs()
                    self.last_claim_time = time.time()

                # Read 1 message, block for 5 seconds
                messages = self.queue.read_jobs(self.consumer_name, count=1, block=5000)
                if not messages:
                    continue
                
                for stream, msgs in messages:
                    for message_id, data in msgs:
                        message_id_str = message_id.decode('utf-8')
                        self.active_jobs.add(message_id_str)
                        try:
                            self._process_message(message_id_str, data)
                        finally:
                            self.active_jobs.discard(message_id_str)
                            self.redis.delete(f"job_lease:{message_id_str}")

            except Exception as e:
                logger.error(f"Error in worker loop: {e}")
                time.sleep(5)
