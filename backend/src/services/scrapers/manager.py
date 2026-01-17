"""Scraper manager to orchestrate multiple platform scrapers."""

import logging
from typing import Type

from src.services.scrapers.base import BaseScraper, ArticleData
from src.services.scrapers.devto import DevToScraper
from src.services.scrapers.hackernews import HackerNewsScraper
from src.services.scrapers.medium import MediumScraper
from src.services.scrapers.x_scraper import XScraper
from src.services.scrapers.reddit import RedditScraper
from src.services.scrapers.taiwan_news import TaiwanNewsScraper

logger = logging.getLogger(__name__)


class ScraperManager:
    """Manager for orchestrating multiple article scrapers."""

    # Registry of available scrapers
    SCRAPER_REGISTRY: dict[str, Type[BaseScraper]] = {
        "devto": DevToScraper,
        "hackernews": HackerNewsScraper,
        "medium": MediumScraper,
        "x": XScraper,
        "reddit": RedditScraper,
        "taiwan_news": TaiwanNewsScraper,
    }

    def __init__(
        self,
        enabled_platforms: list[str] | None = None,
        scraper_configs: dict[str, dict] | None = None,
    ) -> None:
        """
        Initialize the scraper manager.

        Args:
            enabled_platforms: List of platform names to enable.
                If None, all platforms are enabled.
            scraper_configs: Dictionary of platform-specific configurations.
        """
        self.enabled_platforms = enabled_platforms or list(self.SCRAPER_REGISTRY.keys())
        self.scraper_configs = scraper_configs or {}
        self.scrapers: dict[str, BaseScraper] = {}

        self._initialize_scrapers()

    def _initialize_scrapers(self) -> None:
        """Initialize enabled scrapers with their configurations."""
        for platform in self.enabled_platforms:
            if platform not in self.SCRAPER_REGISTRY:
                logger.warning(f"Unknown platform: {platform}")
                continue

            scraper_class = self.SCRAPER_REGISTRY[platform]
            config = self.scraper_configs.get(platform, {})

            try:
                self.scrapers[platform] = scraper_class(**config)
                logger.info(f"Initialized scraper for platform: {platform}")
            except Exception as e:
                logger.error(f"Failed to initialize scraper for {platform}: {e}")

    async def fetch_all_articles(
        self,
        limit_per_platform: int = 5,
    ) -> list[ArticleData]:
        """
        Fetch articles from all enabled platforms.

        Args:
            limit_per_platform: Maximum articles to fetch per platform.

        Returns:
            List of ArticleData from all platforms.
        """
        all_articles: list[ArticleData] = []

        for platform, scraper in self.scrapers.items():
            try:
                logger.info(f"Fetching articles from {platform}...")
                articles = await scraper.fetch_articles(limit=limit_per_platform)
                all_articles.extend(articles)
                logger.info(f"Fetched {len(articles)} articles from {platform}")
            except Exception as e:
                logger.error(f"Failed to fetch articles from {platform}: {e}")
                continue

        return all_articles

    async def fetch_from_platform(
        self,
        platform: str,
        limit: int = 10,
    ) -> list[ArticleData]:
        """
        Fetch articles from a specific platform.

        Args:
            platform: Platform name.
            limit: Maximum articles to fetch.

        Returns:
            List of ArticleData from the platform.
        """
        scraper = self.scrapers.get(platform)
        if not scraper:
            logger.error(f"Scraper not found for platform: {platform}")
            return []

        try:
            return await scraper.fetch_articles(limit=limit)
        except Exception as e:
            logger.error(f"Failed to fetch articles from {platform}: {e}")
            return []

    def get_enabled_platforms(self) -> list[str]:
        """Get list of enabled platforms."""
        return list(self.scrapers.keys())
