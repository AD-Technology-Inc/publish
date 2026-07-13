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


def _parse_response_data(res: httpx.Response) -> Union[dict, list, str]:
    try:
        return res.json()
    except ValueError:
        return res.text


def _parse_error_data(res_data) -> tuple[str, list]:
    errors = []
    message = str(res_data)

    if isinstance(res_data, dict):
        detail = res_data.get("detail", res_data)

        # If the detail is a stringified JSON 
        # (common in upstream validation errors), parse it
        if isinstance(detail, str) and detail.strip().startswith(("{", "[")):
            try:
                import json

                loaded = json.loads(detail)
                detail = (
                    loaded.get("detail", loaded)
                    if isinstance(loaded, dict)
                    else loaded
                )
            except (ValueError, AttributeError):
                pass

        if isinstance(detail, list):
            errors = detail
            message = "Validation failed"
        else:
            message = str(detail)

    return message, errors


async def _forward(
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

    if request is not None:
        kwargs["content"] = await request.body()
        kwargs["headers"] = dict(request.headers)

    if "headers" in kwargs:
        kwargs["headers"] = {
            k.lower(): v
            for k, v in kwargs["headers"].items()
            if k.lower() in ALLOWED_HEADERS
        }

    store = FailureStore(redis=redis_client, service=service_name)

    async with ResilientHttpClient(service=service_name, store=store) as client:
        try:
            res = await client.request(method, url, **kwargs)
            res_data = _parse_response_data(res)

            if res.is_success:
                return JSONResponse(
                    content={
                        "data": res_data,
                        "message": "Success",
                        "errors": [],
                        "statusCode": res.status_code,
                    },
                    status_code=res.status_code,
                )

            # Handle upstream error responses (4xx)
            message, errors = _parse_error_data(res_data)

            return JSONResponse(
                status_code=res.status_code,
                content={
                    "data": None,
                    "message": message,
                    "errors": errors,
                    "statusCode": res.status_code,
                },
            )

        except CircuitOpenError as e:
            return JSONResponse(
                status_code=503,
                content={
                    "data": None,
                    "message": f"Service temporarily unavailable: {e}",
                    "errors": [],
                    "statusCode": 503,
                },
            )
        except httpx.HTTPStatusError as e:
            # Handle upstream 5xx errors raised by the resilient client
            res_data = _parse_response_data(e.response)
            message, errors = _parse_error_data(res_data)
            return JSONResponse(
                status_code=e.response.status_code,
                content={
                    "data": None,
                    "message": message,
                    "errors": errors,
                    "statusCode": e.response.status_code,
                },
            )
        except httpx.RequestError as e:
            return JSONResponse(
                status_code=503,
                content={
                    "data": None,
                    "message": f"Upstream unavailable: {e}",
                    "errors": [],
                    "statusCode": 503,
                },
            )
