# Skill: .agent/backend/fastapi/async-events-jobs/celery-redis-workers.md

## 📌 Core Philosophy & Constraints
- **Celery Worker Offloading**: Use Celery backed by Redis broker for heavy, asynchronous distributed task queues.
- **Task Retry Policy**: Configure `autoretry_for`, `retry_backoff`, and `max_retries` on Celery tasks.
- **Separation of Concerns**: Keep Celery worker task logic in `app/workers/` separate from FastAPI HTTP endpoints.

## ⚡ Production Boilerplate / Standard Pattern

```python
# app/workers/celery_app.py
from celery import Celery

celery_app = Celery(
    "worker",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/1"
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# app/workers/tasks.py
@celery_app.task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    max_retries=5
)
def generate_pdf_report(self, tenant_id: str, report_id: str):
    print(f"Generating PDF report {report_id} for tenant {tenant_id}")
    return {"status": "completed", "report_id": report_id}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Passing Un-serializable Objects to Celery**: Passing SQLAlchemy ORM model instances directly to `.delay(model)` instead of ID strings.
- ❌ **Infinite Task Retries**: Omitting `max_retries` on Celery task definitions causing worker retry loops.
- ❌ **Synchronous Queue Blocking in FastAPI**: Invoking task with `.get()` synchronously in FastAPI routes waiting for completion.

## 🔍 Verification & Testing
- **Celery Eager Testing Mode**: Set `CELERY_TASK_ALWAYS_EAGER = True` in Pytest suite to execute Celery tasks synchronously during test runs.
