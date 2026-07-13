import redis.asyncio as redis
from fastapi import Request, Response
from resilient_http_client import (
    FailureStore,
    ResilientHttpClient,
)

from config import settings

ALLOWED_HEADERS = {"content-type", "authorization"}

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
        r = await client.request(method, url, **kwargs)

        return Response(
            content=r.content,
            status_code=r.status_code,
            headers=r.headers,
            media_type=r.headers.get("content-type"),
        )
