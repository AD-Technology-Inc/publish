from fastapi import FastAPI

from routes.v1.identity import identity_router

"""
TODO: route should always return structured response
"""
app = FastAPI(title="AD. Publish Gateway")

# Register routes
app.include_router(identity_router)


@app.get("/health")
def read_health():
    return {"status": "ok"}
