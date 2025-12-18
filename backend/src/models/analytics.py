from datetime import datetime, timezone
from uuid import uuid4
import enum

from sqlalchemy import String, DateTime, Float, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.db.session import Base


class KPICategory(str, enum.Enum):
    """KPI category enum."""

    REVENUE = "revenue"
    COST = "cost"
    CUSTOMER = "customer"
    PERFORMANCE = "performance"
    CUSTOM = "custom"


class ReportType(str, enum.Enum):
    """Report type enum."""

    REVENUE = "revenue"
    COST = "cost"
    CUSTOMER = "customer"
    PERFORMANCE = "performance"
    COMPREHENSIVE = "comprehensive"


class KPIRecord(Base):
    """KPI record model."""

    __tablename__ = "kpi_records"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    previous_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    unit: Mapped[str] = mapped_column(String(50), default="")
    category: Mapped[KPICategory] = mapped_column(
        SQLEnum(KPICategory),
        default=KPICategory.CUSTOM,
    )
    metadata: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<KPIRecord {self.name}: {self.value}>"

    @property
    def change_percentage(self) -> float | None:
        """Calculate percentage change from previous value."""
        if self.previous_value is None or self.previous_value == 0:
            return None
        return ((self.value - self.previous_value) / self.previous_value) * 100


class Report(Base):
    """Report model."""

    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        default=lambda: str(uuid4()),
    )
    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    report_type: Mapped[ReportType] = mapped_column(
        SQLEnum(ReportType),
        default=ReportType.COMPREHENSIVE,
    )
    data: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    def __repr__(self) -> str:
        return f"<Report {self.title}>"
