from fastapi import FastAPI, Header, HTTPException, Request, Response
from pydantic import BaseModel
from typing import Optional, List
import structlog
import uuid
import time
import json
from shared.queue import RedisQueue
from shared.telemetry import setup_logging, init_telemetry, get_tracer
from redis import Redis
from prometheus_fastapi_instrumentator import Instrumentator
from opentelemetry import propagate
from opentelemetry.trace import SpanKind, Status, StatusCode

SERVICE_NAME = "social-post-service"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)
tracer = get_tracer()

app = FastAPI(title="Social Post Service")
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
queue = RedisQueue(redis_client, stream_name="jobs:social-post")


class PostRequest(BaseModel):
    page_id: str
    provider: str = "facebook"
    message: str
    media_url: Optional[str] = None
    platforms: Optional[List[str]] = None


@app.post("/posts")
def create_post(request: PostRequest, x_idempotency_key: Optional[str] = Header(None)):
    # Backpressure: Prevent queue overload
    try:
        q_len = redis_client.xlen("jobs:social-post")
        if q_len > 10000:
            raise HTTPException(status_code=429, detail="Queue overload, please try again later")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        logger.warning(f"Failed to check queue length: {e}")

    idem_key = x_idempotency_key if x_idempotency_key else str(uuid.uuid4())
    job_id = queue.enqueue({
        "type": "create_post",
        "page_id": request.page_id,
        "provider": request.provider,
        "message": request.message,
        "media_url": request.media_url,
        "idempotency_key": idem_key,
        "job_id": idem_key,
    })

    # Initialise state so the frontend's very first poll returns "pending" not "unknown"
    redis_client.set(f"job_state:{job_id}", "pending", ex=86400)

    return {"status": "enqueued", "job_id": job_id}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/dlq/{stream_name}")
def get_dlq(stream_name: str, limit: int = 50):
    dlq_stream = f"jobs:{stream_name}:dlq"
    try:
        messages = redis_client.xrange(dlq_stream, min="-", max="+", count=limit)
        results = []
        for msg_id, data in messages:
            results.append({
                "message_id": msg_id.decode("utf-8"),
                "data": {k.decode("utf-8"): v.decode("utf-8") for k, v in data.items()}
            })
        return {"stream": dlq_stream, "messages": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/dlq/{stream_name}/replay/{message_id}")
def replay_dlq_message(stream_name: str, message_id: str):
    dlq_stream = f"jobs:{stream_name}:dlq"
    main_stream = f"jobs:{stream_name}"
    
    messages = redis_client.xrange(dlq_stream, min=message_id, max=message_id, count=1)
    if not messages:
        raise HTTPException(status_code=404, detail="Message not found in DLQ")
        
    _, data = messages[0]
    
    payload_str = data.get(b"payload")
    if not payload_str:
        raise HTTPException(status_code=400, detail="Invalid DLQ message format")
        
    try:
        payload = json.loads(payload_str.decode("utf-8"))
        payload["attempt_count"] = 0
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Cannot decode payload")
        
    q = RedisQueue(redis_client, stream_name=main_stream)
    new_id = q.enqueue(payload)
    
    redis_client.xdel(dlq_stream, message_id)
    
    return {"status": "replayed", "new_message_id": new_id, "original_message_id": message_id}
