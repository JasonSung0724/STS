"""Keyword model for storing configurable analysis keywords."""

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import String, DateTime, Boolean, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from src.db.session import Base


class KeywordCategory:
    """Keyword category constants."""
    
    STARTUP = "startup"           # 創業相關
    BUSINESS = "business"         # 商業策略與經營
    MARKETING = "marketing"       # 行銷概念
    KPI = "kpi"                   # KPI 與績效管理
    COST = "cost"                 # 成本與效率
    FINANCE = "finance"           # 金融投資
    INDUSTRY = "industry"         # 產業分析
    TECH = "tech"                 # AI 與科技趨勢
    TAIWAN = "taiwan"             # 台灣相關
    MANAGEMENT = "management"     # 管理與領導
    ECOMMERCE = "ecommerce"       # 電商與消費


class Keyword(Base):
    """Keyword model for configurable article analysis keywords."""

    __tablename__ = "keywords"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    category: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )
    keyword: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )
    keyword_zh: Mapped[str | None] = mapped_column(
        String(100), nullable=True
    )
    description: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, index=True
    )
    weight: Mapped[float] = mapped_column(
        Float, default=1.0, nullable=False
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
        return f"<Keyword {self.category}:{self.keyword}>"
