import uuid
from fastapi import Depends, HTTPException, Header, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from dataclasses import dataclass

from app.core.database import get_db
from app.core.config import settings

# Custom exceptions
class MT5ConnectionError(Exception): pass
class BacktestError(Exception): pass
class StrategyValidationError(Exception): pass

# API key check (legacy, kept for compatibility)
async def verify_api_key(x_api_key: str = Header(default=None)):
    if x_api_key and x_api_key != settings.API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")

@dataclass
class CommonQueryParams:
    page: int = 1
    page_size: int = 20

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token", auto_error=False)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    from app.services.auth_service import auth_service
    return await auth_service.get_current_user(db, token)

async def get_current_active_user(current_user=Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")
    return current_user

def require_role(*roles: str):
    async def _check(current_user=Depends(get_current_active_user)):
        if current_user.role.value not in roles and not current_user.is_superuser:
            raise HTTPException(status_code=403, detail=f"Requires role: {', '.join(roles)}")
        return current_user
    return _check

async def get_optional_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    if not token:
        return None
    try:
        from app.services.auth_service import auth_service
        return await auth_service.get_current_user(db, token)
    except HTTPException:
        return None
