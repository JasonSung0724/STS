"""Keyword schemas for API validation."""

from datetime import datetime

from pydantic import BaseModel, Field


class KeywordBase(BaseModel):
    """Base keyword schema."""
    
    category: str = Field(..., min_length=1, max_length=50)
    keyword: str = Field(..., min_length=1, max_length=100)
    keyword_zh: str | None = Field(None, max_length=100)
    description: str | None = None
    is_active: bool = True
    weight: float = Field(1.0, ge=0.1, le=3.0)


class KeywordCreate(KeywordBase):
    """Schema for creating a keyword."""
    pass


class KeywordUpdate(BaseModel):
    """Schema for updating a keyword."""
    
    category: str | None = None
    keyword: str | None = None
    keyword_zh: str | None = None
    description: str | None = None
    is_active: bool | None = None
    weight: float | None = Field(None, ge=0.1, le=3.0)


class KeywordResponse(KeywordBase):
    """Schema for keyword response."""
    
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class KeywordListResponse(BaseModel):
    """Schema for keyword list response."""
    
    items: list[KeywordResponse]
    total: int
    categories: list[str]


class KeywordBulkCreate(BaseModel):
    """Schema for bulk creating keywords."""
    
    keywords: list[KeywordCreate]


class KeywordCategoryInfo(BaseModel):
    """Info about a keyword category."""
    
    category: str
    display_name: str
    count: int
    active_count: int
