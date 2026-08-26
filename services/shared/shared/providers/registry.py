"""
Provider registry and factory for 3rd-party social media providers.
"""

from shared.providers.base import BaseSocialProvider
from shared.providers.facebook import FacebookProvider
from shared.providers.instagram import InstagramProvider
from shared.providers.linkedin import LinkedInProvider
from shared.providers.threads import ThreadsProvider

_PROVIDERS: dict[str, BaseSocialProvider] = {
    "facebook": FacebookProvider(),
    "linkedin": LinkedInProvider(),
    "instagram": InstagramProvider(),
    "threads": ThreadsProvider(),
}


def get_provider(provider_name: str) -> BaseSocialProvider | None:
    """Retrieve the provider instance for the given platform name."""
    return _PROVIDERS.get(provider_name.lower().strip())


def register_provider(provider: BaseSocialProvider) -> None:
    """Register a custom or test social media provider."""
    _PROVIDERS[provider.provider_name.lower().strip()] = provider


def list_supported_providers() -> list[str]:
    """Return a list of all registered provider names."""
    return list(_PROVIDERS.keys())
