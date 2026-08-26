"""
Meta Facebook Graph API provider service.
"""

import os
from typing import Any

import httpx
from shared.providers.base import BaseSocialProvider, PublishResult, TokenValidationResult
from shared.utils import NonRetryableError, RateLimitExceeded


class FacebookProvider(BaseSocialProvider):
    """Encapsulates Meta Graph API communication for Facebook Page posting and token verification."""

    def __init__(self, base_url: str | None = None):
        self._base_url = base_url or os.getenv(
            "GRAPH_API_BASE_URL", "https://graph.facebook.com/v19.0"
        )

    @property
    def provider_name(self) -> str:
        return "facebook"

    def validate_token(self, token: str, page_id: str) -> TokenValidationResult:
        """Validate token with Meta Graph API /me endpoint."""
        url = f"{self._base_url}/me"
        try:
            resp = httpx.get(
                url,
                params={"access_token": token, "fields": "id,name"},
                timeout=5.0,
            )
            if resp.status_code in (400, 401, 403):
                return TokenValidationResult(
                    valid=False,
                    page_id=page_id,
                    provider=self.provider_name,
                    error_message=f"Invalid Facebook token: {resp.text}",
                )
            if resp.status_code == 429:
                raise RateLimitExceeded(f"Facebook Graph API 429: {resp.text}")
            resp.raise_for_status()
            data = resp.json()
            return TokenValidationResult(
                valid=True,
                page_id=page_id,
                provider=self.provider_name,
                account_name=data.get("name"),
            )
        except httpx.RequestError as e:
            raise Exception(f"Network error validating Facebook token: {e}") from e

    def publish(
        self,
        page_id: str,
        message: str,
        token: str,
        job_id: str,
        media_url: str | None = None,
    ) -> PublishResult:
        """Publish post or photo to Facebook Page feed."""
        url = f"{self._base_url}/{page_id}/feed"
        payload: dict[str, Any] = {
            "message": message,
            "access_token": token,
        }
        if media_url:
            payload["link"] = media_url

        try:
            resp = httpx.post(url, data=payload, timeout=10.0)
            if resp.status_code == 429:
                raise RateLimitExceeded(f"Facebook API 429 rate limit: {resp.text}")
            resp.raise_for_status()
            data = resp.json()
            post_id = data.get("id", f"{page_id}_{job_id[:8]}")
            return PublishResult(
                platform_post_id=str(post_id),
                provider=self.provider_name,
                page_id=page_id,
                raw_response=data,
            )
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (400, 401, 403, 404):
                raise NonRetryableError(
                    f"Facebook API error ({e.response.status_code}): {e.response.text}"
                ) from e
            raise Exception(
                f"Facebook transient error ({e.response.status_code}): {e.response.text}"
            ) from e
        except httpx.RequestError as e:
            raise Exception(f"Network error posting to Facebook: {e}") from e
