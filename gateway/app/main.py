from fastapi import FastAPI, HTTPException, Request, Response
import json
import time
import httpx
import structlog
from pydantic import BaseModel
from typing import Optional, List
from redis import Redis
from routes.v1.identity import identity_router
from prometheus_fastapi_instrumentator import Instrumentator
from opentelemetry import propagate
from opentelemetry.trace import SpanKind, Status, StatusCode
from shared.telemetry import setup_logging, init_telemetry, get_tracer

SERVICE_NAME = "gateway"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)
tracer = get_tracer()

app = FastAPI(title="Posexei Gateway")
Instrumentator().instrument(app).expose(app)

@app.middleware("http")
async def otel_middleware(request: Request, call_next):
    """Manual OpenTelemetry middleware for request tracing and context propagation."""
    parent_context = propagate.extract(request.headers)
    
    span_name = f"{request.method} {request.url.path}"
    with tracer.start_as_current_span(
        span_name,
        context=parent_context,
        kind=SpanKind.SERVER,
        attributes={
            "http.method": request.method,
            "http.url": str(request.url),
            "http.path": request.url.path,
        }
    ) as span:
        start_time = time.monotonic()
        try:
            response: Response = await call_next(request)
            
            duration = time.monotonic() - start_time
            span.set_attribute("http.status_code", response.status_code)
            span.set_attribute("http.duration_ms", duration * 1000)
            
            if response.status_code >= 400:
                span.set_status(Status(StatusCode.ERROR))
            else:
                span.set_status(Status(StatusCode.OK))
                
            return response
        except Exception as e:
            span.record_exception(e)
            span.set_status(Status(StatusCode.ERROR, str(e)))
            raise

redis_client = Redis(host="redis", port=6379, db=0)

app.include_router(identity_router)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _forward(method: str, url: str, **kwargs):
    """Forward a request to an internal service and surface errors."""
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.request(method, url, timeout=10.0, **kwargs)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Upstream unavailable: {e}")


# ---------------------------------------------------------------------------
# Utility
# ---------------------------------------------------------------------------

@app.get("/")
def read_root():
    return {"service": "Posexei Gateway", "status": "ok"}


@app.get("/health")
def read_health():
    raise HTTPException(status_code=500, detail="server unavailable")
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Job Status  (checked by frontend polling)
# ---------------------------------------------------------------------------

@app.get("/jobs/{job_id}")
def get_job_status(job_id: str):
    state_raw = redis_client.get(f"job_state:{job_id}")
    if not state_raw:
        return {"job_id": job_id, "status": "unknown"}
    status = state_raw.decode("utf-8")
    result = None
    if status == "completed":
        result_raw = redis_client.get(f"job_result:{job_id}")
        result = result_raw.decode("utf-8") if result_raw else None
    return {"job_id": job_id, "status": status, "result": result}


# ---------------------------------------------------------------------------
# Accounts  (proxy to social-account-service)
# ---------------------------------------------------------------------------

class ConnectAccountRequest(BaseModel):
    provider: str
    name: str
    page_id: str
    access_token: str


@app.get("/accounts")
async def list_accounts():
    return await _forward("GET", "http://social-account-service:3001/accounts")


@app.post("/accounts", status_code=201)
async def connect_account(req: ConnectAccountRequest):
    return await _forward("POST", "http://social-account-service:3001/accounts", json=req.model_dump())


@app.delete("/accounts/{account_id}", status_code=204)
async def disconnect_account(account_id: str):
    await _forward("DELETE", f"http://social-account-service:3001/accounts/{account_id}")
    return None


# ---------------------------------------------------------------------------
# Posts  (proxy to social-post-service — enqueue publish job)
# ---------------------------------------------------------------------------

class PostRequest(BaseModel):
    page_id: str
    provider: str
    message: str
    media_url: Optional[str] = None
    platforms: Optional[List[str]] = None


@app.post("/social/posts")
async def create_social_post(request: PostRequest):
    return await _forward(
        "POST",
        "http://social-post-service:3001/posts",
        json=request.model_dump(),
    )


# ---------------------------------------------------------------------------
# DLQ management
# ---------------------------------------------------------------------------

@app.get("/dlq/{service_name}")
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


@app.post("/dlq/{service_name}/{message_id}/replay")
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
