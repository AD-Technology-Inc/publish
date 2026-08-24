from fastapi import APIRouter, HTTPException
from redis import Redis

jobs_router = APIRouter(prefix="/jobs", tags=["jobs"])

redis_client = Redis(host="redis", port=6379, db=0)


@jobs_router.get("/{job_id}")
def get_job_status(job_id: str):
    """
    Retrieve the current status and result for a queued publish job.

    Status values:
      pending     — job is enqueued, not yet picked up by a worker
      processing  — worker has claimed the lease and is executing
      completed   — all steps finished successfully
      failed      — terminal failure (see DLQ for details)
      unknown     — job_id not found (expired TTL or never existed)
    """
    state_raw = redis_client.get(f"job_state:{job_id}")
    if not state_raw:
        raise HTTPException(
            status_code=404,
            detail=f"Job '{job_id}' not found. It may have expired or never existed.",
        )

    status = state_raw.decode("utf-8")
    result: str | None = None

    if status == "completed":
        result_raw = redis_client.get(f"job_result:{job_id}")
        result = result_raw.decode("utf-8") if result_raw else None

    return {"job_id": job_id, "status": status, "result": result}
