from fastapi import FastAPI, Request, Response
from pydantic import BaseModel
from typing import Optional
import structlog
import uuid
import time
from shared.queue import RedisQueue
from shared.telemetry import setup_logging, init_telemetry, get_tracer
from redis import Redis
from prometheus_fastapi_instrumentator import Instrumentator
from opentelemetry import propagate
from opentelemetry.trace import SpanKind, Status, StatusCode

SERVICE_NAME = "social-publish-service"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)
tracer = get_tracer()

app = FastAPI(title="Social Publish Service")
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
queue = RedisQueue(redis_client, stream_name="jobs:social-publish")


class PublishRequest(BaseModel):
    page_id: str
    provider: str           # "facebook" | "instagram" | etc
    message: str
    media_url: Optional[str] = None
    post_db_id: Optional[str] = None  # reference back to social-post-service record


@app.post("/publish")
def publish_post(req: PublishRequest):
    idem_key = str(uuid.uuid4())
    job_id = queue.enqueue({
        "type": "publish_post",
        "page_id": req.page_id,
        "provider": req.provider,
        "message": req.message,
        "media_url": req.media_url,
        "post_db_id": req.post_db_id,
        "idempotency_key": idem_key,
        "job_id": idem_key,
    })
    redis_client.set(f"job_state:{job_id}", "pending", ex=86400)
    return {"status": "enqueued", "job_id": job_id}


@app.get("/health")
def health():
    return {"status": "ok"}
