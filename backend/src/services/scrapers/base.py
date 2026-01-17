"""Base scraper class and common data models."""

from abc import ABC, abstractmethod
from datetime import datetime

from pydantic import BaseModel, HttpUrl


class ArticleData(BaseModel):
    """Data model for scraped article."""

    title: str
    content: str
    url: HttpUrl
    author: str | None = None
    published_at: datetime | None = None
    tags: list[str] = []
    source_platform: str


class BaseScraper(ABC):
    """Abstract base class for article scrapers."""

    platform_name: str = "base"

    def __init__(self) -> None:
        """Initialize the scraper."""
        pass

    @abstractmethod
    async def fetch_articles(self, limit: int = 10) -> list[ArticleData]:
        """
        Fetch articles from the platform.

        Args:
            limit: Maximum number of articles to fetch.

        Returns:
            List of ArticleData objects.
        """
        pass

    @abstractmethod
    async def fetch_article_content(self, url: str) -> str | None:
        """
        Fetch full content of a specific article.

        Args:
            url: URL of the article.

        Returns:
            Article content as string, or None if failed.
        """
        pass
