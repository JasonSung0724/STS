"""Admin API endpoints for dashboard and management."""

import logging
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.deps import get_current_user, get_db
from src.models.user import User
from src.models.article import Article, ArticleStatus, SourcePlatform

logger = logging.getLogger(__name__)

router = APIRouter()


class UserStats(BaseModel):
    """User statistics."""
    
    total_users: int
    active_today: int
    active_this_week: int
    new_this_week: int


class ArticleStats(BaseModel):
    """Article statistics."""
    
    total_articles: int
    pending_review: int
    approved: int
    completed: int
    skipped: int
    failed: int


class PlatformStats(BaseModel):
    """Platform distribution statistics."""
    
    platform: str
    count: int


class AdminDashboardStats(BaseModel):
    """Complete admin dashboard statistics."""
    
    users: UserStats
    articles: ArticleStats
    platforms: list[PlatformStats]
    recent_articles: int  # Last 24 hours


class UserListItem(BaseModel):
    """User list item."""
    
    id: str
    email: str | None
    name: str | None
    created_at: datetime
    last_login_at: datetime | None
    is_active: bool

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    """User list response."""
    
    items: list[UserListItem]
    total: int
    page: int
    page_size: int
    total_pages: int


@router.get("/stats", response_model=AdminDashboardStats)
async def get_admin_stats(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> AdminDashboardStats:
    """
    Get admin dashboard statistics.
    
    Requires authentication.
    """
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=7)
    day_ago = now - timedelta(hours=24)

    # User stats
    total_users_result = await db.execute(select(func.count(User.id)))
    total_users = total_users_result.scalar() or 0

    new_this_week_result = await db.execute(
        select(func.count(User.id)).where(User.created_at >= week_start)
    )
    new_this_week = new_this_week_result.scalar() or 0

    # Article stats
    total_articles_result = await db.execute(select(func.count(Article.id)))
    total_articles = total_articles_result.scalar() or 0

    pending_review_result = await db.execute(
        select(func.count(Article.id)).where(
            Article.status == ArticleStatus.COMPLETED,
            Article.is_approved == False,
        )
    )
    pending_review = pending_review_result.scalar() or 0

    approved_result = await db.execute(
        select(func.count(Article.id)).where(Article.is_approved == True)
    )
    approved = approved_result.scalar() or 0

    completed_result = await db.execute(
        select(func.count(Article.id)).where(Article.status == ArticleStatus.COMPLETED)
    )
    completed = completed_result.scalar() or 0

    skipped_result = await db.execute(
        select(func.count(Article.id)).where(Article.status == ArticleStatus.SKIPPED)
    )
    skipped = skipped_result.scalar() or 0

    failed_result = await db.execute(
        select(func.count(Article.id)).where(Article.status == ArticleStatus.FAILED)
    )
    failed = failed_result.scalar() or 0

    # Recent articles
    recent_result = await db.execute(
        select(func.count(Article.id)).where(Article.created_at >= day_ago)
    )
    recent_articles = recent_result.scalar() or 0

    # Platform distribution
    platform_result = await db.execute(
        select(Article.source_platform, func.count(Article.id))
        .group_by(Article.source_platform)
    )
    platforms = [
        PlatformStats(platform=row[0].value, count=row[1])
        for row in platform_result.all()
    ]

    return AdminDashboardStats(
        users=UserStats(
            total_users=total_users,
            active_today=0,  # Would need session tracking
            active_this_week=0,  # Would need session tracking
            new_this_week=new_this_week,
        ),
        articles=ArticleStats(
            total_articles=total_articles,
            pending_review=pending_review,
            approved=approved,
            completed=completed,
            skipped=skipped,
            failed=failed,
        ),
        platforms=platforms,
        recent_articles=recent_articles,
    )


@router.get("/users", response_model=UserListResponse)
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
) -> UserListResponse:
    """
    Get paginated list of users.
    
    Requires authentication.
    """
    query = select(User)

    if search:
        query = query.where(
            User.email.ilike(f"%{search}%") | User.name.ilike(f"%{search}%")
        )

    # Get total count
    count_query = select(func.count(User.id))
    if search:
        count_query = count_query.where(
            User.email.ilike(f"%{search}%") | User.name.ilike(f"%{search}%")
        )
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    # Get paginated results
    query = query.order_by(User.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    users = list(result.scalars().all())

    total_pages = (total + page_size - 1) // page_size

    return UserListResponse(
        items=[UserListItem.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/users/{user_id}")
async def get_user_detail(
    user_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """
    Get user details.
    
    Requires authentication.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")

    return UserListItem.model_validate(user)
