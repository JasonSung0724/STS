"""Hacker News API scraper."""

import logging
from datetime import datetime

import httpx

from src.services.scrapers.base import BaseScraper, ArticleData

logger = logging.getLogger(__name__)


class HackerNewsScraper(BaseScraper):
    """Scraper for Hacker News using Firebase API."""

    platform_name = "hackernews"
    BASE_URL = "https://hacker-news.firebaseio.com/v0"

    def __init__(self, story_type: str = "top") -> None:
        """
        Initialize Hacker News scraper.

        Args:
            story_type: Type of stories to fetch ('top', 'best', 'new').
        """
        super().__init__()
        self.story_type = story_type

    async def fetch_articles(self, limit: int = 10) -> list[ArticleData]:
        """Fetch articles from Hacker News API."""
        articles: list[ArticleData] = []

        async with httpx.AsyncClient() as client:
            try:
                # Get story IDs
                response = await client.get(
                    f"{self.BASE_URL}/{self.story_type}stories.json",
                    timeout=30.0,
                )
                response.raise_for_status()
                story_ids = response.json()[:limit]

                # Fetch each story
                for story_id in story_ids:
                    try:
                        story_response = await client.get(
                            f"{self.BASE_URL}/item/{story_id}.json",
                            timeout=30.0,
                        )
                        story_response.raise_for_status()
                        story = story_response.json()

                        if not story or story.get("type") != "story":
                            continue

                        url = story.get("url")
                        if not url:
                            # Self-post (Ask HN, Show HN, etc.)
                            url = f"https://news.ycombinator.com/item?id={story_id}"

                        # For HN, content is often just the title + optional text
                        content = story.get("text", "")
                        if not content and url:
                            # Try to fetch content from the URL
                            fetched_content = await self.fetch_article_content(url)
                            content = fetched_content or story.get("title", "")

                        published_at = None
                        if story.get("time"):
                            published_at = datetime.fromtimestamp(story["time"])

                        articles.append(
                            ArticleData(
                                title=story.get("title", "Untitled"),
                                content=content or story.get("title", ""),
                                url=url,
                                author=story.get("by"),
                                published_at=published_at,
                                tags=["hackernews"],
                                source_platform=self.platform_name,
                            )
                        )
                    except httpx.HTTPError as e:
                        logger.error(f"Failed to fetch HN story {story_id}: {e}")
                        continue

            except httpx.HTTPError as e:
                logger.error(f"Failed to fetch HN story list: {e}")

        return articles

    async def fetch_article_content(self, url: str) -> str | None:
        """
        Fetch article content from external URL.
        
        Note: This is a simplified implementation. For production,
        consider using a proper article extraction library like newspaper3k.
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    timeout=30.0,
                    follow_redirects=True,
                    headers={
                        "User-Agent": "Mozilla/5.0 (compatible; STS-Bot/1.0)"
                    },
                )
                response.raise_for_status()
                # Return raw HTML - will be processed by AI rewriter
                return response.text[:50000]  # Limit content size
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch content from {url}: {e}")
            return None
