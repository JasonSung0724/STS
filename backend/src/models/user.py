from datetime import datetime, timezone
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.session import Base

if TYPE_CHECKING:
    from src.models.conversation import Conversation


class User(Base):
    """User model."""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    email: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=True,  # OAuth users may not have email
    )
    hashed_password: Mapped[str | None] = mapped_column(
        String(255), nullable=True  # OAuth users don't have password
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str | None] = mapped_column(
        String(255), nullable=True  # OAuth users may not have company
    )
    role: Mapped[str] = mapped_column(String(100), default="user")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # OAuth Provider Fields
    auth_provider: Mapped[str | None] = mapped_column(
        String(50), nullable=True, index=True  # 'email', 'google', 'line'
    )
    provider_user_id: Mapped[str | None] = mapped_column(
        String(255), nullable=True, index=True  # ID from OAuth provider
    )
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # LINE specific fields
    line_user_id: Mapped[str | None] = mapped_column(
        String(255), unique=True, nullable=True, index=True
    )

    # Google/Supabase specific fields
    supabase_user_id: Mapped[str | None] = mapped_column(
        String(255), unique=True, nullable=True, index=True
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

    # Relationships
    conversations: Mapped[list["Conversation"]] = relationship(
        "Conversation",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User {self.email}>"
