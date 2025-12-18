from fastapi import APIRouter, UploadFile, File
from sqlalchemy import select

from src.api.v1.deps import CurrentUser, Database
from src.models import KPIRecord, Report
from src.schemas import KPIResponse, ReportResponse, AnalyticsQuery, AnalyticsQueryResponse
from src.services.ai_agent import analyze_query

router = APIRouter()


@router.get("/kpi", response_model=list[KPIResponse])
async def get_kpis(
    current_user: CurrentUser,
    db: Database,
) -> list[KPIRecord]:
    """Get all KPIs for current user."""
    result = await db.execute(
        select(KPIRecord)
        .where(KPIRecord.user_id == current_user.id)
        .order_by(KPIRecord.recorded_at.desc())
    )
    kpis = list(result.scalars().all())

    # Calculate trends
    for kpi in kpis:
        if kpi.previous_value is not None:
            change = kpi.change_percentage
            if change is not None:
                if change > 0:
                    kpi.trend = "up"  # type: ignore
                elif change < 0:
                    kpi.trend = "down"  # type: ignore
                else:
                    kpi.trend = "stable"  # type: ignore
                kpi.change = change  # type: ignore

    return kpis


@router.get("/reports", response_model=list[ReportResponse])
async def get_reports(
    current_user: CurrentUser,
    db: Database,
) -> list[Report]:
    """Get all reports for current user."""
    result = await db.execute(
        select(Report)
        .where(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
    )
    return list(result.scalars().all())


@router.post("/upload")
async def upload_data(
    file: UploadFile = File(...),
    current_user: CurrentUser = None,  # type: ignore
    db: Database = None,  # type: ignore
) -> dict[str, str]:
    """Upload data file for analysis."""
    # TODO: Implement file processing
    # - Parse CSV/Excel files
    # - Extract KPIs
    # - Store in database
    content = await file.read()
    filename = file.filename or "unknown"

    return {
        "message": f"File '{filename}' uploaded successfully",
        "size": str(len(content)),
    }


@router.post("/query", response_model=AnalyticsQueryResponse)
async def query_analytics(
    data: AnalyticsQuery,
    current_user: CurrentUser,
    db: Database,
) -> AnalyticsQueryResponse:
    """Query analytics data using natural language."""
    # Get user's KPIs and reports for context
    kpi_result = await db.execute(
        select(KPIRecord)
        .where(KPIRecord.user_id == current_user.id)
        .order_by(KPIRecord.recorded_at.desc())
        .limit(20)
    )
    kpis = list(kpi_result.scalars().all())

    report_result = await db.execute(
        select(Report)
        .where(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
        .limit(5)
    )
    reports = list(report_result.scalars().all())

    # Use AI to analyze the query
    response = await analyze_query(
        query=data.query,
        kpis=kpis,
        reports=reports,
        user=current_user,
    )

    return AnalyticsQueryResponse(
        answer=response["answer"],
        data=response.get("data"),
        charts=response.get("charts"),
    )
