"""Dev.to API scraper."""

import logging
from datetime import datetime

import httpx

from src.services.scrapers.base import BaseScraper, ArticleData

logger = logging.getLogger(__name__)


class DevToScraper(BaseScraper):
    """Scraper for Dev.to articles using their public API."""

    platform_name = "devto"
    BASE_URL = "https://dev.to/api"

    def __init__(self, tags: list[str] | None = None) -> None:
        """
        Initialize Dev.to scraper.

        Args:
            tags: List of tags to filter articles by.
        """
        super().__init__()
        # Business, startup, and finance focused tags
        self.tags = tags or [
            "startup", "business", "entrepreneurship",
            "productivity", "career", "finance",
            "saas", "marketing", "leadership",
        ]

    async def fetch_articles(self, limit: int = 10) -> list[ArticleData]:
        """Fetch articles from Dev.to API."""
        articles: list[ArticleData] = []

        async with httpx.AsyncClient() as client:
            for tag in self.tags:
                try:
                    response = await client.get(
                        f"{self.BASE_URL}/articles",
                        params={
                            "tag": tag,
                            "per_page": min(limit, 30),
                            "top": 7,  # Top articles from last 7 days
                        },
                        timeout=30.0,
                    )
                    response.raise_for_status()
                    data = response.json()

                    for item in data:
                        # Fetch full content for each article
                        content = await self.fetch_article_content(item["url"])
                        if not content:
                            content = item.get("description", "")

                        published_at = None
                        if item.get("published_at"):
                            try:
                                published_at = datetime.fromisoformat(
                                    item["published_at"].replace("Z", "+00:00")
                                )
                            except ValueError:
                                pass

                        articles.append(
                            ArticleData(
                                title=item["title"],
                                content=content,
                                url=item["url"],
                                author=item.get("user", {}).get("name"),
                                published_at=published_at,
                                tags=item.get("tag_list", []),
                                source_platform=self.platform_name,
                            )
                        )

                        if len(articles) >= limit:
                            break

                except httpx.HTTPError as e:
                    logger.error(f"Failed to fetch Dev.to articles for tag {tag}: {e}")
                    continue

                if len(articles) >= limit:
                    break

        return articles[:limit]

    async def fetch_article_content(self, url: str) -> str | None:
        """Fetch full article content from Dev.to."""
        # Extract article ID from URL and use API
        try:
            async with httpx.AsyncClient() as client:
                # Get article by path
                path = url.replace("https://dev.to/", "")
                response = await client.get(
                    f"{self.BASE_URL}/articles/{path}",
                    timeout=30.0,
                )
                response.raise_for_status()
                data = response.json()
                return data.get("body_markdown") or data.get("body_html", "")
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch article content from {url}: {e}")
            return None
