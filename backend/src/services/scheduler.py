"""Scheduler service for periodic tasks."""

import logging
from datetime import datetime
from typing import Callable, Coroutine, Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

logger = logging.getLogger(__name__)


class SchedulerService:
    """Service for managing scheduled tasks."""

    def __init__(self) -> None:
        """Initialize the scheduler."""
        self.scheduler = AsyncIOScheduler()
        self._started = False

    def start(self) -> None:
        """Start the scheduler."""
        if not self._started:
            self.scheduler.start()
            self._started = True
            logger.info("Scheduler started")

    def shutdown(self) -> None:
        """Shutdown the scheduler."""
        if self._started:
            self.scheduler.shutdown()
            self._started = False
            logger.info("Scheduler shutdown")

    def add_job(
        self,
        func: Callable[..., Coroutine[Any, Any, Any]],
        trigger: str,
        job_id: str,
        **trigger_args: Any,
    ) -> None:
        """
        Add a job to the scheduler.
        
        Args:
            func: Async function to run.
            trigger: Trigger type ('interval', 'cron').
            job_id: Unique job identifier.
            **trigger_args: Arguments for the trigger.
        """
        if trigger == "interval":
            trigger_obj = IntervalTrigger(**trigger_args)
        elif trigger == "cron":
            trigger_obj = CronTrigger(**trigger_args)
        else:
            raise ValueError(f"Unknown trigger type: {trigger}")

        self.scheduler.add_job(
            func,
            trigger=trigger_obj,
            id=job_id,
            replace_existing=True,
        )
        logger.info(f"Added job: {job_id} with {trigger} trigger")

    def remove_job(self, job_id: str) -> None:
        """Remove a job from the scheduler."""
        try:
            self.scheduler.remove_job(job_id)
            logger.info(f"Removed job: {job_id}")
        except Exception as e:
            logger.warning(f"Failed to remove job {job_id}: {e}")

    def get_jobs(self) -> list[dict]:
        """Get list of scheduled jobs."""
        return [
            {
                "id": job.id,
                "name": job.name,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
            }
            for job in self.scheduler.get_jobs()
        ]


# Singleton instance
_scheduler: SchedulerService | None = None


def get_scheduler() -> SchedulerService:
    """Get the singleton scheduler instance."""
    global _scheduler
    if _scheduler is None:
        _scheduler = SchedulerService()
    return _scheduler


# ============================================
# Scheduled Tasks
# ============================================

async def sync_articles_job() -> None:
    """
    Scheduled job to sync articles from all platforms.
    
    Uses two-stage pipeline:
    1. Quick filter on title/summary
    2. Deep analysis on full content
    """
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker
    from src.config import settings
    from src.services.article_pipeline import ArticlePipeline
    from src.services.keyword_service import KeywordService
    from src.services.scrapers.manager import ScraperManager

    logger.info("Starting scheduled article sync...")
    start_time = datetime.now()

    # Create database session
    engine = create_async_engine(settings.database_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        try:
            manager = ScraperManager()
            keyword_service = KeywordService(db)

            # Load keywords from database
            hot_topics = await keyword_service.get_active_keywords()
            blocked_keywords = await keyword_service.get_blocked_keywords()

            # Create pipeline
            pipeline = ArticlePipeline(
                db=db,
                hot_topics=hot_topics,
                blocked_keywords=blocked_keywords,
                min_score=50.0,
            )

            # Fetch articles
            articles = await manager.fetch_all_articles(limit_per_platform=10)
            logger.info(f"Fetched {len(articles)} articles from scrapers")

            # Process through two-stage pipeline
            stats = await pipeline.process_articles(
                articles=articles,
                max_qualified=10,
            )

            elapsed = (datetime.now() - start_time).total_seconds()
            logger.info(
                f"Sync completed in {elapsed:.1f}s: "
                f"{stats['stage2_passed']} qualified, "
                f"{stats['stage1_failed'] + stats['stage2_failed']} skipped"
            )

        except Exception as e:
            logger.error(f"Sync job failed: {e}")
        finally:
            await engine.dispose()


async def rewrite_pending_articles_job() -> None:
    """
    Scheduled job to rewrite qualified articles.
    
    This runs periodically to process the queue.
    """
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker
    from src.config import settings
    from src.services.article_service import ArticleService

    logger.info("Starting scheduled rewrite job...")

    engine = create_async_engine(settings.database_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        try:
            service = ArticleService(db)
            
            # Get qualified articles
            articles = await service.get_qualified_articles(limit=5)
            
            for article in articles:
                logger.info(f"Rewriting: {article.title[:50]}...")
                result = await service.rewrite_article(article.id)
                
                if result.success:
                    logger.info(f"Rewrite successful: {article.id}")
                else:
                    logger.error(f"Rewrite failed: {result.error}")

        except Exception as e:
            logger.error(f"Rewrite job failed: {e}")
        finally:
            await engine.dispose()


def setup_scheduled_jobs(scheduler: SchedulerService) -> None:
    """
    Setup all scheduled jobs.
    
    Call this on application startup.
    """
    # Sync articles every hour
    scheduler.add_job(
        sync_articles_job,
        trigger="interval",
        job_id="sync_articles",
        hours=1,
    )

    # Rewrite pending articles every 30 minutes
    scheduler.add_job(
        rewrite_pending_articles_job,
        trigger="interval",
        job_id="rewrite_articles",
        minutes=30,
    )

    logger.info("Scheduled jobs configured")
