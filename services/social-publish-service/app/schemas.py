from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PublishRequest(BaseModel):
    page_id: str = Field(min_length=1, description="Target page or profile ID")
    provider: str = Field(description="Target platform: facebook, instagram, linkedin, twitter, threads")
    message: str = Field(min_length=1, description="Post content message")
    media_url: str | None = None
    post_db_id: str | None = None
    idempotency_key: str | None = None


class PublishResponse(BaseModel):
    status: str
    job_id: str


class PublishJobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    job_id: str
    page_id: str
    provider: str
    message: str
    media_url: str | None = None
    post_db_id: str | None = None
    status: str
    platform_post_id: str | None = None
    error_message: str | None = None
    created_at: datetime
