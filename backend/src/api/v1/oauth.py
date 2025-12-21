"""OAuth authentication endpoints for LINE and Supabase (Google)."""

from fastapi import APIRouter, Query
from fastapi.responses import RedirectResponse
from sqlalchemy import select

from src.api.v1.deps import Database
from src.config import settings
from src.core import (
    BadRequestException,
    UnauthorizedException,
    create_access_token,
    create_refresh_token,
)
from src.models import User
from src.schemas import (
    OAuthCallbackRequest,
    OAuthUrlResponse,
    SupabaseAuthRequest,
    Token,
    UserResponse,
)
from src.services.oauth import LineOAuthService, SupabaseAuthService

router = APIRouter()

# Initialize services
line_service = LineOAuthService()
supabase_service = SupabaseAuthService()


# ===========================================
# LINE OAuth Endpoints
# ===========================================


@router.get("/line/authorize", response_model=OAuthUrlResponse)
async def line_authorize() -> OAuthUrlResponse:
    """Get LINE OAuth authorization URL."""
    if not settings.line_channel_id:
        raise BadRequestException("LINE OAuth is not configured")

    auth_url, state = line_service.get_auth_url()
    return OAuthUrlResponse(auth_url=auth_url, state=state)


@router.get("/line/callback")
async def line_callback(
    code: str = Query(...),
    state: str = Query(None),
    db: Database = None,
) -> RedirectResponse:
    """Handle LINE OAuth callback.

    This endpoint is called by LINE after user authorization.
    It exchanges the code for tokens, gets user profile, and creates/updates user.
    """
    if not settings.line_channel_id:
        raise BadRequestException("LINE OAuth is not configured")

    try:
        # Exchange code for tokens
        token_response = await line_service.exchange_code_for_token(code)

        # Get user profile
        profile = await line_service.get_user_profile(token_response.access_token)

        # Find or create user
        result = await db.execute(
            select(User).where(User.line_user_id == profile.userId)
        )
        user = result.scalar_one_or_none()

        if not user:
            # Create new user
            user = User(
                name=profile.displayName,
                line_user_id=profile.userId,
                avatar_url=profile.pictureUrl,
                auth_provider="line",
                provider_user_id=profile.userId,
                is_verified=True,  # LINE users are verified
            )
            db.add(user)
            await db.flush()
            await db.refresh(user)
        else:
            # Update existing user
            user.name = profile.displayName
            user.avatar_url = profile.pictureUrl
            await db.flush()

        # Generate JWT tokens
        access_token = create_access_token({"sub": user.id})
        refresh_token = create_refresh_token({"sub": user.id})

        # Redirect to frontend with tokens
        redirect_url = (
            f"{settings.cors_origins[0]}/auth/callback"
            f"?access_token={access_token}"
            f"&refresh_token={refresh_token}"
            f"&provider=line"
        )
        return RedirectResponse(url=redirect_url)

    except Exception as e:
        # Redirect to frontend with error
        error_url = f"{settings.cors_origins[0]}/auth/callback?error={str(e)}"
        return RedirectResponse(url=error_url)


@router.post("/line/token", response_model=Token)
async def line_token(
    data: OAuthCallbackRequest,
    db: Database,
) -> Token:
    """Exchange LINE authorization code for tokens (API method).

    Use this for mobile apps or SPAs that handle the OAuth flow themselves.
    """
    if not settings.line_channel_id:
        raise BadRequestException("LINE OAuth is not configured")

    try:
        # Exchange code for tokens
        token_response = await line_service.exchange_code_for_token(data.code)

        # Get user profile
        profile = await line_service.get_user_profile(token_response.access_token)

        # Find or create user
        result = await db.execute(
            select(User).where(User.line_user_id == profile.userId)
        )
        user = result.scalar_one_or_none()

        if not user:
            # Create new user
            user = User(
                name=profile.displayName,
                line_user_id=profile.userId,
                avatar_url=profile.pictureUrl,
                auth_provider="line",
                provider_user_id=profile.userId,
                is_verified=True,
            )
            db.add(user)
            await db.flush()
            await db.refresh(user)
        else:
            # Update existing user
            user.name = profile.displayName
            user.avatar_url = profile.pictureUrl
            await db.flush()

        # Generate JWT tokens
        access_token = create_access_token({"sub": user.id})
        refresh_token = create_refresh_token({"sub": user.id})

        return Token(access_token=access_token, refresh_token=refresh_token)

    except Exception as e:
        raise UnauthorizedException(f"LINE authentication failed: {str(e)}")


# ===========================================
# Supabase/Google OAuth Endpoints
# ===========================================


@router.get("/google/authorize", response_model=OAuthUrlResponse)
async def google_authorize() -> OAuthUrlResponse:
    """Get Google OAuth authorization URL via Supabase."""
    if not settings.supabase_url:
        raise BadRequestException("Supabase is not configured")

    redirect_to = f"{settings.cors_origins[0]}/auth/callback"
    auth_url = await supabase_service.get_oauth_url("google", redirect_to)

    return OAuthUrlResponse(auth_url=auth_url)


@router.post("/supabase/callback", response_model=Token)
async def supabase_callback(
    data: SupabaseAuthRequest,
    db: Database,
) -> Token:
    """Handle Supabase OAuth callback.

    After Supabase redirects to frontend with tokens, frontend calls this
    endpoint to sync user with our database and get our JWT tokens.
    """
    if not settings.supabase_url:
        raise BadRequestException("Supabase is not configured")

    try:
        # Get user from Supabase token
        supabase_user = await supabase_service.get_user_from_token(data.access_token)

        if not supabase_user:
            raise UnauthorizedException("Invalid Supabase token")

        supabase_user_id = supabase_user.get("id")
        email = supabase_user.get("email")
        user_metadata = supabase_user.get("user_metadata", {})
        name = user_metadata.get("full_name") or user_metadata.get("name") or email
        avatar_url = user_metadata.get("avatar_url") or user_metadata.get("picture")

        # Find user by supabase_user_id or email
        result = await db.execute(
            select(User).where(
                (User.supabase_user_id == supabase_user_id) | (User.email == email)
            )
        )
        user = result.scalar_one_or_none()

        if not user:
            # Create new user
            user = User(
                email=email,
                name=name,
                supabase_user_id=supabase_user_id,
                avatar_url=avatar_url,
                auth_provider=data.provider,
                provider_user_id=supabase_user_id,
                is_verified=True,  # OAuth users are verified
            )
            db.add(user)
            await db.flush()
            await db.refresh(user)
        else:
            # Update existing user
            user.supabase_user_id = supabase_user_id
            user.avatar_url = avatar_url
            if not user.auth_provider:
                user.auth_provider = data.provider
            await db.flush()

        # Generate our JWT tokens
        access_token = create_access_token({"sub": user.id})
        refresh_token = create_refresh_token({"sub": user.id})

        return Token(access_token=access_token, refresh_token=refresh_token)

    except Exception as e:
        raise UnauthorizedException(f"Supabase authentication failed: {str(e)}")


# ===========================================
# User Info Endpoint
# ===========================================


@router.get("/me", response_model=UserResponse)
async def get_oauth_user(
    access_token: str = Query(..., description="Our JWT access token"),
    db: Database = None,
) -> UserResponse:
    """Get current user info from OAuth token."""
    from src.core import verify_token

    payload = verify_token(access_token, "access")
    if not payload:
        raise UnauthorizedException("Invalid token")

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise UnauthorizedException("User not found")

    return UserResponse.model_validate(user)
