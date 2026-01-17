"""Articles API endpoints."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.deps import get_current_user, get_db
from src.models.user import User
from src.models.article import ArticleStatus, SourcePlatform
from src.schemas.article import (
    ArticleResponse,
    ArticleListItem,
    ArticleListResponse,
    SyncResponse,
)
from src.services.article_service import ArticleService
from src.services.scrapers.manager import ScraperManager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=ArticleListResponse)
async def list_articles(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: ArticleStatus | None = None,
    platform: SourcePlatform | None = None,
) -> ArticleListResponse:
    """
    Get paginated list of articles.
    
    Requires authentication.
    """
    service = ArticleService(db)
    articles, total = await service.get_articles(
        page=page,
        page_size=page_size,
        status=status,
        platform=platform,
    )

    total_pages = (total + page_size - 1) // page_size

    return ArticleListResponse(
        items=[ArticleListItem.model_validate(a) for a in articles],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{article_id}", response_model=ArticleResponse)
async def get_article(
    article_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ArticleResponse:
    """
    Get a specific article by ID.
    
    Requires authentication.
    """
    service = ArticleService(db)
    article = await service.get_article(article_id)

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    return ArticleResponse.model_validate(article)


@router.post("/sync", response_model=SyncResponse)
async def sync_articles(
    background_tasks: BackgroundTasks,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    platforms: list[str] | None = Query(None),
    limit_per_platform: int = Query(5, ge=1, le=20),
    min_quality_score: float = Query(50.0, ge=0, le=100),
    max_qualified: int = Query(10, ge=1, le=50),
) -> SyncResponse:
    """
    Trigger article sync from external platforms.
    
    Two-stage pipeline:
    1. Stage 1 (Quick Filter): Check title/summary for blocked words and relevance
    2. Fetch full content for articles that pass Stage 1
    3. Stage 2 (Deep Analysis): Full content quality scoring
    4. Save qualified articles → queue for rewriting
    
    Args:
        platforms: List of platforms to sync from (default: all).
        limit_per_platform: Max articles per platform.
        min_quality_score: Minimum quality score (0-100) for Stage 2.
        max_qualified: Maximum qualified articles to process.
    
    Requires authentication.
    """
    from src.services.article_pipeline import ArticlePipeline
    from src.services.keyword_service import KeywordService

    manager = ScraperManager(enabled_platforms=platforms)
    keyword_service = KeywordService(db)

    # Load keywords from database
    hot_topics = await keyword_service.get_active_keywords()
    blocked_keywords = await keyword_service.get_blocked_keywords()
    
    logger.info(f"Loaded {len(hot_topics)} hot topics, {len(blocked_keywords)} blocked keywords")

    # Create pipeline
    pipeline = ArticlePipeline(
        db=db,
        hot_topics=hot_topics,
        blocked_keywords=blocked_keywords,
        min_score=min_quality_score,
    )

    errors: list[str] = []

    try:
        # Fetch articles from all enabled platforms
        logger.info(f"Fetching articles from {len(manager.scrapers)} platforms...")
        scraped_articles = await manager.fetch_all_articles(
            limit_per_platform=limit_per_platform
        )
        logger.info(f"Fetched {len(scraped_articles)} articles total")

        # Process through two-stage pipeline
        stats = await pipeline.process_articles(
            articles=scraped_articles,
            max_qualified=max_qualified,
        )

        # Queue qualified articles for rewriting
        from sqlalchemy import select
        from src.models.article import Article
        
        result = await db.execute(
            select(Article.id).where(
                Article.is_qualified == True,
                Article.status == ArticleStatus.PENDING,
                Article.rewritten_content.is_(None),
            ).limit(max_qualified)
        )
        pending_ids = [row[0] for row in result.all()]
        
        service = ArticleService(db)
        for article_id in pending_ids:
            background_tasks.add_task(service.rewrite_article, article_id)

    except Exception as e:
        error_msg = f"Sync failed: {e}"
        logger.error(error_msg)
        errors.append(error_msg)
        stats = {"stage2_passed": 0, "stage1_failed": 0, "stage2_failed": 0, "already_processed": 0}

    message = f"同步完成。合格 {stats['stage2_passed']} 篇"
    skipped = stats.get('stage1_failed', 0) + stats.get('stage2_failed', 0)
    if skipped > 0:
        message += f"，跳過 {skipped} 篇"
    if stats.get('already_processed', 0) > 0:
        message += f"，{stats['already_processed']} 篇已存在"

    return SyncResponse(
        message=message,
        articles_scraped=stats.get('total', 0),
        articles_rewritten=stats['stage2_passed'],
        errors=errors if errors else None,
    )


@router.post("/{article_id}/rewrite", response_model=ArticleResponse)
async def rewrite_article(
    article_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ArticleResponse:
    """
    Manually trigger AI rewriting for a specific article.
    
    Requires authentication.
    """
    service = ArticleService(db)
    article = await service.get_article(article_id)

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    result = await service.rewrite_article(article_id)

    if not result.success:
        raise HTTPException(
            status_code=500,
            detail=f"Rewriting failed: {result.error}",
        )

    # Refresh article data
    article = await service.get_article(article_id)
    return ArticleResponse.model_validate(article)


@router.get("/pending-review", response_model=ArticleListResponse)
async def get_pending_review_articles(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> ArticleListResponse:
    """
    Get articles pending human review.
    
    These are completed articles that have not been approved yet.
    Requires authentication.
    """
    from sqlalchemy import select, func
    from src.models.article import Article

    query = select(Article).where(
        Article.status == ArticleStatus.COMPLETED,
        Article.is_approved == False,
    )

    # Get total count
    count_query = select(func.count(Article.id)).where(
        Article.status == ArticleStatus.COMPLETED,
        Article.is_approved == False,
    )
    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    # Get paginated results
    query = query.order_by(Article.created_at.desc())
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    articles = list(result.scalars().all())

    total_pages = (total + page_size - 1) // page_size

    return ArticleListResponse(
        items=[ArticleListItem.model_validate(a) for a in articles],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/{article_id}/approve", response_model=ArticleResponse)
async def approve_article(
    article_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> ArticleResponse:
    """
    Approve an article for public display.
    
    Requires authentication.
    """
    from datetime import datetime, timezone
    from sqlalchemy import select
    from src.models.article import Article

    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    if article.status != ArticleStatus.COMPLETED:
        raise HTTPException(
            status_code=400,
            detail="Only completed articles can be approved",
        )

    article.is_approved = True
    article.approved_by = current_user.email or current_user.id
    article.approved_at = datetime.now(timezone.utc)
    article.rejection_reason = None

    await db.commit()
    await db.refresh(article)

    return ArticleResponse.model_validate(article)


@router.post("/{article_id}/reject", response_model=ArticleResponse)
async def reject_article(
    article_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    reason: str = Query(..., min_length=1, max_length=500),
) -> ArticleResponse:
    """
    Reject an article.
    
    Requires authentication.
    """
    from datetime import datetime, timezone
    from sqlalchemy import select
    from src.models.article import Article

    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    article.is_approved = False
    article.status = ArticleStatus.FAILED
    article.rejection_reason = reason
    article.approved_by = current_user.email or current_user.id
    article.approved_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(article)

    return ArticleResponse.model_validate(article)

