# Skill: .agent/backend/fastapi/router-development/authentication.md

## 📌 Core Philosophy & Constraints
- **OAuth2 Bearer Scheme**: Use `OAuth2PasswordBearer` to extract HTTP Bearer tokens from authorization headers.
- **JWT Signature Decoding**: Verify JWT signatures using public keys or strong secret keys with expiration assertions.
- **`current_user` Dependency**: Inject validated user object into endpoints via `get_current_user` dependency.

## ⚡ Production Boilerplate / Standard Pattern

```python
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")
SECRET_KEY = "your-production-secret-key"
ALGORITHM = "HS256"

class TokenPayload(BaseModel):
    sub: str
    tenant_id: str
    roles: list[str] = []

async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenPayload:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        tenant_id: str = payload.get("tenant_id")
        if user_id is None or tenant_id is None:
            raise credentials_exception
        return TokenPayload(sub=user_id, tenant_id=tenant_id, roles=payload.get("roles", []))
    except jwt.PyJWTError:
        raise credentials_exception
```

## 🚫 Forbidden Anti-Patterns
- ❌ **Ignoring JWT Expiration (`exp`)**: Decoding JWT tokens without asserting expiration timestamp validity.
- ❌ **Hardcoded Insecure Secrets**: Committing `SECRET_KEY = "secret"` into repository source code.
- ❌ **Custom Unstandardized Header Parsing**: Reading raw `request.headers.get("Authorization")` string manually in route handlers.

## 🔍 Verification & Testing
- **Pytest Token Injection**: Pass `headers={"Authorization": f"Bearer {valid_token}"}` in `AsyncClient` test suite asserting 200 OK.
