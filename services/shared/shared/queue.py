import json
import logging
from typing import Any, Dict, List, Optional, Tuple

from redis import Redis

logger = logging.getLogger(__name__)


class RedisQueue:
    def __init__(
        self, redis_client: Redis, stream_name: str, group_name: str = "workers"
    ):
        self.redis = redis_client
        self.stream_name = stream_name
        self.group_name = group_name

        self._ensure_group()

    def _ensure_group(self) -> None:
        try:
            self.redis.xgroup_create(
                self.stream_name, self.group_name, id="0", mkstream=True
            )
        except Exception as e:
            if "BUSYGROUP" not in str(e):
                logger.error("Error creating consumer group: %s", e)
                raise e

    def enqueue(self, payload: Dict[str, Any], max_len: int = 10000) -> str:
        """Enqueue a job dictionary into the Redis stream."""
        data = {"payload": json.dumps(payload), "status": "pending"}
        message_id = self.redis.xadd(self.stream_name, data, maxlen=max_len)
        return (
            message_id.decode("utf-8") if isinstance(message_id, bytes) else str(message_id)
        )

    def read_jobs(
        self, consumer_name: str, count: int = 1, block: int = 5000
    ) -> List[Tuple[Any, List[Tuple[Any, Dict[bytes, bytes]]]]]:
        """Read pending/new jobs from the stream for a given consumer."""
        messages = self.redis.xreadgroup(
            groupname=self.group_name,
            consumername=consumer_name,
            streams={self.stream_name: ">"},
            count=count,
            block=block,
        )
        return messages or []

    def ack_job(self, message_id: str) -> None:
        """Acknowledge and remove a job from the stream once processed or DLQ'd."""
        self.redis.xack(self.stream_name, self.group_name, message_id)
        self.redis.xdel(self.stream_name, message_id)

    def dlq_job(
        self, payload: str, error: str, retry_count: int, max_len: int = 10000
    ) -> str:
        """Send an unrecoverable or maxed-out job to the Dead Letter Queue stream."""
        dlq_stream = f"{self.stream_name}:dlq"
        data = {
            "payload": payload,
            "error": error,
            "retry_count": str(retry_count),
        }
        message_id = self.redis.xadd(dlq_stream, data, maxlen=max_len)
        return (
            message_id.decode("utf-8") if isinstance(message_id, bytes) else str(message_id)
        )
