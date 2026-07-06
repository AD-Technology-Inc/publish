# TODO: validate

# ! FIXME: gateway should be forwarder only, no business logic

from fastapi import APIRouter
# from redis import Redis

jobs_router = APIRouter(prefix="/jobs", tags=["jobs"])
# redis_client = Redis(host="redis", port=6379, db=0)

@jobs_router.get("/{job_id}")
def get_job_status(job_id: str):
    # state_raw = redis_client.get(f"job_state:{job_id}")
    # if not state_raw:
    return {"job_id": job_id, "status": "unknown"}
    # status = state_raw.decode("utf-8")
    # result = None
    # if status == "completed":
    #     result_raw = redis_client.get(f"job_result:{job_id}")
    #     result = result_raw.decode("utf-8") if result_raw else None
    # return {"job_id": job_id, "status": status, "result": result}
