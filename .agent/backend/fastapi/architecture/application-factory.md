# Skill: .agent/backend/fastapi/architecture/application-factory.md

## 📌 Core Philosophy & Constraints
- **Lifespan Context Manager**: Use `asynccontextmanager` for application lifespan setup/teardown (DB pools, Redis connections).
- **Application Factory**: Instantiate FastAPI via factory function `create_app()`.
- **Global Exception Handlers**: Register central exception handlers for HTTP and Pydantic errors.

## ⚡ Production Boilerplate / Standard Pattern

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_v1_router
from app.core.database import engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    print("🚀 App initialized, database connection pool starting...")
    yield
    # Shutdown logic
    await engine.dispose()
    print("🛑 Database engine connection pool disposed.")

def create_app() -> FastAPI:
    app = FastAPI(
        title="High-Reliability SaaS API",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://app.yourdomain.com"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"]
    )

    app.include_router(api_v1_router, prefix="/api/v1")
    return app

app = create_app()
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Deprecated `@app.on_event("startup")`**: Using deprecated startup event decorators instead of `lifespan`.
- ❌ **Global Hardcoded App Object**: Initializing `app = FastAPI()` at root module level without a factory function wrapper.
- ❌ **Unclosed Engine Pools**: Exiting application processes without disposing database connection pools in lifespan teardown.

## 🔍 Verification & Testing
- **TestClient Lifespan Verification**: Test application lifespan startup and shutdown with `TestClient(app)` context in Pytest.
