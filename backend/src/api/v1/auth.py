from fastapi import APIRouter
from sqlalchemy import select

from src.api.v1.deps import CurrentUser, Database
from src.core import (
    BadRequestException,
    UnauthorizedException,
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    verify_token,
)
from src.models import User
from src.schemas import LoginRequest, Token, UserCreate, UserResponse

router = APIRouter()


@router.post("/register", response_model=UserResponse)
async def register(
    data: UserCreate,
    db: Database,
) -> User:
    """Register a new user."""
    # Check if user exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise BadRequestException("Email already registered")

    # Create user
    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        name=data.name,
        company=data.company,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    return user


@router.post("/login", response_model=Token)
async def login(
    data: LoginRequest,
    db: Database,
) -> Token:
    """Login user and return tokens."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise UnauthorizedException("Invalid email or password")

    if not user.is_active:
        raise UnauthorizedException("User is inactive")

    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: Database,
) -> Token:
    """Refresh access token."""
    payload = verify_token(refresh_token, "refresh")
    if not payload:
        raise UnauthorizedException("Invalid refresh token")

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise UnauthorizedException("User not found or inactive")

    new_access_token = create_access_token({"sub": user.id})
    new_refresh_token = create_refresh_token({"sub": user.id})

    return Token(access_token=new_access_token, refresh_token=new_refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUser) -> User:
    """Get current user info."""
    return current_user


@router.post("/logout")
async def logout(current_user: CurrentUser) -> dict[str, str]:
    """Logout user."""
    # In a production app, you might want to blacklist the token
    return {"message": "Successfully logged out"}
