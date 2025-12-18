from datetime import datetime

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
    email: str
    name: str
    company: str
    role: str
    is_active: bool
    is_verified: bool
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
