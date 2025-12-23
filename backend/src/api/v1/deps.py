"""FastAPI dependencies for authentication and database access."""

from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core import UnauthorizedException, verify_token
from src.db import get_db
from src.models import User


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current authenticated user.

    Supports both Supabase JWT tokens and local JWT tokens.
    For Supabase tokens, looks up user by supabase_user_id.
    For local tokens, looks up user by id.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise UnauthorizedException("Invalid authorization header")

    token = authorization.split(" ")[1]
    payload = verify_token(token, "access")

    if not payload:
        raise UnauthorizedException("Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid token payload")

    # Try to find user by supabase_user_id first (Supabase tokens)
    result = await db.execute(
        select(User).where(User.supabase_user_id == user_id)
    )
    user = result.scalar_one_or_none()

    # Fall back to id lookup (for backward compatibility with local tokens)
    if not user:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

    if not user:
        raise UnauthorizedException("User not found")

    if not user.is_active:
        raise UnauthorizedException("User is inactive")

    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
Database = Annotated[AsyncSession, Depends(get_db)]
