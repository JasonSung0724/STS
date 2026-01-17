"""Keyword service for managing keywords from database."""

import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.keyword import Keyword

logger = logging.getLogger(__name__)


class KeywordService:
    """Service for fetching and managing keywords from database."""

    # Category for blocked keywords
    BLOCKED_CATEGORY = "blocked"

    def __init__(self, db: AsyncSession) -> None:
        """Initialize keyword service with database session."""
        self.db = db

    async def get_active_keywords(self) -> list[str]:
        """
        Get all active hot topic keywords from database.
        
        Returns:
            List of keyword strings.
        """
        result = await self.db.execute(
            select(Keyword.keyword)
            .where(Keyword.is_active == True)
            .where(Keyword.category != self.BLOCKED_CATEGORY)
        )
        keywords = [row[0] for row in result.all()]
        
        # Also include Chinese keywords
        result_zh = await self.db.execute(
            select(Keyword.keyword_zh)
            .where(Keyword.is_active == True)
            .where(Keyword.category != self.BLOCKED_CATEGORY)
            .where(Keyword.keyword_zh.isnot(None))
        )
        keywords.extend([row[0] for row in result_zh.all() if row[0]])
        
        return keywords

    async def get_blocked_keywords(self) -> list[str]:
        """
        Get all blocked keywords from database.
        
        Returns:
            List of blocked keyword strings.
        """
        result = await self.db.execute(
            select(Keyword.keyword)
            .where(Keyword.is_active == True)
            .where(Keyword.category == self.BLOCKED_CATEGORY)
        )
        keywords = [row[0] for row in result.all()]
        
        # Also include Chinese blocked keywords
        result_zh = await self.db.execute(
            select(Keyword.keyword_zh)
            .where(Keyword.is_active == True)
            .where(Keyword.category == self.BLOCKED_CATEGORY)
            .where(Keyword.keyword_zh.isnot(None))
        )
        keywords.extend([row[0] for row in result_zh.all() if row[0]])
        
        return keywords

    async def get_keywords_by_category(self, category: str) -> list[str]:
        """
        Get keywords by category.
        
        Args:
            category: Category name.
            
        Returns:
            List of keyword strings.
        """
        result = await self.db.execute(
            select(Keyword.keyword)
            .where(Keyword.is_active == True)
            .where(Keyword.category == category)
        )
        return [row[0] for row in result.all()]

    async def get_weighted_keywords(self) -> dict[str, float]:
        """
        Get all active keywords with their weights.
        
        Returns:
            Dict mapping keyword to weight.
        """
        result = await self.db.execute(
            select(Keyword.keyword, Keyword.weight)
            .where(Keyword.is_active == True)
            .where(Keyword.category != self.BLOCKED_CATEGORY)
        )
        keywords = {row[0]: row[1] for row in result.all()}
        
        # Also include Chinese keywords with same weight
        result_zh = await self.db.execute(
            select(Keyword.keyword_zh, Keyword.weight)
            .where(Keyword.is_active == True)
            .where(Keyword.category != self.BLOCKED_CATEGORY)
            .where(Keyword.keyword_zh.isnot(None))
        )
        for row in result_zh.all():
            if row[0]:
                keywords[row[0]] = row[1]
        
        return keywords

    async def has_keywords(self) -> bool:
        """Check if any keywords exist in database."""
        result = await self.db.execute(
            select(Keyword.id).limit(1)
        )
        return result.scalar_one_or_none() is not None
