from fastapi import APIRouter, Request
from pydantic import BaseModel

from enums import ServiceName
from http_client import forward

social_accounts_router = APIRouter(prefix="/accounts", tags=["social-accounts"])


class ConnectAccountRequest(BaseModel):
    provider: str
    name: str
    page_id: str
    access_token: str


@social_accounts_router.get("")
async def list_accounts():
    return await forward(
        service_name=ServiceName.SOCIAL_ACCOUNT,
        method="GET",
        url="http://social-account-service:8000/accounts",
    )


@social_accounts_router.post("", status_code=201)
async def connect_account(request: Request):
    return await forward(
        service_name=ServiceName.SOCIAL_ACCOUNT,
        method="POST",
        url="http://social-account-service:8000/accounts",
        request=request,
    )


@social_accounts_router.delete("/{account_id}", status_code=204)
async def disconnect_account(account_id: str):
    return await forward(
        service_name=ServiceName.SOCIAL_ACCOUNT,
        method="DELETE",
        url=f"http://social-account-service:8000/accounts/{account_id}",
    )
