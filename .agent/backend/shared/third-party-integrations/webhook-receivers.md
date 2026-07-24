# Skill: .agent/backend/shared/third-party-integrations/webhook-receivers.md

## 📌 Core Philosophy & Constraints
- **HMAC Signature Verification**: Always verify incoming webhook cryptographic signatures (`X-Signature`) using HMAC-SHA256.
- **Idempotent Payload Processing**: Store processed webhook message IDs in Redis/DB to prevent duplicate event execution.
- **Immediate ACK**: Return HTTP 200 OK immediately and process payload asynchronously via queue jobs.

## ⚡ Production Boilerplate / Standard Pattern

```python
import hmac
import hashlib
from fastapi import APIRouter, Header, HTTPException, Request, status

router = APIRouter()
WEBHOOK_SECRET = b"whsec_production_secret_key"

def verify_hmac_signature(payload: bytes, signature_header: str):
    expected_signature = hmac.new(WEBHOOK_SECRET, payload, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected_signature, signature_header):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid webhook HMAC signature"
        )

@router.post("/webhooks/stripe")
async def receive_stripe_webhook(
    request: Request,
    x_stripe_signature: str = Header(...)
):
    raw_body = await request.body()
    verify_hmac_signature(raw_body, x_stripe_signature)

    payload = await request.json()
    event_id = payload.get("id")

    # Queue payload for idempotent background processing
    return {"received": True, "event_id": event_id}
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Unverified Webhooks**: Executing actions on webhook requests without signature verification.
- ❌ **Synchronous Webhook Execution**: Running heavy DB mutations directly inside the webhook HTTP response lifecycle.
- ❌ **Insecure Signature Comparison**: Using `==` string equality instead of `hmac.compare_digest()` exposing timing attacks.

## 🔍 Verification & Testing
- **HMAC Test Suite**: Generate valid HMAC signature in Pytest test and assert endpoint returns HTTP 200 OK.
