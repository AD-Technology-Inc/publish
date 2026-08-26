from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, computed_field

PROVIDER_LABELS = {
    "facebook": "Facebook",
    "instagram": "Instagram",
    "twitter": "Twitter / X",
    "linkedin": "LinkedIn",
}


class ConnectAccountRequest(BaseModel):
    provider: str = Field(description="Social media provider e.g. facebook, twitter, instagram, linkedin")
    name: str = Field(min_length=1, max_length=255, description="Display name or page name")
    page_id: str = Field(min_length=1, max_length=255, description="Platform-specific page or profile ID")
    access_token: str = Field(min_length=1, description="OAuth Access token")


class AccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    provider: str
    name: str
    page_id: str
    status: str
    created_at: datetime

    @computed_field
    @property
    def connected_at(self) -> str:
        return self.created_at.strftime("%b %d, %Y")
