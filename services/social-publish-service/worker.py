import os
from abc import ABC, abstractmethod
from typing import Dict, Optional

import httpx
import structlog
from redis import Redis
from shared.telemetry import get_tracer, init_telemetry, setup_logging
from shared.utils import (
    IdempotencyMiddleware,
    NonRetryableError,
    RateLimitExceeded,
    StateManager,
)
from shared.worker import Worker

SERVICE_NAME = "social-publish-worker"
setup_logging(SERVICE_NAME)
init_telemetry(SERVICE_NAME)
logger = structlog.get_logger(__name__)
tracer = get_tracer()

redis_client = Redis(host="redis", port=6379, db=0)
idempotency = IdempotencyMiddleware(redis_client)
state_manager = StateManager(redis_client)


# ---------------------------------------------------------------------------
# Platform Adapters (Strategy Pattern)
# ---------------------------------------------------------------------------
class SocialPlatformAdapter(ABC):
    @abstractmethod
    def publish(
        self,
        page_id: str,
        message: str,
        token: str,
        job_id: str,
        media_url: Optional[str] = None,
    ) -> str:
        pass


class FacebookAdapter(SocialPlatformAdapter):
    def publish(
        self,
        page_id: str,
        message: str,
        token: str,
        job_id: str,
        media_url: Optional[str] = None,
    ) -> str:
        base_url = os.getenv(
            "GRAPH_API_BASE_URL", "https://graph.facebook.com/v19.0"
        )
        url = f"{base_url}/{page_id}/feed"

        data = {"message": message, "access_token": token}
        if media_url:
            data["link"] = media_url

        try:
            resp = httpx.post(url, data=data, timeout=10.0)
            if resp.status_code == 429:
                raise RateLimitExceeded(f"Facebook API 429 rate limit: {resp.text}")
            resp.raise_for_status()
            return resp.json().get("id", f"{page_id}_{job_id[:8]}")
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (400, 401, 403, 404):
                redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
                raise NonRetryableError(f"Facebook API error ({e.response.status_code}): {e.response.text}")
            raise Exception(f"Facebook transient error ({e.response.status_code}): {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Network error posting to Facebook: {e}")


class LinkedInAdapter(SocialPlatformAdapter):
    def publish(
        self,
        page_id: str,
        message: str,
        token: str,
        job_id: str,
        media_url: Optional[str] = None,
    ) -> str:
        base_url = os.getenv("LINKEDIN_API_BASE_URL", "https://api.linkedin.com/v2")
        url = f"{base_url}/ugcPosts"
        headers = {
            "Authorization": f"Bearer {token}",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
        }
        payload = {
            "author": f"urn:li:organization:{page_id}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": message},
                    "shareMediaCategory": "NONE",
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            },
        }

        if media_url:
            payload["specificContent"]["com.linkedin.ugc.ShareContent"][
                "shareMediaCategory"
            ] = "ARTICLE"
            payload["specificContent"]["com.linkedin.ugc.ShareContent"][
                "media"
            ] = [{"status": "READY", "originalUrl": media_url}]

        try:
            resp = httpx.post(url, headers=headers, json=payload, timeout=10.0)
            if resp.status_code == 429:
                raise RateLimitExceeded(f"LinkedIn API 429 rate limit: {resp.text}")
            resp.raise_for_status()
            return resp.json().get("id", f"urn:li:share:{page_id[:8]}")
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (400, 401, 403, 404):
                redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
                raise NonRetryableError(f"LinkedIn API error ({e.response.status_code}): {e.response.text}")
            raise Exception(f"LinkedIn transient error ({e.response.status_code}): {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Network error posting to LinkedIn: {e}")


class InstagramAdapter(SocialPlatformAdapter):
    def publish(
        self,
        page_id: str,
        message: str,
        token: str,
        job_id: str,
        media_url: Optional[str] = None,
    ) -> str:
        if not media_url:
            redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
            raise NonRetryableError("Instagram requires a media_url to publish.")

        base_url = os.getenv(
            "GRAPH_API_BASE_URL", "https://graph.facebook.com/v19.0"
        )

        try:
            # Step 1: Create Container
            container_resp = httpx.post(
                f"{base_url}/{page_id}/media",
                data={
                    "image_url": media_url,
                    "caption": message,
                    "access_token": token,
                },
                timeout=10.0,
            )
            if container_resp.status_code == 429:
                raise RateLimitExceeded(f"Instagram API 429: {container_resp.text}")
            container_resp.raise_for_status()
            creation_id = container_resp.json().get("id")

            # Step 2: Publish Container
            publish_resp = httpx.post(
                f"{base_url}/{page_id}/media_publish",
                data={"creation_id": creation_id, "access_token": token},
                timeout=10.0,
            )
            if publish_resp.status_code == 429:
                raise RateLimitExceeded(f"Instagram API 429: {publish_resp.text}")
            publish_resp.raise_for_status()
            return publish_resp.json().get("id", f"ig_{page_id[:8]}")
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (400, 401, 403, 404):
                redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
                raise NonRetryableError(f"Instagram API error ({e.response.status_code}): {e.response.text}")
            raise Exception(f"Instagram transient error ({e.response.status_code}): {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Network error posting to Instagram: {e}")


class ThreadsAdapter(SocialPlatformAdapter):
    def publish(
        self,
        page_id: str,
        message: str,
        token: str,
        job_id: str,
        media_url: Optional[str] = None,
    ) -> str:
        base_url = os.getenv(
            "THREADS_API_BASE_URL", "https://graph.threads.net/v1.0"
        )

        try:
            data = {
                "media_type": "TEXT",
                "text": message,
                "access_token": token,
            }
            if media_url:
                data["media_type"] = "IMAGE"
                data["image_url"] = media_url

            container_resp = httpx.post(
                f"{base_url}/{page_id}/threads", data=data, timeout=10.0
            )
            if container_resp.status_code == 429:
                raise RateLimitExceeded(f"Threads API 429: {container_resp.text}")
            container_resp.raise_for_status()
            creation_id = container_resp.json().get("id")

            # Publish Container
            publish_resp = httpx.post(
                f"{base_url}/{page_id}/threads_publish",
                data={"creation_id": creation_id, "access_token": token},
                timeout=10.0,
            )
            if publish_resp.status_code == 429:
                raise RateLimitExceeded(f"Threads API 429: {publish_resp.text}")
            publish_resp.raise_for_status()
            return publish_resp.json().get("id", f"threads_{page_id[:8]}")
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (400, 401, 403, 404):
                redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
                raise NonRetryableError(f"Threads API error ({e.response.status_code}): {e.response.text}")
            raise Exception(f"Threads transient error ({e.response.status_code}): {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Network error posting to Threads: {e}")


ADAPTERS: Dict[str, SocialPlatformAdapter] = {
    "facebook": FacebookAdapter(),
    "linkedin": LinkedInAdapter(),
    "instagram": InstagramAdapter(),
    "threads": ThreadsAdapter(),
}


def handle_publish_post(payload: dict) -> None:
    job_id = payload.get("job_id")
    idem_key = payload.get("idempotency_key") or job_id
    page_id = payload.get("page_id")
    provider = (payload.get("provider") or "facebook").lower()
    message = payload.get("message")
    media_url = payload.get("media_url")

    last_step = state_manager.get_last_step(job_id)

    # Enforce atomic idempotency guard on initial run
    if not last_step:
        if not idempotency.check_and_set(idem_key):
            logger.info("Duplicate publish execution detected by idempotency guard; skipping", idempotency_key=idem_key, job_id=job_id)
            return
        state_manager.save_step(job_id, "started")
        last_step = "started"
        redis_client.set(f"job_state:{job_id}", "processing", ex=86400)

    # Step 1: Validate payload & retrieve access token
    if last_step == "started":
        if not page_id or not message:
            redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
            raise NonRetryableError("Invalid payload: page_id and message are required")

        token: Optional[str] = None
        # Retrieve token from social-account-service
        try:
            token_resp = httpx.get(
                f"http://social-account-service:8000/accounts/token/{provider}/{page_id}",
                timeout=5.0,
            )
            if token_resp.status_code == 200:
                token = token_resp.json().get("access_token")
        except Exception as e:
            logger.warning("Could not query social-account-service for token", error=str(e))

        # Fallback to environment variable if configured
        if not token:
            env_var_name = f"{provider.upper()}_PAGE_ACCESS_TOKEN"
            token = os.getenv(env_var_name) or os.getenv("SOCIAL_ACCESS_TOKEN")

        if not token:
            redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
            raise NonRetryableError(f"No valid access token available for {provider} page {page_id}")

        # Durable checkpoint
        redis_client.set(f"job_token:{job_id}", token, ex=3600)
        state_manager.save_step(job_id, "token_retrieved")
        last_step = "token_retrieved"

    # Step 2: Publish via platform adapter
    if last_step == "token_retrieved":
        token_raw = redis_client.get(f"job_token:{job_id}")
        token = token_raw.decode("utf-8") if token_raw else ""

        adapter = ADAPTERS.get(provider)
        if not adapter:
            redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
            raise NonRetryableError(f"Unsupported provider: {provider}")

        post_id = adapter.publish(
            page_id=page_id,
            message=message,
            token=token,
            job_id=job_id,
            media_url=media_url,
        )

        # Checkpoint completion & state
        state_manager.save_step(job_id, "completed")
        redis_client.set(f"job_state:{job_id}", "completed", ex=86400)
        redis_client.set(f"job_result:{job_id}", str(post_id), ex=86400)
        logger.info("Published successfully to platform", provider=provider, post_id=post_id, job_id=job_id)


if __name__ == "__main__":
    worker = Worker(
        redis_client=redis_client,
        stream_name="jobs:social-publish",
        consumer_name="social-publish-worker-1",
    )
    worker.register_handler("publish_post", handle_publish_post)
    worker.run()
