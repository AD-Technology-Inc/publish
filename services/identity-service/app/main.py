from fastapi import FastAPI

from app.users.router import router as users_router

app = FastAPI(title="Identity Service")

# Register routers
app.include_router(users_router)


@app.get("/health")
def health():
    return {"status": "ok"}
