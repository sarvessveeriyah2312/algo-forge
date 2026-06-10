from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.core.database import get_db
from app.schemas.auth import LoginRequest, TokenResponse, RefreshRequest, PasswordChangeRequest
from app.schemas.user import UserCreate, UserResponse, UserUpdate, UserList
from app.services.auth_service import auth_service
from app.core.deps import get_current_user, get_current_active_user, require_role

router = APIRouter(prefix="/auth", tags=["Authentication"])
users_router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    return await auth_service.register(db, data)

@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    return await auth_service.login(db, data, request)

# OAuth2 compatible form login
@router.post("/token", response_model=TokenResponse)
async def token(form: OAuth2PasswordRequestForm = Depends(), request: Request = None, db: AsyncSession = Depends(get_db)):
    login_data = LoginRequest(email=form.username, password=form.password)
    return await auth_service.login(db, login_data, request)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    return await auth_service.refresh(db, data)

@router.post("/logout", status_code=204)
async def logout(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.logout(db, data.refresh_token)

@router.post("/logout-all", status_code=204)
async def logout_all(current_user=Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    await auth_service.logout_all(db, current_user.id)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_me(data: UserUpdate, current_user=Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    # Regular users can only update their own name/email/password
    safe_data = UserUpdate(
        full_name=data.full_name,
        email=data.email,
        password=data.password,
    )
    return await auth_service.update_user(db, current_user, safe_data)

@router.post("/me/change-password", status_code=204)
async def change_password(data: PasswordChangeRequest, current_user=Depends(get_current_active_user), db: AsyncSession = Depends(get_db)):
    await auth_service.change_password(db, current_user, data.current_password, data.new_password)

# Admin user management
@users_router.get("/", response_model=UserList)
async def list_users(page: int = 1, page_size: int = 20, current_user=Depends(require_role("ADMIN")), db: AsyncSession = Depends(get_db)):
    users, total = await auth_service.list_users(db, page, page_size)
    return UserList(items=users, total=total, page=page, page_size=page_size)

@users_router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: uuid.UUID, current_user=Depends(require_role("ADMIN")), db: AsyncSession = Depends(get_db)):
    return await auth_service.get_user(db, user_id)

@users_router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: uuid.UUID, data: UserUpdate, current_user=Depends(require_role("ADMIN")), db: AsyncSession = Depends(get_db)):
    user = await auth_service.get_user(db, user_id)
    return await auth_service.update_user(db, user, data)

@users_router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: uuid.UUID, current_user=Depends(require_role("ADMIN")), db: AsyncSession = Depends(get_db)):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = await auth_service.get_user(db, user_id)
    # Soft delete by deactivating
    await auth_service.update_user(db, user, UserUpdate(is_active=False))
