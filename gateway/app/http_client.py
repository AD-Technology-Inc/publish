from typing import Union

import httpx
import redis.asyncio as redis
from fastapi import Request
from fastapi.responses import JSONResponse
from resilient_http_client import (
    CircuitOpenError,
    FailureStore,
    ResilientHttpClient,
)

from config import settings

# Define your allowed headers (always lowercase for safe comparison)
ALLOWED_HEADERS = {"content-type", "authorization"}

# Initialize global Redis client for FailureStore
redis_client = redis.Redis(
    host=settings.redis_host,
    port=settings.redis_port,
    decode_responses=True,
)


async def forward(
    service_name: str,
    method: str,
    url: str,
    request: Request | None = None,
    **kwargs,
):
    """
    Forward a request to an internal service,
    restricting headers and surfacing errors.
    """
    kwargs = await _prepare_request_args(request, kwargs)
    store = FailureStore(redis=redis_client, service=service_name)

    async with ResilientHttpClient(service=service_name, store=store) as client:
        try:
            res = await client.request(method, url, **kwargs)
            return _handle_response(res)
        except Exception as e:
            return _handle_exception(e)


# --- Request & Response Preparation ---


async def _prepare_request_args(request: Request | None, kwargs: dict) -> dict:
    """Extract and filter headers and body from incoming request if present."""
    if request is not None:
        kwargs["content"] = await request.body()
        kwargs["headers"] = dict(request.headers)

    if "headers" in kwargs:
        kwargs["headers"] = {
            k.lower(): v
            for k, v in kwargs["headers"].items()
            if k.lower() in ALLOWED_HEADERS
        }
    return kwargs


def _response(
    data, status_code=200, message="Success", errors=None
) -> JSONResponse:
    """Format and return a standardized JSONResponse."""
    return JSONResponse(
        content={
            "data": data,
            "message": message,
            "errors": errors or [],
            "statusCode": status_code,
        },
        status_code=status_code,
    )


# --- Exception & Parsing Helpers ---


def _handle_response(res: httpx.Response) -> JSONResponse:
    """Parse HTTP Response and handle success or upstream validation errors."""
    res_data = _parse_response_data(res)
    if res.is_success:
        return _response(data=res_data, status_code=res.status_code)

    # Handle upstream error responses (4xx)
    message, errors = _parse_error_data(res_data)
    return _response(
        data=None,
        status_code=res.status_code,
        message=message,
        errors=errors,
    )


def _handle_exception(e: Exception) -> JSONResponse:
    """
    Map resilience and HTTP client exceptions
    to standardized API responses.
    """
    if isinstance(e, CircuitOpenError):
        return _response(
            data=None,
            status_code=503,
            message=f"Service temporarily unavailable: {e}",
        )
    elif isinstance(e, httpx.HTTPStatusError):
        # Handle upstream 5xx errors raised by the resilient client
        res_data = _parse_response_data(e.response)
        message, errors = _parse_error_data(res_data)
        return _response(
            data=None,
            status_code=e.response.status_code,
            message=message,
            errors=errors,
        )
    elif isinstance(e, httpx.RequestError):
        return _response(
            data=None,
            status_code=503,
            message=f"Upstream unavailable: {e}",
        )
    raise e


def _parse_response_data(res: httpx.Response) -> Union[dict, list, str]:
    """Safely extract response content as JSON or plain text."""
    try:
        return res.json()
    except ValueError:
        return res.text


def _parse_error_data(res_data) -> tuple[str, list]:
    """Extract message and errors list from response data."""
    errors = []
    message = str(res_data)

    if isinstance(res_data, dict):
        detail = res_data.get("detail", res_data)
        detail = _try_parse_json_detail(detail)

        if isinstance(detail, list):
            errors = detail
            message = "Validation failed"
        else:
            message = str(detail)

    return message, errors


def _try_parse_json_detail(detail):
    """Safely parse detail string if it contains stringified JSON."""
    if isinstance(detail, str) and detail.strip().startswith(("{", "[")):
        try:
            import json

            loaded = json.loads(detail)
            return (
                loaded.get("detail", loaded)
                if isinstance(loaded, dict)
                else loaded
            )
        except (ValueError, AttributeError):
            pass

    return detail
