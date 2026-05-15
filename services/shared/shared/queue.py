import json
import logging
from redis import Redis
from typing import Dict, Any

logger = logging.getLogger(__name__)

class RedisQueue:
    def __init__(self, redis_client: Redis, stream_name: str, group_name: str = "workers"):
        self.redis = redis_client
        self.stream_name = stream_name
        self.group_name = group_name

        self._ensure_group()

    def _ensure_group(self):
        try:
            self.redis.xgroup_create(self.stream_name, self.group_name, id="0", mkstream=True)
        except Exception as e:
            if "BUSYGROUP" not in str(e):
                logger.error(f"Error creating consumer group: {e}")
                raise e

    def enqueue(self, payload: Dict[str, Any], max_len: int = 10000) -> str:
        """
        Enqueue a job into the stream.
        """
        data = {
            "payload": json.dumps(payload),
            "status": "pending"
        }
        message_id = self.redis.xadd(self.stream_name, data, maxlen=max_len)
        return message_id.decode("utf-8") if isinstance(message_id, bytes) else message_id

    def read_jobs(self, consumer_name: str, count: int = 1, block: int = 5000):
        """
        Read jobs from the stream for a given consumer.
        """
        messages = self.redis.xreadgroup(
            groupname=self.group_name,
            consumername=consumer_name,
            streams={self.stream_name: ">"},
            count=count,
            block=block
        )
        return messages

    def ack_job(self, message_id: str):
        """
        Acknowledge a job was processed successfully.
        """
        self.redis.xack(self.stream_name, self.group_name, message_id)
        # Optionally remove it from the stream
        self.redis.xdel(self.stream_name, message_id)
        
    def dlq_job(self, payload: str, error: str, retry_count: int, max_len: int = 10000) -> str:
        """
        Send a job to the dead letter queue.
        """
        dlq_stream = f"{self.stream_name}:dlq"
        data = {
            "payload": payload,
            "error": error,
            "retry_count": str(retry_count)
        }
        message_id = self.redis.xadd(dlq_stream, data, maxlen=max_len)
        return message_id.decode("utf-8") if isinstance(message_id, bytes) else message_id
