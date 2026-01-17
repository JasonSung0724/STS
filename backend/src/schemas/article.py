"""Article schemas for API request/response validation."""

from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl

from src.models.article import SourcePlatform, ArticleStatus


class ArticleBase(BaseModel):
    """Base article schema with common fields."""

    title: str = Field(..., min_length=1, max_length=500)
    original_url: HttpUrl
    source_platform: SourcePlatform
    author: str | None = None
    tags: list[str] | None = None
    published_at: datetime | None = None


class ArticleCreate(ArticleBase):
    """Schema for creating an article."""

    original_content: str = Field(..., min_length=1)


class ArticleUpdate(BaseModel):
    """Schema for updating an article."""

    title: str | None = Field(None, min_length=1, max_length=500)
    rewritten_content: str | None = None
    summary: str | None = None
    tags: list[str] | None = None
    status: ArticleStatus | None = None


class ArticleResponse(BaseModel):
    """Schema for article response."""

    id: str
    title: str
    original_url: str
    source_platform: SourcePlatform
    author: str | None
    original_content: str
    rewritten_content: str | None
    summary: str | None
    tags: list[str] | None
    status: ArticleStatus
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ArticleListItem(BaseModel):
    """Schema for article list item (without full content)."""

    id: str
    title: str
    original_url: str
    source_platform: SourcePlatform
    author: str | None
    summary: str | None
    tags: list[str] | None
    status: ArticleStatus
    published_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ArticleListResponse(BaseModel):
    """Schema for paginated article list response."""

    items: list[ArticleListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class SyncResponse(BaseModel):
    """Schema for sync operation response."""

    message: str
    articles_scraped: int
    articles_rewritten: int
    errors: list[str] | None = None
