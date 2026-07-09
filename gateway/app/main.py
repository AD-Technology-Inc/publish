from enum import Enum

from fastapi import FastAPI
from openapi_merger import setup_openapi_merger
from routes.v1.identity import identity_router


class ServiceName(str, Enum):
    IDENTITY = "identity"

"""
TODO: route should always return structured response
"""
app = FastAPI(title="AD. Publish Gateway")

# Register routes
app.include_router(identity_router)

# Merge microservices OpenAPI schemas
setup_openapi_merger(app)


@app.get("/health")
def read_health():
    return {"status": "ok"}
