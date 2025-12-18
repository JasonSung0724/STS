from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class KPIResponse(BaseModel):
    """KPI response schema."""

    id: str
    name: str
    value: float
    previous_value: float | None
    unit: str
    category: str
    change: float | None = None
    trend: str = "stable"
    recorded_at: datetime

    model_config = {"from_attributes": True}


class ReportResponse(BaseModel):
    """Report response schema."""

    id: str
    title: str
    description: str | None
    report_type: str
    data: dict[str, Any]
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalyticsQuery(BaseModel):
    """Analytics query schema."""

    query: str = Field(min_length=1, max_length=1000)


class AnalyticsQueryResponse(BaseModel):
    """Analytics query response schema."""

    answer: str
    data: dict[str, Any] | None = None
    charts: list[dict[str, Any]] | None = None


class ChartConfig(BaseModel):
    """Chart configuration schema."""

    type: str  # line, bar, pie, area
    title: str
    data: list[dict[str, Any]]
    x_key: str
    y_keys: list[str]
