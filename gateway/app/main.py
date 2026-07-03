from fastapi import FastAPI

from routes.v1.identity import identity_router
from routes.v1.social_accounts import social_accounts_router
from routes.v1.social_posts import social_posts_router
from routes.v1.jobs import jobs_router
from routes.v1.dlq import dlq_router

app = FastAPI(title="Posexei Gateway")

# Register routes
app.include_router(identity_router)
app.include_router(social_accounts_router)
app.include_router(social_posts_router)
app.include_router(jobs_router)
app.include_router(dlq_router)


@app.get("/")
def read_root():
    return {"service": "AD. Publish Gateway", "status": "ok"}


@app.get("/health")
def read_health():
    return {"status": "ok"}
