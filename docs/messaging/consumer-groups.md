# Redis Consumer Groups & Partition Mechanics

## Purpose
This document details consumer group creation, consumer naming conventions, and partition assignment mechanics in **AD. Publish**.

---

## Consumer Group Initialization (`services/shared/shared/queue.py`)

When a microservice worker instantiates `RedisQueue`, it ensures the target consumer group exists prior to issue stream read operations:

```python
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
```

### Key Parameters:
- **Group Name**: Default `"workers"`.
- **Start ID (`id="0"`)**: Reads unconsumed messages starting from the beginning of the stream.
- **`mkstream=True`**: Automatically creates the stream in Redis if it does not exist.
- **Idempotent Group Creation**: Catches `BUSYGROUP` exceptions if the group was previously initialized by another worker process.

---

## Consumer Naming Protocol (`services/shared/shared/worker.py`)

Each worker instance identifies itself uniquely within the consumer group:

```python
self.consumer_name = consumer_name or socket.gethostname()
```

- Defaults to host or container hostname (e.g. `social-post-worker-1`, `publish-worker-node-a`).
- Permits precise tracking of message ownership in Redis Pending Entries List (`XPENDING`).

---

## Stream Reading Mechanics (`XREADGROUP`)

Workers issue blocking stream read calls:

```python
messages = self.redis.xreadgroup(
    groupname="workers",
    consumername=self.consumer_name,
    streams={self.stream_name: ">"},
    count=1,
    block=5000
)
```

- **Special Stream Symbol (`">"`)**: Delivers new messages that have never been delivered to any other consumer in the `"workers"` group.
- **Batch Count (`count=1`)**: Fetches 1 message per iteration to ensure strict single-job lease tracking and rapid heartbeat allocation.
- **Block Timeout (`block=5000`)**: Blocks for up to 5,000 ms (5 seconds) waiting for new stream items before unblocking to perform background maintenance checks (delayed queue processing & `XAUTOCLAIM`).
