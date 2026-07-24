# Skill: .agent/backend/fastapi/router-development/error-handling.md

## 📌 Core Philosophy & Constraints
- **RFC 7807 Problem Details Handlers**: Global exception handlers MUST output `application/problem+json` format.
- **Custom Application Exceptions**: Inherit domain errors from base `DomainException` classes.
- **Pydantic Validation Format**: Override default `RequestValidationError` to return standardized field error dictionaries.

## ⚡ Production Boilerplate / Standard Pattern

```python
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

class DomainException(Exception):
    def __init__(self, title: str, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.title = title
        self.detail = detail
        self.status_code = status_code

def setup_exception_handlers(app: FastAPI):
    @app.exception_handler(DomainException)
    async def domain_exception_handler(request: Request, exc: DomainException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "type": "about:blank",
                "title": exc.title,
                "status": exc.status_code,
                "detail": exc.detail,
                "instance": request.url.path
            },
            headers={"Content-Type": "application/problem+json"}
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                "title": "Validation Error",
                "status": 422,
                "detail": "Input request body or query parameters failed validation checks.",
                "instance": request.url.path,
                "errors": [{"field": ".".join(str(x) for x in err["loc"]), "message": err["msg"]} for err in exc.errors()]
            },
            headers={"Content-Type": "application/problem+json"}
        )
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Uncaught Exceptions in Routers**: Allowing raw 500 Unhandled Exceptions to leak internal Python stack traces.
- ❌ **Inconsistent Validation Payload Keys**: Returning raw Pydantic `loc` tuples without converting to dot-notation strings.
- ❌ **Status 200 with Error JSON**: Returning status 200 HTTP codes while payload contains `{ "error": true }`.

## 🔍 Verification & Testing
- **Pytest Error Payload Test**: Trigger 422 validation error in Pytest asserting response header `Content-Type: application/problem+json`.
