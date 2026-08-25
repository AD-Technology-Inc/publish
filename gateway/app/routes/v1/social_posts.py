from fastapi import APIRouter, Header, Request

from enums import ServiceName
from http_client import forward

social_posts_router = APIRouter(prefix="/social/posts", tags=["social-posts"])


@social_posts_router.get("")
async def list_social_posts():
    return await forward(
        service_name=ServiceName.SOCIAL_POST,
        method="GET",
        url="http://social-post-service:8000/posts",
    )


@social_posts_router.post("")
async def create_social_post(
    request: Request,
    x_idempotency_key: str | None = Header(None),
):
    return await forward(
        service_name=ServiceName.SOCIAL_POST,
        method="POST",
        url="http://social-post-service:8000/posts",
        request=request,
    )
