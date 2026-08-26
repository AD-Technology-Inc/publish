from pydantic import BaseModel, ConfigDict, Field


class PostRequest(BaseModel):
    page_id: str = Field(min_length=1, description="Target page or profile ID")
    provider: str = Field(default="facebook", description="Platform provider")
    message: str = Field(min_length=1, description="Content message for the post")
    media_url: str | None = None
    platforms: list[str] | None = None


class PostResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    job_id: str
    page_id: str
    provider: str
    message: str
    media_url: str | None = None
    status: str
    created_at: str


class CreatePostResponse(BaseModel):
    status: str
    job_id: str
    post_id: str
