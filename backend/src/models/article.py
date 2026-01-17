"""Article model for storing scraped and rewritten articles."""

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import String, DateTime, Text, Enum as SQLEnum, Boolean, Float
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from src.db.session import Base

import enum


class SourcePlatform(str, enum.Enum):
    """Supported article source platforms."""

    MEDIUM = "medium"
    DEVTO = "devto"
    HACKERNEWS = "hackernews"
    X = "x"  # Twitter/X
    REDDIT = "reddit"
    TAIWAN_NEWS = "taiwan_news"
    CUSTOM = "custom"


class ArticleStatus(str, enum.Enum):
    """Article processing status."""

    PENDING = "pending"  # Scraped, waiting for analysis
    ANALYZING = "analyzing"  # Currently being analyzed
    QUALIFIED = "qualified"  # Passed analysis, waiting for rewrite
    PROCESSING = "processing"  # Currently being rewritten
    COMPLETED = "completed"  # Rewriting completed
    SKIPPED = "skipped"  # Did not pass quality filter, skipped
    FAILED = "failed"  # Processing failed


class Article(Base):
    """Article model for scraped and rewritten content."""

    __tablename__ = "articles"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    original_url: Mapped[str] = mapped_column(
        String(2000), unique=True, nullable=False, index=True
    )
    source_platform: Mapped[SourcePlatform] = mapped_column(
        SQLEnum(SourcePlatform),
        nullable=False,
        index=True,
    )
    author: Mapped[str | None] = mapped_column(String(255), nullable=True)
    
    # Content fields - original_content is nullable for skipped articles
    original_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    rewritten_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    tags: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    
    # Processing status
    status: Mapped[ArticleStatus] = mapped_column(
        SQLEnum(ArticleStatus),
        default=ArticleStatus.PENDING,
        nullable=False,
        index=True,
    )
    
    # Analysis tracking fields
    is_analyzed: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, index=True
    )
    is_qualified: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, index=True
    )
    analysis_score: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    skip_reason: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )
    
    # Approval fields (for human review)
    is_approved: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, index=True
    )
    approved_by: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    rejection_reason: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )
    
    # Timestamps
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<Article {self.title[:50]}...>"

