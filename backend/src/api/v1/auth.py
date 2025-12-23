"""Authentication endpoints using Supabase Auth.

All authentication is handled through Supabase Auth for unified user management:
- Email/Password: Uses Supabase signUp/signIn APIs
- Google OAuth: Handled by Supabase OAuth provider
- LINE OAuth: Custom implementation that creates users in Supabase via Admin API
"""

from fastapi import APIRouter
from sqlalchemy import select

from src.api.v1.deps import CurrentUser, Database
from src.config import settings
from src.core import (
    BadRequestException,
    UnauthorizedException,
    verify_token,
)
from src.models import User
from src.schemas import LoginRequest, Token, UserCreate, UserResponse
from src.services.oauth import SupabaseAuthService

router = APIRouter()

# Initialize Supabase auth service
supabase_auth = SupabaseAuthService()


@router.post("/register", response_model=UserResponse)
async def register(
    data: UserCreate,
    db: Database,
) -> User:
    """Register a new user with email and password.

    Creates user in Supabase Auth and syncs to local database.
    """
    if not settings.supabase_url:
        raise BadRequestException("Supabase is not configured")

    # Check if user already exists in local DB
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise BadRequestException("Email already registered")

    try:
        # Create user in Supabase Auth
        supabase_response = await supabase_auth.sign_up_with_email(
            email=data.email,
            password=data.password,
            user_metadata={
                "name": data.name,
                "company": data.company,
            },
        )

        supabase_user = supabase_response.get("user", {})
        supabase_user_id = supabase_user.get("id")

        if not supabase_user_id:
            raise BadRequestException("Failed to create user in authentication service")

        # Create user in local database (synced with Supabase)
        user = User(
            id=supabase_user_id,  # Use Supabase user ID as primary key
            email=data.email,
            name=data.name,
            company=data.company,
            supabase_user_id=supabase_user_id,
            auth_provider="email",
            is_verified=False,  # Email confirmation required
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)

        return user

    except ValueError as e:
        raise BadRequestException(str(e))


@router.post("/login", response_model=Token)
async def login(
    data: LoginRequest,
    db: Database,
) -> Token:
    """Login user with email and password.

    Authenticates via Supabase and returns Supabase tokens.
    """
    if not settings.supabase_url:
        raise BadRequestException("Supabase is not configured")

    # Authenticate with Supabase
    session = await supabase_auth.sign_in_with_email(
        email=data.email,
        password=data.password,
    )

    if not session:
        raise UnauthorizedException("Invalid email or password")

    supabase_user = session.get("user", {})
    supabase_user_id = supabase_user.get("id")

    # Ensure user exists in local database
    result = await db.execute(
        select(User).where(User.supabase_user_id == supabase_user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        # First login - create local user record
        user_metadata = supabase_user.get("user_metadata", {})
        user = User(
            id=supabase_user_id,
            email=data.email,
            name=user_metadata.get("name", data.email.split("@")[0]),
            company=user_metadata.get("company"),
            supabase_user_id=supabase_user_id,
            auth_provider="email",
            is_verified=supabase_user.get("email_confirmed_at") is not None,
        )
        db.add(user)
        await db.flush()

    if not user.is_active:
        raise UnauthorizedException("User is inactive")

    # Return Supabase tokens directly
    return Token(
        access_token=session["access_token"],
        refresh_token=session.get("refresh_token", ""),
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: Database,
) -> Token:
    """Refresh access token using Supabase refresh token."""
    if not settings.supabase_url:
        raise BadRequestException("Supabase is not configured")

    # Refresh with Supabase
    session = await supabase_auth.refresh_session(refresh_token)

    if not session:
        raise UnauthorizedException("Invalid refresh token")

    supabase_user = session.get("user", {})
    supabase_user_id = supabase_user.get("id")

    # Verify user exists and is active
    result = await db.execute(
        select(User).where(User.supabase_user_id == supabase_user_id)
    )
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise UnauthorizedException("User not found or inactive")

    return Token(
        access_token=session["access_token"],
        refresh_token=session.get("refresh_token", refresh_token),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUser) -> User:
    """Get current user info."""
    return current_user


@router.post("/logout")
async def logout(current_user: CurrentUser) -> dict[str, str]:
    """Logout user."""
    # Note: For complete logout, frontend should also call Supabase signOut
    return {"message": "Successfully logged out"}
