"""
Base abstractions and contract definitions for 3rd-party social media providers.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class TokenValidationResult:
    """Represents the outcome of a third-party token validation check."""

    valid: bool
    page_id: str
    provider: str
    account_name: str | None = None
    scopes: list[str] | None = None
    error_message: str | None = None


@dataclass(frozen=True)
class PublishResult:
    """Represents the outcome of a post publishing operation."""

    platform_post_id: str
    provider: str
    page_id: str
    permalink: str | None = None
    raw_response: dict[str, Any] | None = None


class BaseSocialProvider(ABC):
    """Abstract base class that every third-party social media provider must implement."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """The canonical name of the provider (e.g. 'facebook', 'linkedin')."""
        pass

    @abstractmethod
    def validate_token(self, token: str, page_id: str) -> TokenValidationResult:
        """Validate that the given access token is active and authorized for the page."""
        pass

    @abstractmethod
    def publish(
        self,
        page_id: str,
        message: str,
        token: str,
        job_id: str,
        media_url: str | None = None,
    ) -> PublishResult:
        """Publish a post to the social media platform."""
        pass
