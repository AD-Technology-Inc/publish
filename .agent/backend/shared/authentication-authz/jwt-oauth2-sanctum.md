# Skill: .agent/backend/shared/authentication-authz/jwt-oauth2-sanctum.md

## 📌 Core Philosophy & Constraints
- **Stateless Bearer Tokens**: Enforce short-lived JWT access tokens (15-60 min) with refresh token rotation.
- **Sanctum & OAuth2 Standard**: Align Laravel Sanctum and FastAPI OAuth2 Bearer specs across microservices.
- **Strict Claims Verification**: Assert `iss` (issuer), `aud` (audience), and `exp` (expiration) on token validation.

## ⚡ Production Boilerplate / Standard Pattern

```python
# FastAPI / Python Token Minting Pattern
from datetime import datetime, timedelta, timezone
import jwt

SECRET_KEY = "your-strong-production-key"
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=30)) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire, "iss": "saas-auth-service"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

```php
// Laravel Sanctum Token Generation
$token = $user->createToken(
    name: 'mobile-app',
    abilities: ['orders:read', 'orders:write'],
    expiresAt: now()->addMinutes(30)
)->plainTextToken;
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Infinite Expiration Tokens**: Issuing JWT tokens without an `exp` expiration claim.
- ❌ **Sensitive Data in JWT Payload**: Storing passwords, SSNs, or credit card info inside unencrypted JWT claims.
- ❌ **Shared Insecure Signing Key**: Using generic strings like `'secret'` or `'123456'`.

## 🔍 Verification & Testing
- **Token Verification Test**: Mint token, decode signature, verify `exp` failure on expired token timestamp.
