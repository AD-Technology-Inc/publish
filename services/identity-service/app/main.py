from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.users.router import router as users_router

app = FastAPI(title="Identity Service")

# Register routers
app.include_router(users_router)


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request, exc: IntegrityError):
    # Extract the original database driver error message (e.g. UniqueViolationError)
    message = str(exc.orig)
    
    # Extract the DETAIL block if available for cleaner representation
    detail = "Database integrity violation"
    if "DETAIL:" in message:
        detail = message.split("DETAIL:")[-1].strip()
    elif "duplicate key" in message:
        detail = "Duplicate entry detected"

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": detail}
    )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    from fastapi.exceptions import RequestValidationError
    from starlette.exceptions import HTTPException as StarletteHTTPException

    # Let FastAPI's default handlers process validation and HTTP exceptions
    if isinstance(exc, (StarletteHTTPException, RequestValidationError)):
        raise exc

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )


@app.get("/health")
def health():
    return {"status": "ok"}
