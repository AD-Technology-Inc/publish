from fastapi import APIRouter
from pydantic import BaseModel
from http_client import _forward

social_accounts_router = APIRouter(prefix="/accounts", tags=["social-accounts"])

class ConnectAccountRequest(BaseModel):
    provider: str
    name: str
    page_id: str
    access_token: str


@social_accounts_router.get("")
async def list_accounts():
    return await _forward("GET", "http://social-account-service:3001/accounts")


@social_accounts_router.post("", status_code=201)
async def connect_account(req: ConnectAccountRequest):
    return await _forward("POST", "http://social-account-service:3001/accounts", json=req.model_dump())


@social_accounts_router.delete("/{account_id}", status_code=204)
async def disconnect_account(account_id: str):
    await _forward("DELETE", f"http://social-account-service:3001/accounts/{account_id}")
    return None