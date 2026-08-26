from typing import Annotated

import structlog
from fastapi import Depends, FastAPI, HTTPException, status
from redis import Redis
from sqlalchemy.ext.asyncio import AsyncSession
from shared.queue import RedisQueue
from shared.telemetry import init_telemetry, setup_logging

from app.config import settings
from app.database import get_db
from app.schemas import AccountOut, ConnectAccountRequest
from app import service

SERVICE_NAME = "social-account-service"
setup_logging(SERVICE_NAME)

app = FastAPI(title="Social Account Service")
init_telemetry(SERVICE_NAME, app=app)
logger = structlog.get_logger(__name__)

redis_client = Redis(
    host=settings.redis_host, port=settings.redis_port, db=0
)
queue = RedisQueue(redis_client, stream_name="jobs:social-account")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/accounts", response_model=list[AccountOut])
async def list_accounts(db: Annotated[AsyncSession, Depends(get_db)]):
    """Retrieve all connected social accounts from PostgreSQL."""
    return await service.get_all_accounts(db)


@app.post("/accounts", response_model=AccountOut, status_code=status.HTTP_201_CREATED)
async def connect_account(
    req: ConnectAccountRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Connect a new social account, save to PostgreSQL, and enqueue validation."""
    return await service.create_account(
        db=db, req=req, queue=queue, redis_client=redis_client
    )


@app.delete("/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def disconnect_account(
    account_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Disconnect an account and purge records from PostgreSQL and Redis."""
    await service.delete_account(
        db=db, account_id=account_id, redis_client=redis_client
    )
    return None


@app.get("/accounts/token/{provider}/{page_id}")
async def get_token(
    provider: str,
    page_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Internal endpoint to retrieve the stored access token from PostgreSQL/Redis."""
    # Try Redis fast-path first
    cached_token = redis_client.get(f"token:{provider.lower()}:{page_id}")
    if cached_token:
        return {"access_token": cached_token.decode("utf-8")}

    # Fallback to PostgreSQL
    account = await service.get_account_by_provider_page(
        db=db, provider=provider.lower(), page_id=page_id
    )
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Token not found"
        )

    # Re-cache in Redis
    redis_client.set(
        f"token:{provider.lower()}:{page_id}", account.access_token
    )
    return {"access_token": account.access_token}


@app.get("/health")
def health():
    return {"status": "ok"}
