import os
import httpx
import structlog
from redis import Redis
from abc import ABC, abstractmethod
from shared.worker import Worker
from shared.utils import IdempotencyMiddleware, NonRetryableError, StateManager
from shared.telemetry import setup_logging, init_telemetry, get_tracer

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
    def publish(self, page_id: str, message: str, token: str, job_id: str, media_url: str = None) -> str:
        pass


class FacebookAdapter(SocialPlatformAdapter):
    def publish(self, page_id: str, message: str, token: str, job_id: str, media_url: str = None) -> str:
        base_url = os.getenv("GRAPH_API_BASE_URL", "https://graph.facebook.com/v19.0")
        url = f"{base_url}/{page_id}/feed"

        if token == "mocked_token":
            import time
            logger.info("[MOCK] Simulating Facebook publish (no real token)")
            time.sleep(1)
            return f"{page_id}_{job_id[:8]}_mock"

        data = {"message": message, "access_token": token}
        if media_url:
            data["link"] = media_url

        try:
            resp = httpx.post(url, data=data, timeout=10.0)
            resp.raise_for_status()
            return resp.json().get("id", "unknown")
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (400, 401, 403, 404):
                redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
                raise NonRetryableError(f"Facebook API error: {e.response.text}")
            raise Exception(f"Facebook transient error: {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Network error posting to Facebook: {e}")


class LinkedInAdapter(SocialPlatformAdapter):
    def publish(self, page_id: str, message: str, token: str, job_id: str, media_url: str = None) -> str:
        url = "https://api.linkedin.com/v2/ugcPosts"
        headers = {
            "Authorization": f"Bearer {token}",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json"
        }
        payload = {
            "author": f"urn:li:organization:{page_id}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": message},
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"}
        }
        
        if media_url:
            payload["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "ARTICLE"
            payload["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [
                {"status": "READY", "originalUrl": media_url}
            ]

        if token == "mocked_token":
            import time
            time.sleep(1)
            return f"urn:li:share:{page_id[:8]}_mock"

        try:
            resp = httpx.post(url, headers=headers, json=payload, timeout=10.0)
            resp.raise_for_status()
            return resp.json().get("id", "unknown")
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (400, 401, 403, 404):
                redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
                raise NonRetryableError(f"LinkedIn API error: {e.response.text}")
            raise Exception(f"LinkedIn transient error: {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Network error posting to LinkedIn: {e}")


class InstagramAdapter(SocialPlatformAdapter):
    def publish(self, page_id: str, message: str, token: str, job_id: str, media_url: str = None) -> str:
        if not media_url:
            redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
            raise NonRetryableError("Instagram requires a media_url to publish.")

        base_url = os.getenv("GRAPH_API_BASE_URL", "https://graph.facebook.com/v19.0")
        
        if token == "mocked_token":
            import time
            time.sleep(1)
            return f"ig_{page_id[:8]}_mock"

        try:
            # Step 1: Create Container
            container_resp = httpx.post(
                f"{base_url}/{page_id}/media",
                data={"image_url": media_url, "caption": message, "access_token": token},
                timeout=10.0
            )
            container_resp.raise_for_status()
            creation_id = container_resp.json().get("id")

            # Step 2: Publish Container
            publish_resp = httpx.post(
                f"{base_url}/{page_id}/media_publish",
                data={"creation_id": creation_id, "access_token": token},
                timeout=10.0
            )
            publish_resp.raise_for_status()
            return publish_resp.json().get("id", "unknown")
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (400, 401, 403, 404):
                redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
                raise NonRetryableError(f"Instagram API error: {e.response.text}")
            raise Exception(f"Instagram transient error: {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Network error posting to Instagram: {e}")


class ThreadsAdapter(SocialPlatformAdapter):
    def publish(self, page_id: str, message: str, token: str, job_id: str, media_url: str = None) -> str:
        base_url = os.getenv("THREADS_API_BASE_URL", "https://graph.threads.net/v1.0")
        
        if token == "mocked_token":
            import time
            time.sleep(1)
            return f"threads_{page_id[:8]}_mock"

        try:
            # Step 1: Create Container
            data = {"media_type": "TEXT", "text": message, "access_token": token}
            if media_url:
                data["media_type"] = "IMAGE"
                data["image_url"] = media_url

            container_resp = httpx.post(f"{base_url}/{page_id}/threads", data=data, timeout=10.0)
            container_resp.raise_for_status()
            creation_id = container_resp.json().get("id")

            # Step 2: Publish Container
            publish_resp = httpx.post(
                f"{base_url}/{page_id}/threads_publish",
                data={"creation_id": creation_id, "access_token": token},
                timeout=10.0
            )
            publish_resp.raise_for_status()
            return publish_resp.json().get("id", "unknown")
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (400, 401, 403, 404):
                redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
                raise NonRetryableError(f"Threads API error: {e.response.text}")
            raise Exception(f"Threads transient error: {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Network error posting to Threads: {e}")


ADAPTERS = {
    "facebook": FacebookAdapter(),
    "linkedin": LinkedInAdapter(),
    "instagram": InstagramAdapter(),
    "threads": ThreadsAdapter(),
}


def handle_publish_post(payload: dict):
    job_id = payload.get("job_id")
    idem_key = payload.get("idempotency_key")
    page_id = payload.get("page_id")
    provider = payload.get("provider", "facebook")
    message = payload.get("message")
    media_url = payload.get("media_url")

    last_step = state_manager.get_last_step(job_id)

    if not last_step:
        if not idempotency.check_and_set(idem_key):
            logger.info(f"Skipping duplicate publish: {idem_key}")
            return
        state_manager.save_step(job_id, "started")
        last_step = "started"
        redis_client.set(f"job_state:{job_id}", "processing", ex=86400)

    try:
        # Step 1: Validate
        if last_step == "started":
            if not page_id or not message:
                redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
                raise NonRetryableError("Invalid payload: page_id and message are required")
            
            # Step 2: Retrieve access token from social-account-service
            try:
                token_resp = httpx.get(
                    f"http://social-account-service:3001/accounts/token/{provider}/{page_id}",
                    timeout=5.0,
                )
                if token_resp.status_code == 404:
                    # Fall back to ENV for legacy / dev use
                    token = os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN", "mocked_token")
                else:
                    token_resp.raise_for_status()
                    token = token_resp.json().get("access_token", "mocked_token")
            except httpx.RequestError:
                # social-account-service unavailable — fall back to ENV
                token = os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN", "mocked_token")

            if not token:
                redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
                raise NonRetryableError("No access token available for this page")
                
            state_manager.save_step(job_id, "token_retrieved")
            # Cache the token in Redis to pass it to the next step since we don't save the payload
            redis_client.set(f"job_token:{job_id}", token, ex=3600)
            last_step = "token_retrieved"

        if last_step == "token_retrieved":
            token = redis_client.get(f"job_token:{job_id}").decode("utf-8")
            
            # Step 3: Call the platform API via the Adapter
            adapter = ADAPTERS.get(provider)
            if not adapter:
                redis_client.set(f"job_state:{job_id}", "failed", ex=86400)
                raise NonRetryableError(f"Unsupported provider: {provider}")

            post_id = adapter.publish(page_id, message, token, job_id, media_url=media_url)

            # Step 4: Store result
            state_manager.save_step(job_id, "completed")
            redis_client.set(f"job_state:{job_id}", "completed", ex=86400)
            redis_client.set(f"job_result:{job_id}", post_id, ex=86400)
            logger.info(f"Published successfully. Platform post ID: {post_id}")
    except Exception as e:
        raise e


if __name__ == "__main__":
    worker = Worker(
        redis_client=redis_client,
        stream_name="jobs:social-publish",
        consumer_name="social-publish-worker-1",
    )
    worker.register_handler("publish_post", handle_publish_post)
    worker.run()
