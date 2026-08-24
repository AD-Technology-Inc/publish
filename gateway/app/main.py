import os
from fastapi import FastAPI

from openapi_merger import setup_openapi_merger
from routes.v1.dlq import dlq_router
from routes.v1.identity import identity_router
from routes.v1.jobs import jobs_router
from routes.v1.social_accounts import social_accounts_router
from routes.v1.social_posts import social_posts_router

SERVICE_NAME = os.getenv("OTEL_SERVICE_NAME", "gateway")

try:
    from shared.telemetry import init_telemetry, setup_logging
    setup_logging(SERVICE_NAME)
    _TELEMETRY_AVAILABLE = True
except ImportError:
    _TELEMETRY_AVAILABLE = False

"""
Gateway: thin reverse-proxy that forwards requests to microservices.
All business logic lives in the individual services.
"""
app = FastAPI(title="AD. Publish Gateway")

if _TELEMETRY_AVAILABLE:
    init_telemetry(SERVICE_NAME, app=app)

# Register routes
app.include_router(identity_router)
app.include_router(social_accounts_router)
app.include_router(social_posts_router)
app.include_router(jobs_router)
app.include_router(dlq_router)

# Merge microservices OpenAPI schemas
setup_openapi_merger(app)


@app.get("/health")
def read_health():
    return {"status": "ok"}
