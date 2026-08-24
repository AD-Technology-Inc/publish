import json
import time
import fakeredis
from shared.worker import Worker
from shared.utils import NonRetryableError


def test_worker_successful_execution():
    r = fakeredis.FakeRedis()
    worker = Worker(
        redis_client=r,
        stream_name="test:jobs",
        group_name="test_group",
        consumer_name="worker-1",
    )

    processed_payloads = []

    def sample_handler(payload):
        processed_payloads.append(payload)

    worker.register_handler("test_action", sample_handler)

    msg_id = worker.queue.enqueue(
        {
            "type": "test_action",
            "job_id": "job-1",
            "data": "hello",
        }
    )

    messages = worker.queue.read_jobs(consumer_name="worker-1", count=1)
    assert len(messages) == 1
    stream, msgs = messages[0]
    mid, data = msgs[0]

    worker._process_message(mid.decode("utf-8"), data)

    assert len(processed_payloads) == 1
    assert processed_payloads[0]["data"] == "hello"


def test_worker_non_retryable_error_routes_to_dlq():
    r = fakeredis.FakeRedis()
    worker = Worker(
        redis_client=r,
        stream_name="test:jobs",
        group_name="test_group",
        consumer_name="worker-1",
    )

    def failing_handler(payload):
        raise NonRetryableError("Invalid credentials")

    worker.register_handler("bad_action", failing_handler)

    msg_id = worker.queue.enqueue(
        {
            "type": "bad_action",
            "job_id": "job-dlq-1",
        }
    )

    messages = worker.queue.read_jobs(consumer_name="worker-1", count=1)
    stream, msgs = messages[0]
    mid, data = msgs[0]

    worker._process_message(mid.decode("utf-8"), data)

    # Job state in redis should be marked failed
    assert r.get("job_state:job-dlq-1").decode("utf-8") == "failed"

    # DLQ stream should contain the message
    dlq_msgs = r.xrange("test:jobs:dlq")
    assert len(dlq_msgs) == 1
    assert b"Invalid credentials" in dlq_msgs[0][1][b"error"]


def test_worker_retryable_backoff_and_delayed_zset():
    r = fakeredis.FakeRedis()
    worker = Worker(
        redis_client=r,
        stream_name="test:jobs",
        group_name="test_group",
        consumer_name="worker-1",
        base_backoff=0.1,
        backoff_multiplier=2.0,
    )

    def transient_fail_handler(payload):
        raise Exception("Temporary 500 network timeout")

    worker.register_handler("retry_action", transient_fail_handler)

    msg_id = worker.queue.enqueue(
        {
            "type": "retry_action",
            "job_id": "job-retry-1",
        }
    )

    messages = worker.queue.read_jobs(consumer_name="worker-1", count=1)
    stream, msgs = messages[0]
    mid, data = msgs[0]

    worker._process_message(mid.decode("utf-8"), data)

    # Should be in delayed ZSET
    delayed_key = "test:jobs:delayed"
    delayed_items = r.zrange(delayed_key, 0, -1)
    assert len(delayed_items) == 1

    # Delayed payload has attempt_count = 1
    delayed_payload = json.loads(delayed_items[0].decode("utf-8"))
    assert delayed_payload["attempt_count"] == 1
