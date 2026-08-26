"""
Instagram Graph API provider service.
"""

import os
from typing import Any

import httpx
from shared.providers.base import BaseSocialProvider, PublishResult, TokenValidationResult
from shared.utils import NonRetryableError, RateLimitExceeded


class InstagramProvider(BaseSocialProvider):
    """Encapsulates Instagram Graph API 2-step media container creation and publishing."""

    def __init__(self, base_url: str | None = None):
        self._base_url = base_url or os.getenv(
            "GRAPH_API_BASE_URL", "https://graph.facebook.com/v19.0"
        )

    @property
    def provider_name(self) -> str:
        return "instagram"

    def validate_token(self, token: str, page_id: str) -> TokenValidationResult:
        """Validate token with Instagram Business Account /me endpoint."""
        url = f"{self._base_url}/me"
        try:
            resp = httpx.get(
                url,
                params={"access_token": token, "fields": "id,name,username"},
                timeout=5.0,
            )
            if resp.status_code in (400, 401, 403):
                return TokenValidationResult(
                    valid=False,
                    page_id=page_id,
                    provider=self.provider_name,
                    error_message=f"Invalid Instagram token: {resp.text}",
                )
            if resp.status_code == 429:
                raise RateLimitExceeded(f"Instagram Graph API 429: {resp.text}")
            resp.raise_for_status()
            data = resp.json()
            return TokenValidationResult(
                valid=True,
                page_id=page_id,
                provider=self.provider_name,
                account_name=data.get("username") or data.get("name"),
            )
        except httpx.RequestError as e:
            raise Exception(f"Network error validating Instagram token: {e}") from e

    def publish(
        self,
        page_id: str,
        message: str,
        token: str,
        job_id: str,
        media_url: str | None = None,
    ) -> PublishResult:
        """Publish media post to Instagram via container creation and publish."""
        if not media_url:
            raise NonRetryableError("Instagram requires a media_url to publish.")

        try:
            # Step 1: Create Container
            container_payload: dict[str, Any] = {
                "image_url": media_url,
                "caption": message,
                "access_token": token,
            }
            container_resp = httpx.post(
                f"{self._base_url}/{page_id}/media",
                data=container_payload,
                timeout=10.0,
            )
            if container_resp.status_code == 429:
                raise RateLimitExceeded(f"Instagram API 429: {container_resp.text}")
            container_resp.raise_for_status()
            creation_id = container_resp.json().get("id")

            # Step 2: Publish Container
            publish_resp = httpx.post(
                f"{self._base_url}/{page_id}/media_publish",
                data={"creation_id": creation_id, "access_token": token},
                timeout=10.0,
            )
            if publish_resp.status_code == 429:
                raise RateLimitExceeded(f"Instagram API 429: {publish_resp.text}")
            publish_resp.raise_for_status()
            data = publish_resp.json()
            post_id = data.get("id", f"ig_{page_id[:8]}")
            return PublishResult(
                platform_post_id=str(post_id),
                provider=self.provider_name,
                page_id=page_id,
                raw_response=data,
            )
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (400, 401, 403, 404):
                raise NonRetryableError(
                    f"Instagram API error ({e.response.status_code}): {e.response.text}"
                ) from e
            raise Exception(
                f"Instagram transient error ({e.response.status_code}): {e.response.text}"
            ) from e
        except httpx.RequestError as e:
            raise Exception(f"Network error posting to Instagram: {e}") from e
