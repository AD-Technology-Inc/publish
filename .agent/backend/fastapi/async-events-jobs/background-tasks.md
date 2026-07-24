# Skill: .agent/backend/fastapi/async-events-jobs/background-tasks.md

## 📌 Core Philosophy & Constraints
- **Lightweight Async Jobs**: Use FastAPI `BackgroundTasks` for non-critical, in-process tasks (email confirmation, log flushing).
- **Non-Blocking Return**: Immediately return HTTP status code 202/200 to client without waiting for task execution completion.
- **Exception Isolation**: Enclose background task logic in try/except blocks to prevent unhandled background crashes.

## ⚡ Production Boilerplate / Standard Pattern

```python
from fastapi import APIRouter, BackgroundTasks, status
import structlog

logger = structlog.get_logger()
router = APIRouter()

async def send_welcome_email_task(user_email: str, user_id: str):
    try:
        # Simulate background email dispatch
        logger.info("sending_welcome_email_start", user_id=user_id, email=user_email)
        # perform async email send...
        logger.info("sending_welcome_email_success", user_id=user_id)
    except Exception as e:
        logger.error("sending_welcome_email_failed", user_id=user_id, error=str(e))

@router.post("/register", status_code=status.HTTP_202_ACCEPTED)
async def register_user(
    email: str,
    background_tasks: BackgroundTasks
):
    user_id = "usr_123"
    background_tasks.add_task(send_welcome_email_task, user_email=email, user_id=user_id)
    return {"message": "Registration received, confirmation email pending."}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Heavy Computation in BackgroundTasks**: Offloading 10-minute CPU processing jobs to `BackgroundTasks` instead of Celery.
- ❌ **Awaiting Tasks Inside Endpoint**: Calling `await send_welcome_email_task()` inside route handler function body.
- ❌ **Ignoring Error Catching in Tasks**: Failing to catch exceptions in background tasks causing unlogged silent failures.

## 🔍 Verification & Testing
- **Pytest Background Task Execution**: Test endpoint in Pytest verifying task function added to `background_tasks.tasks`.
