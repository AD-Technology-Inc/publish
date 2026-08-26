from fastapi import APIRouter, Header, Request

from enums import ServiceName
from http_client import forward

social_publish_router = APIRouter(prefix="/social/publish", tags=["social-publish"])


@social_publish_router.post("")
async def publish_social_post(
    request: Request,
    x_idempotency_key: str | None = Header(None),
):
    return await forward(
        service_name=ServiceName.SOCIAL_PUBLISH,
        method="POST",
        url="http://social-publish-service:8000/publish",
        request=request,
    )
