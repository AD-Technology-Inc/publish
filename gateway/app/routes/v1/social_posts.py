# TODO: validate


from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from http_client import _forward

social_posts_router = APIRouter(prefix="/social/posts", tags=["social-posts"])


class PostRequest(BaseModel):
    page_id: str
    provider: str
    message: str
    media_url: Optional[str] = None
    platforms: Optional[List[str]] = None


@social_posts_router.post("")
async def create_social_post(request: PostRequest):
    return await _forward(
        "POST",
        "http://social-post-service:3001/posts",
        json=request.model_dump(),
    )
