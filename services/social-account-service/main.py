from fastapi import FastAPI, HTTPException, Request, Response
from pydantic import BaseModel
from typing import List
import structlog
import uuid
import json
import time
from shared.queue import RedisQueue
from shared.telemetry import setup_logging, init_telemetry, get_tracer
from redis import Redis
from prometheus_fastapi_instrumentator import Instrumentator
from opentelemetry import propagate
from opentelemetry.trace import SpanKind, Status, StatusCode

SERVICE_NAME = "social-account-service"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)
tracer = get_tracer()

app = FastAPI(title="Social Account Service")
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
queue = RedisQueue(redis_client, stream_name="jobs:social-account")

# ---------------------------------------------------------------------------
# In-memory store (replace with real DB in production)
# Key schema: accounts:<account_id> -> JSON blob
# Set of all accounts: accounts:all -> list of IDs
# ---------------------------------------------------------------------------

PROVIDER_LABELS = {
    "facebook": "Facebook",
    "instagram": "Instagram",
    "twitter": "Twitter / X",
    "linkedin": "LinkedIn",
}


class ConnectAccountRequest(BaseModel):
    provider: str          # "facebook" | "instagram" | "twitter" | "linkedin"
    name: str              # display name / page name
    page_id: str           # platform-specific page/profile id
    access_token: str      # Page Access Token or OAuth token


class AccountOut(BaseModel):
    id: str
    provider: str
    name: str
    page_id: str
    status: str            # "connected" | "expired"
    connected_at: str


def _all_accounts() -> List[dict]:
    ids_raw = redis_client.get("accounts:all")
    if not ids_raw:
        return []
    ids: list[str] = json.loads(ids_raw)
    accounts = []
    for aid in ids:
        raw = redis_client.get(f"accounts:{aid}")
        if raw:
            accounts.append(json.loads(raw))
    return accounts


def _save_account(account: dict):
    aid = account["id"]
    redis_client.set(f"accounts:{aid}", json.dumps(account))
    ids_raw = redis_client.get("accounts:all")
    ids: list[str] = json.loads(ids_raw) if ids_raw else []
    if aid not in ids:
        ids.append(aid)
    redis_client.set("accounts:all", json.dumps(ids))
    # Also persist the access token separately (lookup by provider:page_id)
    redis_client.set(f"token:{account['provider']}:{account['page_id']}", account["access_token"])


def _delete_account(account_id: str):
    raw = redis_client.get(f"accounts:{account_id}")
    if raw:
        account = json.loads(raw)
        redis_client.delete(f"token:{account['provider']}:{account['page_id']}")
    redis_client.delete(f"accounts:{account_id}")
    ids_raw = redis_client.get("accounts:all")
    if ids_raw:
        ids = [i for i in json.loads(ids_raw) if i != account_id]
        redis_client.set("accounts:all", json.dumps(ids))


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/accounts", response_model=List[AccountOut])
def list_accounts():
    return _all_accounts()


@app.post("/accounts", response_model=AccountOut, status_code=201)
def connect_account(req: ConnectAccountRequest):
    if req.provider not in PROVIDER_LABELS:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {req.provider}")

    # Check for duplicate (same provider + page_id)
    existing = [a for a in _all_accounts()
                if a["provider"] == req.provider and a["page_id"] == req.page_id]
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Account already connected for {req.provider} / {req.page_id}"
        )

    account_id = str(uuid.uuid4())
    from datetime import datetime, timezone
    account = {
        "id": account_id,
        "provider": req.provider,
        "name": req.name,
        "page_id": req.page_id,
        "access_token": req.access_token,
        "status": "connected",
        "connected_at": datetime.now(timezone.utc).strftime("%b %d, %Y"),
    }
    _save_account(account)

    # Enqueue an async job to validate the token with the platform
    idem_key = f"link:{account_id}"
    job_id = queue.enqueue({
        "type": "account_link",
        "account_id": account_id,
        "provider": req.provider,
        "page_id": req.page_id,
        "idempotency_key": idem_key,
    })
    logger.info(f"Account {account_id} queued for validation. job_id={job_id}")

    return account


@app.delete("/accounts/{account_id}", status_code=204)
def disconnect_account(account_id: str):
    raw = redis_client.get(f"accounts:{account_id}")
    if not raw:
        raise HTTPException(status_code=404, detail="Account not found")
    _delete_account(account_id)
    return None


@app.get("/accounts/token/{provider}/{page_id}")
def get_token(provider: str, page_id: str):
    """Internal endpoint to retrieve the stored access token."""
    token = redis_client.get(f"token:{provider}:{page_id}")
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
    return {"access_token": token.decode("utf-8")}


@app.get("/health")
def health():
    return {"status": "ok"}
