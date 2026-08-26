import structlog
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.auth.router import router as auth_router
from app.users.router import router as users_router

SERVICE_NAME = "identity-service"

try:
    from shared.telemetry import init_telemetry, setup_logging
    setup_logging(SERVICE_NAME)
    _SHARED_TELEMETRY = True
except ImportError:
    _SHARED_TELEMETRY = False

app = FastAPI(title="Identity Service")

if _SHARED_TELEMETRY:
    init_telemetry(SERVICE_NAME, app=app)

logger = structlog.get_logger(__name__)

# Register routers
app.include_router(users_router)
app.include_router(auth_router)


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request, exc: IntegrityError):
    message = str(exc.orig)
    detail = "Database integrity violation"
    if "DETAIL:" in message:
        detail = message.split("DETAIL:")[-1].strip()
    elif "duplicate key" in message:
        detail = "Duplicate entry detected"

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST, content={"detail": detail}
    )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    from fastapi.exceptions import RequestValidationError
    from starlette.exceptions import HTTPException as StarletteHTTPException

    if isinstance(exc, (StarletteHTTPException, RequestValidationError)):
        raise exc

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal Server Error: {exc!s}"},
    )


@app.get("/health")
def health():
    return {"status": "ok"}
