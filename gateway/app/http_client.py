from typing import Union

import httpx
from fastapi import Request
from fastapi.responses import JSONResponse

# Define your allowed headers (always lowercase for safe comparison)
ALLOWED_HEADERS = {"content-type", "authorization"}


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

        # If the detail is a stringified JSON (common in upstream validation errors), parse it
        if isinstance(detail, str) and detail.strip().startswith(("{", "[")):
            try:
                import json

                loaded = json.loads(detail)
                detail = (
                    loaded.get("detail", loaded) if isinstance(loaded, dict) else loaded
                )
            except (ValueError, AttributeError):
                pass

        if isinstance(detail, list):
            errors = detail
            message = "Validation failed"
        else:
            message = str(detail)

    return message, errors


async def _forward(method: str, url: str, request: Request | None = None, **kwargs):
    """Forward a request to an internal service, restricting headers and surfacing errors."""

    if request is not None:
        kwargs["content"] = await request.body()
        kwargs["headers"] = dict(request.headers)

    if "headers" in kwargs:
        kwargs["headers"] = {
            k.lower(): v
            for k, v in kwargs["headers"].items()
            if k.lower() in ALLOWED_HEADERS
        }

    async with httpx.AsyncClient() as client:
        try:
            res = await client.request(method, url, timeout=10.0, **kwargs)
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

            # Handle upstream error responses
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
