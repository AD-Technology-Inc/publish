import time
import uuid
import structlog
from fastapi import FastAPI, Request, Response
from redis import Redis
from opentelemetry import trace, propagate
from opentelemetry.trace import SpanKind, Status, StatusCode
from prometheus_fastapi_instrumentator import Instrumentator

from shared.queue import RedisQueue
from shared.telemetry import setup_logging, init_telemetry, get_tracer
"""
pip install fastapi sqlalchemy alembic asyncpg uvicorn
alembic revision --autogenerate -m "create users table"
alembic upgrade head

async with session.begin():
    alice.balance -= 1000
    bob.balance += 1000
    # actions...

"""


# Manual Initialization
SERVICE_NAME = "identity-service"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)
tracer = get_tracer()

app = FastAPI(title="Identity Service")
Instrumentator().instrument(app).expose(app)

@app.middleware("http")
async def otel_middleware(request: Request, call_next):
    """Manual OpenTelemetry middleware for request tracing and context propagation."""
    # Extract parent context from headers
    parent_context = propagate.extract(request.headers)
    
    # Start manual span
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
queue = RedisQueue(redis_client, stream_name="jobs:identity")

@app.get("/users")
def get_users():
    logger.info("Fetching all users")
    return [{"id": 1, "name": "Alice"}]

@app.get("/users/{user_id}")
def get_user(user_id: int):
    logger.info("Fetching user", user_id=user_id)
    return {"id": user_id, "name": "Some User"}

@app.post("/users")
def create_user(user: dict):
    idem_key = str(uuid.uuid4())
    logger.info("Enqueuing user creation", idempotency_key=idem_key)
    job_id = queue.enqueue({
        "type": "create_user",
        "user": user,
        "idempotency_key": idem_key
    })
    return {"status": "enqueued", "job_id": job_id}

@app.get("/health")
def health():
    return {"status": "ok"}
