from fastapi import APIRouter, Header, Request

from enums import ServiceName
from http_client import forward

social_posts_router = APIRouter(prefix="/social/posts", tags=["social-posts"])


@social_posts_router.post("")
async def create_social_post(
    request: Request,
    x_idempotency_key: str | None = Header(None),
):
    return await forward(
        service_name=ServiceName.SOCIAL_POST,
        method="POST",
        url="http://social-post-service:3001/posts",
        request=request,
    )
