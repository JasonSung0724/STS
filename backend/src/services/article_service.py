"""Article service for CRUD operations."""

import logging
from datetime import datetime
from uuid import uuid4

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.article import Article, ArticleStatus, SourcePlatform
from src.schemas.article import ArticleCreate, ArticleUpdate
from src.services.scrapers.base import ArticleData
from src.services.scrapers.rewriter import AIRewriteService, RewriteResult

logger = logging.getLogger(__name__)


class ArticleService:
    """Service for managing articles."""

    def __init__(self, db: AsyncSession) -> None:
        """Initialize article service with database session."""
        self.db = db
        self.rewriter = AIRewriteService()

    async def create_article(self, article_data: ArticleCreate) -> Article:
        """Create a new article."""
        article = Article(
            id=str(uuid4()),
            title=article_data.title,
            original_url=str(article_data.original_url),
            source_platform=article_data.source_platform,
            author=article_data.author,
            original_content=article_data.original_content,
            tags=article_data.tags,
            published_at=article_data.published_at,
            status=ArticleStatus.PENDING,
        )
        self.db.add(article)
        await self.db.commit()
        await self.db.refresh(article)
        return article

    async def get_article_by_url(self, url: str) -> Article | None:
        """Get an article by its original URL."""
        result = await self.db.execute(
            select(Article).where(Article.original_url == url)
        )
        return result.scalar_one_or_none()

    async def check_and_save_article(
        self,
        data: ArticleData,
    ) -> tuple[Article | None, bool]:
        """
        Check if article exists and save if new.
        
        Returns:
            Tuple of (article, is_new).
            - If article exists and was already analyzed: (existing_article, False)
            - If article is new and saved: (new_article, True)
        """
        existing = await self.get_article_by_url(str(data.url))
        
        if existing:
            # Article already exists, check if analyzed
            if existing.is_analyzed:
                logger.info(f"Article already analyzed: {data.url}")
                return existing, False
            else:
                # Exists but not analyzed yet, return it for analysis
                return existing, False
        
        # New article - save with full content for analysis
        article = Article(
            id=str(uuid4()),
            title=data.title,
            original_url=str(data.url),
            source_platform=SourcePlatform(data.source_platform),
            author=data.author,
            original_content=data.content,
            tags=data.tags,
            published_at=data.published_at,
            status=ArticleStatus.PENDING,
            is_analyzed=False,
            is_qualified=False,
        )
        self.db.add(article)
        await self.db.commit()
        await self.db.refresh(article)
        return article, True

    async def save_skipped_article(
        self,
        data: ArticleData,
        score: float,
        skip_reason: str,
    ) -> Article:
        """
        Save a skipped article with minimal data.
        Only stores metadata to prevent re-processing.
        """
        existing = await self.get_article_by_url(str(data.url))
        
        if existing:
            # Update existing article as skipped
            existing.is_analyzed = True
            existing.is_qualified = False
            existing.analysis_score = score
            existing.skip_reason = skip_reason
            existing.status = ArticleStatus.SKIPPED
            # Clear content to save space
            existing.original_content = None
            await self.db.commit()
            await self.db.refresh(existing)
            return existing
        
        # Create new skipped article with minimal data
        article = Article(
            id=str(uuid4()),
            title=data.title,
            original_url=str(data.url),
            source_platform=SourcePlatform(data.source_platform),
            author=data.author,
            original_content=None,  # Don't store content for skipped
            tags=data.tags[:3] if data.tags else None,  # Store only first 3 tags
            published_at=data.published_at,
            status=ArticleStatus.SKIPPED,
            is_analyzed=True,
            is_qualified=False,
            analysis_score=score,
            skip_reason=skip_reason,
        )
        self.db.add(article)
        await self.db.commit()
        await self.db.refresh(article)
        return article

    async def mark_as_qualified(
        self,
        article_id: str,
        score: float,
    ) -> Article | None:
        """Mark an article as qualified for rewriting."""
        article = await self.get_article(article_id)
        if not article:
            return None
        
        article.is_analyzed = True
        article.is_qualified = True
        article.analysis_score = score
        article.status = ArticleStatus.QUALIFIED
        await self.db.commit()
        await self.db.refresh(article)
        return article

    async def create_from_scraped_data(self, data: ArticleData) -> Article | None:
        """Create an article from scraped data."""
        # Check if article already exists
        if await self.article_exists_by_url(str(data.url)):
            logger.info(f"Article already exists: {data.url}")
            return None

        article = Article(
            id=str(uuid4()),
            title=data.title,
            original_url=str(data.url),
            source_platform=SourcePlatform(data.source_platform),
            author=data.author,
            original_content=data.content,
            tags=data.tags,
            published_at=data.published_at,
            status=ArticleStatus.PENDING,
        )
        self.db.add(article)
        await self.db.commit()
        await self.db.refresh(article)
        return article

    async def get_article(self, article_id: str) -> Article | None:
        """Get an article by ID."""
        result = await self.db.execute(
            select(Article).where(Article.id == article_id)
        )
        return result.scalar_one_or_none()

    async def get_articles(
        self,
        page: int = 1,
        page_size: int = 20,
        status: ArticleStatus | None = None,
        platform: SourcePlatform | None = None,
        qualified_only: bool = False,
    ) -> tuple[list[Article], int]:
        """
        Get paginated list of articles.

        Returns:
            Tuple of (articles list, total count).
        """
        query = select(Article)

        if status:
            query = query.where(Article.status == status)
        if platform:
            query = query.where(Article.source_platform == platform)
        if qualified_only:
            query = query.where(Article.is_qualified == True)

        # Get total count
        count_query = select(func.count(Article.id))
        if status:
            count_query = count_query.where(Article.status == status)
        if platform:
            count_query = count_query.where(Article.source_platform == platform)
        if qualified_only:
            count_query = count_query.where(Article.is_qualified == True)

        count_result = await self.db.execute(count_query)
        total = count_result.scalar() or 0

        # Get paginated results
        query = query.order_by(Article.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.db.execute(query)
        articles = list(result.scalars().all())

        return articles, total

    async def update_article(
        self,
        article_id: str,
        update_data: ArticleUpdate,
    ) -> Article | None:
        """Update an article."""
        article = await self.get_article(article_id)
        if not article:
            return None

        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(article, key, value)

        article.updated_at = datetime.now()
        await self.db.commit()
        await self.db.refresh(article)
        return article

    async def article_exists_by_url(self, url: str) -> bool:
        """Check if an article with the given URL already exists."""
        result = await self.db.execute(
            select(Article.id).where(Article.original_url == url).limit(1)
        )
        return result.scalar_one_or_none() is not None

    async def is_article_analyzed(self, url: str) -> bool:
        """Check if an article has already been analyzed."""
        result = await self.db.execute(
            select(Article.is_analyzed)
            .where(Article.original_url == url)
            .limit(1)
        )
        is_analyzed = result.scalar_one_or_none()
        return is_analyzed is True

    async def rewrite_article(self, article_id: str) -> RewriteResult:
        """Rewrite an article using AI."""
        article = await self.get_article(article_id)
        if not article:
            return RewriteResult(
                rewritten_content="",
                summary="",
                success=False,
                error="Article not found",
            )

        if not article.original_content:
            return RewriteResult(
                rewritten_content="",
                summary="",
                success=False,
                error="Article has no content to rewrite",
            )

        # Update status to processing
        article.status = ArticleStatus.PROCESSING
        await self.db.commit()

        try:
            result = await self.rewriter.rewrite_article(
                title=article.title,
                content=article.original_content,
                source_platform=article.source_platform.value,
            )

            if result.success:
                article.rewritten_content = result.rewritten_content
                article.summary = result.summary
                article.status = ArticleStatus.COMPLETED
            else:
                article.status = ArticleStatus.FAILED

            article.updated_at = datetime.now()
            await self.db.commit()
            await self.db.refresh(article)

            return result

        except Exception as e:
            article.status = ArticleStatus.FAILED
            await self.db.commit()
            logger.error(f"Failed to rewrite article {article_id}: {e}")
            return RewriteResult(
                rewritten_content="",
                summary="",
                success=False,
                error=str(e),
            )

    async def get_pending_articles(self, limit: int = 10) -> list[Article]:
        """Get articles pending rewriting."""
        result = await self.db.execute(
            select(Article)
            .where(Article.status == ArticleStatus.PENDING)
            .order_by(Article.created_at.asc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_qualified_articles(self, limit: int = 10) -> list[Article]:
        """Get qualified articles waiting for rewriting."""
        result = await self.db.execute(
            select(Article)
            .where(Article.status == ArticleStatus.QUALIFIED)
            .where(Article.is_qualified == True)
            .order_by(Article.analysis_score.desc())  # Higher score first
            .limit(limit)
        )
        return list(result.scalars().all())

