from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """User creation schema."""

    email: EmailStr
    password: str = Field(min_length=8)
    name: str = Field(min_length=2, max_length=255)
    company: str = Field(min_length=2, max_length=255)


class UserUpdate(BaseModel):
    """User update schema."""

    name: str | None = Field(None, min_length=2, max_length=255)
    company: str | None = Field(None, min_length=2, max_length=255)
    role: str | None = Field(None, max_length=100)


class UserResponse(BaseModel):
    """User response schema."""

    id: str
    email: str | None
    name: str
    company: str | None
    role: str
    is_active: bool
    is_verified: bool
    auth_provider: str | None
    avatar_url: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LoginRequest(BaseModel):
    """Login request schema."""

    email: EmailStr
    password: str


class Token(BaseModel):
    """Token response schema."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Token payload schema."""

    sub: str
    type: str
    exp: datetime


# OAuth Schemas
class OAuthCallbackRequest(BaseModel):
    """OAuth callback request schema."""

    code: str
    state: str | None = None


class LineTokenResponse(BaseModel):
    """LINE token response schema."""

    access_token: str
    token_type: str
    refresh_token: str | None = None
    expires_in: int
    scope: str | None = None
    id_token: str | None = None


class LineProfile(BaseModel):
    """LINE user profile schema."""

    userId: str
    displayName: str
    pictureUrl: str | None = None
    statusMessage: str | None = None


class SupabaseAuthRequest(BaseModel):
    """Supabase auth callback request."""

    access_token: str
    refresh_token: str | None = None
    provider: Literal["google", "github", "facebook"] = "google"


class OAuthUrlResponse(BaseModel):
    """OAuth URL response schema."""

    auth_url: str
    state: str | None = None
