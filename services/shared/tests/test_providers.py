"""
Unit tests for shared 3rd-party social media providers.
"""

from unittest.mock import patch

import httpx
import pytest
from shared.providers import (
    FacebookProvider,
    InstagramProvider,
    LinkedInProvider,
    ThreadsProvider,
    get_provider,
    list_supported_providers,
)
from shared.utils import NonRetryableError, RateLimitExceeded


# ---------------------------------------------------------------------------
# Registry Tests
# ---------------------------------------------------------------------------
def test_list_supported_providers():
    providers = list_supported_providers()
    assert "facebook" in providers
    assert "linkedin" in providers
    assert "instagram" in providers
    assert "threads" in providers


def test_get_provider():
    fb = get_provider("facebook")
    assert isinstance(fb, FacebookProvider)
    assert fb.provider_name == "facebook"

    li = get_provider("LinkedIn")
    assert isinstance(li, LinkedInProvider)

    ig = get_provider("INSTAGRAM ")
    assert isinstance(ig, InstagramProvider)

    th = get_provider("threads")
    assert isinstance(th, ThreadsProvider)

    assert get_provider("unknown_platform") is None


# ---------------------------------------------------------------------------
# FacebookProvider Tests
# ---------------------------------------------------------------------------
def test_facebook_validate_token_success():
    provider = FacebookProvider(base_url="https://mock.graph.facebook.com/v19.0")
    mock_resp = httpx.Response(
        status_code=200,
        json={"id": "page_123", "name": "Test Brand Page"},
        request=httpx.Request("GET", "https://mock.graph.facebook.com/v19.0/me"),
    )
    with patch("httpx.get", return_value=mock_resp):
        res = provider.validate_token("valid_token", "page_123")
        assert res.valid is True
        assert res.page_id == "page_123"
        assert res.account_name == "Test Brand Page"


def test_facebook_validate_token_invalid():
    provider = FacebookProvider(base_url="https://mock.graph.facebook.com/v19.0")
    mock_resp = httpx.Response(
        status_code=400,
        text="Session has expired",
        request=httpx.Request("GET", "https://mock.graph.facebook.com/v19.0/me"),
    )
    with patch("httpx.get", return_value=mock_resp):
        res = provider.validate_token("bad_token", "page_123")
        assert res.valid is False
        assert "Session has expired" in (res.error_message or "")


def test_facebook_publish_success():
    provider = FacebookProvider(base_url="https://mock.graph.facebook.com/v19.0")
    mock_resp = httpx.Response(
        status_code=200,
        json={"id": "page_123_post_999"},
        request=httpx.Request("POST", "https://mock.graph.facebook.com/v19.0/page_123/feed"),
    )
    with patch("httpx.post", return_value=mock_resp):
        res = provider.publish(
            page_id="page_123",
            message="Hello world!",
            token="token_xyz",
            job_id="job_abc_123",
            media_url="https://example.com/image.jpg",
        )
        assert res.platform_post_id == "page_123_post_999"
        assert res.provider == "facebook"


def test_facebook_publish_rate_limit_exceeded():
    provider = FacebookProvider(base_url="https://mock.graph.facebook.com/v19.0")
    mock_resp = httpx.Response(
        status_code=429,
        text="User request limit reached",
        request=httpx.Request("POST", "https://mock.graph.facebook.com/v19.0/page_123/feed"),
    )
    with patch("httpx.post", return_value=mock_resp):
        with pytest.raises(RateLimitExceeded):
            provider.publish(
                page_id="page_123",
                message="Hello world!",
                token="token_xyz",
                job_id="job_abc_123",
            )


# ---------------------------------------------------------------------------
# LinkedInProvider Tests
# ---------------------------------------------------------------------------
def test_linkedin_validate_token_success():
    provider = LinkedInProvider(base_url="https://mock.linkedin.com/v2")
    mock_resp = httpx.Response(
        status_code=200,
        json={"sub": "user_li_1", "name": "LinkedIn User"},
        request=httpx.Request("GET", "https://mock.linkedin.com/v2/userinfo"),
    )
    with patch("httpx.get", return_value=mock_resp):
        res = provider.validate_token("valid_token", "org_123")
        assert res.valid is True
        assert res.account_name == "LinkedIn User"


def test_linkedin_publish_article_success():
    provider = LinkedInProvider(base_url="https://mock.linkedin.com/v2")
    mock_resp = httpx.Response(
        status_code=201,
        json={"id": "urn:li:share:987654321"},
        request=httpx.Request("POST", "https://mock.linkedin.com/v2/ugcPosts"),
    )
    with patch("httpx.post", return_value=mock_resp):
        res = provider.publish(
            page_id="org_123",
            message="Read our new blog",
            token="li_token",
            job_id="job_li_1",
            media_url="https://blog.example.com/post-1",
        )
        assert res.platform_post_id == "urn:li:share:987654321"
        assert res.provider == "linkedin"


# ---------------------------------------------------------------------------
# InstagramProvider Tests
# ---------------------------------------------------------------------------
def test_instagram_publish_requires_media():
    provider = InstagramProvider(base_url="https://mock.graph.facebook.com/v19.0")
    with pytest.raises(NonRetryableError, match="requires a media_url"):
        provider.publish(
            page_id="ig_page_1",
            message="No image provided",
            token="ig_token",
            job_id="job_ig_1",
            media_url=None,
        )


def test_instagram_publish_success():
    provider = InstagramProvider(base_url="https://mock.graph.facebook.com/v19.0")
    container_resp = httpx.Response(
        status_code=200,
        json={"id": "container_12345"},
        request=httpx.Request("POST", "https://mock.graph.facebook.com/v19.0/ig_page_1/media"),
    )
    publish_resp = httpx.Response(
        status_code=200,
        json={"id": "media_published_67890"},
        request=httpx.Request("POST", "https://mock.graph.facebook.com/v19.0/ig_page_1/media_publish"),
    )
    with patch("httpx.post", side_effect=[container_resp, publish_resp]):
        res = provider.publish(
            page_id="ig_page_1",
            message="Sunset photo",
            token="ig_token",
            job_id="job_ig_1",
            media_url="https://example.com/sunset.jpg",
        )
        assert res.platform_post_id == "media_published_67890"
        assert res.provider == "instagram"


# ---------------------------------------------------------------------------
# ThreadsProvider Tests
# ---------------------------------------------------------------------------
def test_threads_publish_success():
    provider = ThreadsProvider(base_url="https://mock.graph.threads.net/v1.0")
    container_resp = httpx.Response(
        status_code=200,
        json={"id": "th_container_111"},
        request=httpx.Request("POST", "https://mock.graph.threads.net/v1.0/th_user_1/threads"),
    )
    publish_resp = httpx.Response(
        status_code=200,
        json={"id": "th_post_222"},
        request=httpx.Request("POST", "https://mock.graph.threads.net/v1.0/th_user_1/threads_publish"),
    )
    with patch("httpx.post", side_effect=[container_resp, publish_resp]):
        res = provider.publish(
            page_id="th_user_1",
            message="First thread!",
            token="th_token",
            job_id="job_th_1",
        )
        assert res.platform_post_id == "th_post_222"
        assert res.provider == "threads"
