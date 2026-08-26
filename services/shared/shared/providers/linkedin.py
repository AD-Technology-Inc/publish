"""
LinkedIn REST API v2 provider service.
"""

import os
from typing import Any

import httpx
from shared.providers.base import BaseSocialProvider, PublishResult, TokenValidationResult
from shared.utils import NonRetryableError, RateLimitExceeded


class LinkedInProvider(BaseSocialProvider):
    """Encapsulates LinkedIn REST API v2 for UGC posting and token verification."""

    def __init__(self, base_url: str | None = None):
        self._base_url = base_url or os.getenv(
            "LINKEDIN_API_BASE_URL", "https://api.linkedin.com/v2"
        )

    @property
    def provider_name(self) -> str:
        return "linkedin"

    def validate_token(self, token: str, page_id: str) -> TokenValidationResult:
        """Validate token with LinkedIn /userinfo endpoint."""
        url = f"{self._base_url}/userinfo"
        headers = {"Authorization": f"Bearer {token}"}
        try:
            resp = httpx.get(url, headers=headers, timeout=5.0)
            if resp.status_code in (400, 401, 403):
                return TokenValidationResult(
                    valid=False,
                    page_id=page_id,
                    provider=self.provider_name,
                    error_message=f"Invalid LinkedIn token: {resp.text}",
                )
            if resp.status_code == 429:
                raise RateLimitExceeded(f"LinkedIn API 429: {resp.text}")
            resp.raise_for_status()
            data = resp.json()
            return TokenValidationResult(
                valid=True,
                page_id=page_id,
                provider=self.provider_name,
                account_name=data.get("name"),
            )
        except httpx.RequestError as e:
            raise Exception(f"Network error validating LinkedIn token: {e}") from e

    def publish(
        self,
        page_id: str,
        message: str,
        token: str,
        job_id: str,
        media_url: str | None = None,
    ) -> PublishResult:
        """Publish UGC post or article to LinkedIn organization page."""
        url = f"{self._base_url}/ugcPosts"
        headers = {
            "Authorization": f"Bearer {token}",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
        }
        share_content: dict[str, Any] = {
            "shareCommentary": {"text": message},
            "shareMediaCategory": "NONE",
        }
        if media_url:
            share_content["shareMediaCategory"] = "ARTICLE"
            share_content["media"] = [{"status": "READY", "originalUrl": media_url}]

        payload: dict[str, Any] = {
            "author": f"urn:li:organization:{page_id}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": share_content
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            },
        }

        try:
            resp = httpx.post(url, headers=headers, json=payload, timeout=10.0)
            if resp.status_code == 429:
                raise RateLimitExceeded(f"LinkedIn API 429 rate limit: {resp.text}")
            resp.raise_for_status()
            data = resp.json()
            post_id = data.get("id", f"urn:li:share:{page_id[:8]}")
            return PublishResult(
                platform_post_id=str(post_id),
                provider=self.provider_name,
                page_id=page_id,
                raw_response=data,
            )
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (400, 401, 403, 404):
                raise NonRetryableError(
                    f"LinkedIn API error ({e.response.status_code}): {e.response.text}"
                ) from e
            raise Exception(
                f"LinkedIn transient error ({e.response.status_code}): {e.response.text}"
            ) from e
        except httpx.RequestError as e:
            raise Exception(f"Network error posting to LinkedIn: {e}") from e
