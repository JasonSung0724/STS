"""OAuth authentication endpoints for LINE and Supabase (Google).

All OAuth users are created in Supabase Auth for unified user management:
- Google: Uses Supabase's native OAuth provider
- LINE: Custom implementation that creates users in Supabase via Admin API
"""

import secrets

from fastapi import APIRouter, Query
from fastapi.responses import RedirectResponse
from sqlalchemy import select

from src.api.v1.deps import Database
from src.config import settings
from src.core import (
    BadRequestException,
    UnauthorizedException,
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


def _generate_line_email(line_user_id: str) -> str:
    """Generate a placeholder email for LINE users who don't share their email."""
    return f"line_{line_user_id}@line.placeholder"


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
    Creates user in Supabase Auth (if not exists) and syncs to local database.
    """
    if not settings.line_channel_id:
        raise BadRequestException("LINE OAuth is not configured")

    if not settings.supabase_url:
        raise BadRequestException("Supabase is not configured")

    try:
        # Exchange code for tokens
        token_response = await line_service.exchange_code_for_token(code)

        # Get user profile from LINE
        profile = await line_service.get_user_profile(token_response.access_token)

        # Check if user already exists in local DB
        result = await db.execute(
            select(User).where(User.line_user_id == profile.userId)
        )
        user = result.scalar_one_or_none()

        if not user:
            # Create user in Supabase Auth using Admin API
            # LINE doesn't always provide email, so we use a placeholder
            line_email = _generate_line_email(profile.userId)
            random_password = secrets.token_urlsafe(32)

            try:
                supabase_user = await supabase_service.admin_create_user(
                    email=line_email,
                    password=random_password,
                    user_metadata={
                        "name": profile.displayName,
                        "avatar_url": profile.pictureUrl,
                        "provider": "line",
                        "line_user_id": profile.userId,
                    },
                    app_metadata={
                        "provider": "line",
                        "providers": ["line"],
                    },
                    email_confirm=True,  # Auto-confirm since LINE verified the user
                )
                supabase_user_id = supabase_user.get("id")
            except ValueError:
                # User might already exist in Supabase, try to find them
                existing_user = await supabase_service.admin_get_user_by_email(line_email)
                if existing_user:
                    supabase_user_id = existing_user.get("id")
                else:
                    raise

            # Create user in local database
            user = User(
                id=supabase_user_id,  # Use Supabase user ID as primary key
                name=profile.displayName,
                line_user_id=profile.userId,
                supabase_user_id=supabase_user_id,
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

        # Get Supabase session for the user
        # Since LINE user doesn't have a real password, we use admin API to generate a link
        # and extract the session, or return a signed token
        # For now, we'll use the local JWT approach since Supabase doesn't have LINE as provider

        # Generate session using Supabase Admin API
        # We'll redirect to frontend with Supabase user ID, and frontend will handle it
        redirect_url = (
            f"{settings.cors_origins[0]}/auth/callback"
            f"?provider=line"
            f"&user_id={user.supabase_user_id}"
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
    Creates user in Supabase Auth and returns Supabase tokens.
    """
    if not settings.line_channel_id:
        raise BadRequestException("LINE OAuth is not configured")

    if not settings.supabase_url:
        raise BadRequestException("Supabase is not configured")

    try:
        # Exchange code for LINE tokens
        token_response = await line_service.exchange_code_for_token(data.code)

        # Get user profile from LINE
        profile = await line_service.get_user_profile(token_response.access_token)

        # Check if user already exists in local DB
        result = await db.execute(
            select(User).where(User.line_user_id == profile.userId)
        )
        user = result.scalar_one_or_none()

        line_email = _generate_line_email(profile.userId)
        random_password = secrets.token_urlsafe(32)

        if not user:
            # Create user in Supabase Auth using Admin API
            try:
                supabase_user = await supabase_service.admin_create_user(
                    email=line_email,
                    password=random_password,
                    user_metadata={
                        "name": profile.displayName,
                        "avatar_url": profile.pictureUrl,
                        "provider": "line",
                        "line_user_id": profile.userId,
                    },
                    app_metadata={
                        "provider": "line",
                        "providers": ["line"],
                    },
                    email_confirm=True,
                )
                supabase_user_id = supabase_user.get("id")
            except ValueError:
                existing_user = await supabase_service.admin_get_user_by_email(line_email)
                if existing_user:
                    supabase_user_id = existing_user.get("id")
                else:
                    raise

            # Create user in local database
            user = User(
                id=supabase_user_id,
                name=profile.displayName,
                line_user_id=profile.userId,
                supabase_user_id=supabase_user_id,
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
            supabase_user_id = user.supabase_user_id
            await db.flush()

        # For LINE users, we sign them in using the placeholder email/password
        # This generates a valid Supabase session
        session = await supabase_service.sign_in_with_email(
            email=line_email,
            password=random_password,
        )

        if session:
            return Token(
                access_token=session["access_token"],
                refresh_token=session.get("refresh_token", ""),
            )

        # If sign-in fails (password might have changed), generate new password and update
        new_password = secrets.token_urlsafe(32)
        await supabase_service.admin_update_user(
            user_id=supabase_user_id,
            password=new_password,
        )

        session = await supabase_service.sign_in_with_email(
            email=line_email,
            password=new_password,
        )

        if not session:
            raise UnauthorizedException("Failed to create session for LINE user")

        return Token(
            access_token=session["access_token"],
            refresh_token=session.get("refresh_token", ""),
        )

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
    endpoint to sync user with our database.
    The Supabase tokens are already valid, so we just sync and return them.
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
            # Create new user in local database
            user = User(
                id=supabase_user_id,  # Use Supabase user ID as primary key
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

        # Return Supabase tokens directly (they're already valid)
        return Token(
            access_token=data.access_token,
            refresh_token=data.refresh_token or "",
        )

    except Exception as e:
        raise UnauthorizedException(f"Supabase authentication failed: {str(e)}")


# ===========================================
# User Info Endpoint
# ===========================================


@router.get("/me", response_model=UserResponse)
async def get_oauth_user(
    access_token: str = Query(..., description="Supabase or local JWT access token"),
    db: Database = None,
) -> UserResponse:
    """Get current user info from OAuth token."""
    from src.core import verify_token

    payload = verify_token(access_token, "access")
    if not payload:
        raise UnauthorizedException("Invalid token")

    user_id = payload.get("sub")

    # Try to find user by supabase_user_id first
    result = await db.execute(
        select(User).where(User.supabase_user_id == user_id)
    )
    user = result.scalar_one_or_none()

    # Fall back to id lookup
    if not user:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

    if not user:
        raise UnauthorizedException("User not found")

    return UserResponse.model_validate(user)
