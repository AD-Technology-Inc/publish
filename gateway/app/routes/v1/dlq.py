from fastapi import APIRouter, HTTPException
import json
from redis import Redis

dlq_router = APIRouter(prefix="/dlq", tags=["dlq"])
redis_client = Redis(host="redis", port=6379, db=0)

@dlq_router.get("/{service_name}")
def inspect_dlq(service_name: str, count: int = 10):
    stream_name = f"jobs:{service_name}:dlq"
    try:
        messages = redis_client.xrange(stream_name, count=count)
    except Exception as e:
        return {"error": str(e)}

    results = []
    for msg_id, data in messages:
        results.append({
            "message_id": msg_id.decode("utf-8"),
            "payload": data.get(b"payload", b"").decode("utf-8"),
            "error": data.get(b"error", b"").decode("utf-8"),
            "retry_count": data.get(b"retry_count", b"").decode("utf-8"),
        })
    return {"dlq_jobs": results}


@dlq_router.post("/{service_name}/{message_id}/replay")
def replay_dlq_job(service_name: str, message_id: str):
    dlq_stream = f"jobs:{service_name}:dlq"
    target_stream = f"jobs:{service_name}"

    messages = redis_client.xrange(dlq_stream, min=message_id, max=message_id, count=1)
    if not messages:
        raise HTTPException(status_code=404, detail="Job not found in DLQ")

    _, data = messages[0]
    payload_str = data.get(b"payload", b"").decode("utf-8")

    try:
        payload = json.loads(payload_str)
        payload["attempt_count"] = 0
        new_id = redis_client.xadd(target_stream, {"payload": json.dumps(payload), "status": "pending"})
        redis_client.xdel(dlq_stream, message_id)
        return {
            "status": "requeued",
            "new_job_id": new_id.decode("utf-8") if isinstance(new_id, bytes) else new_id,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
