# FastAPI Authentication & JWT Security

## 📌 Core Philosophy & Constraints
- **OAuth2 Bearer Scheme**: Use `OAuth2PasswordBearer` to extract HTTP Bearer tokens from authorization headers.
- **JWT Minting & Decoding**: Mint short-lived access tokens (15-60 min) and verify signatures with explicit `exp`, `iss`, and `sub` claim assertions.
- **Dependency Injection**: Inject `get_current_user` dependency directly into API endpoints.

## ⚡ Production Boilerplate / Standard Pattern

```python
from datetime import datetime, timedelta, timezone
from typing import Annotated
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")
SECRET_KEY = "your-strong-production-key"
ALGORITHM = "HS256"

class TokenPayload(BaseModel):
    sub: str
    tenant_id: str
    roles: list[str] = []
    exp: datetime

def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=30)) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire, "iss": "saas-auth-service"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> TokenPayload:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"require": ["exp", "iss", "sub"]})
        user_id: str = payload.get("sub")
        tenant_id: str = payload.get("tenant_id")
        if not user_id or not tenant_id:
            raise credentials_exception
        return TokenPayload(sub=user_id, tenant_id=tenant_id, roles=payload.get("roles", []), exp=datetime.fromtimestamp(payload["exp"], tz=timezone.utc))
    except jwt.PyJWTError:
        raise credentials_exception
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Ignoring JWT Expiration (`exp`)**: Decoding JWT tokens without asserting expiration timestamp validity.
- ❌ **Insecure Hardcoded Secrets**: Hardcoding `SECRET_KEY = "secret"` in source code instead of loading from environment variables.
- ❌ **Custom Header Parsing**: Reading raw `request.headers` manually instead of `OAuth2PasswordBearer`.
