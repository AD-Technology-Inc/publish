# Async Job System and Facebook Integration

This walkthrough summarizes the full-stack integration connecting the React frontend to the asynchronous FastAPI backend to enable Facebook Page publishing.

## Architecture Highlights

> [!IMPORTANT]
> The system now features a complete, tightly coupled integration from the frontend React UI down to the backend Redis Streams queue and out to the Facebook Graph API.

### 1. Frontend Integration (`apps/client`)
- **API Client**: Implemented a typed Axios client pointing to the Gateway (`http://gateway.localhost`).
- **React Hooks**:
  - `usePublishPost`: Wraps the `POST /social/posts` endpoint and manages the entire lifecycle (job ID assignment, polling, and error catching).
  - `useJobPolling`: Intelligently polls the Gateway's `GET /jobs/{job_id}` endpoint every second until the job reports `completed` or `failed`.
- **UI UX**: Refactored the Post Compose UI (`Create.tsx`).
  - The "Publish Content" button now triggers an actual async job and transitions into a `Publishing...` state.
  - If the job fails (e.g., due to an invalid token or Facebook rate limit), the UI exposes a DLQ alert panel.
  - The DLQ panel allows users to inspect failed jobs and trigger a "Retry" which hits the `POST /dlq/.../replay` endpoint.

### 2. Backend Gateway Updates
- **POST `/social/posts`**: Added an endpoint on the gateway that receives the typed frontend request and seamlessly forwards it to the internal `social-post-service` over HTTP.

### 3. Facebook Graph API Worker (`social-post-service`)
- **Worker Logic (`handle_publish_to_facebook`)**:
  - **Step 1**: Validates the payload.
  - **Step 2**: Retrieves the Facebook Access Token from the environment (`FACEBOOK_PAGE_ACCESS_TOKEN`).
  - **Step 3**: Uses `httpx` to send a robust POST request to the Graph API (`https://graph.facebook.com/v19.0/{page_id}/feed`).
  - **Step 4**: Acknowledges success by saving the Facebook Post ID back to Redis so the frontend can detect completion.
- **Resilience Routing**:
  - If the Facebook API returns a `400` (e.g., Invalid Token) or `404`, the worker throws a `NonRetryableError`. This immediately bypasses exponential backoff and routes the job to the Dead Letter Queue.
  - 5xx server errors trigger the automatic exponential backoff mechanism.

## Verification

To spin up the fully integrated ecosystem locally:
```bash
cd infrastructure
docker-compose up --build
```
You can interact with the system via `http://app.localhost` and compose a post. Watch the UI naturally transition from `Pending` -> `Success`, or intentionally provide a bad token to see the DLQ failure UI kick in.
