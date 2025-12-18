from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    """Message creation schema."""

    content: str = Field(min_length=1, max_length=10000)


class MessageResponse(BaseModel):
    """Message response schema."""

    id: str
    conversation_id: str
    role: str
    content: str
    metadata: dict[str, Any] | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationCreate(BaseModel):
    """Conversation creation schema."""

    title: str | None = Field(None, max_length=255)


class ConversationResponse(BaseModel):
    """Conversation response schema."""

    id: str
    user_id: str
    title: str
    messages: list[MessageResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ConversationListResponse(BaseModel):
    """Conversation list response schema."""

    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    last_message: str | None = None

    model_config = {"from_attributes": True}
