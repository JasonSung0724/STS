"""Medium RSS feed scraper."""

import logging
import re
from datetime import datetime
from xml.etree import ElementTree

import httpx

from src.services.scrapers.base import BaseScraper, ArticleData

logger = logging.getLogger(__name__)


class MediumScraper(BaseScraper):
    """Scraper for Medium articles using RSS feeds."""

    platform_name = "medium"

    def __init__(self, feeds: list[str] | None = None) -> None:
        """
        Initialize Medium scraper.

        Args:
            feeds: List of RSS feed URLs to scrape.
        """
        super().__init__()
        # Business, startup, and finance focused feeds
        self.feeds = feeds or [
            "https://medium.com/feed/tag/startup",
            "https://medium.com/feed/tag/entrepreneurship",
            "https://medium.com/feed/tag/business",
            "https://medium.com/feed/tag/venture-capital",
            "https://medium.com/feed/tag/fintech",
            "https://medium.com/feed/tag/leadership",
            "https://medium.com/feed/tag/marketing",
        ]

    async def fetch_articles(self, limit: int = 10) -> list[ArticleData]:
        """Fetch articles from Medium RSS feeds."""
        articles: list[ArticleData] = []

        async with httpx.AsyncClient() as client:
            for feed_url in self.feeds:
                try:
                    response = await client.get(
                        feed_url,
                        timeout=30.0,
                        headers={
                            "User-Agent": "Mozilla/5.0 (compatible; STS-Bot/1.0)"
                        },
                    )
                    response.raise_for_status()

                    # Parse RSS XML
                    root = ElementTree.fromstring(response.text)
                    channel = root.find("channel")
                    if channel is None:
                        continue

                    for item in channel.findall("item"):
                        title_elem = item.find("title")
                        link_elem = item.find("link")
                        creator_elem = item.find("{http://purl.org/dc/elements/1.1/}creator")
                        pubdate_elem = item.find("pubDate")
                        content_elem = item.find("{http://purl.org/rss/1.0/modules/content/}encoded")

                        if title_elem is None or link_elem is None:
                            continue

                        # Parse publication date
                        published_at = None
                        if pubdate_elem is not None and pubdate_elem.text:
                            try:
                                # Format: "Sat, 01 Jan 2025 12:00:00 GMT"
                                published_at = datetime.strptime(
                                    pubdate_elem.text, "%a, %d %b %Y %H:%M:%S %Z"
                                )
                            except ValueError:
                                pass

                        # Extract content (HTML)
                        content = ""
                        if content_elem is not None and content_elem.text:
                            content = content_elem.text

                        # Extract tags from categories
                        tags = []
                        for category in item.findall("category"):
                            if category.text:
                                tags.append(category.text)

                        articles.append(
                            ArticleData(
                                title=title_elem.text or "Untitled",
                                content=self._clean_html(content),
                                url=link_elem.text or "",
                                author=creator_elem.text if creator_elem is not None else None,
                                published_at=published_at,
                                tags=tags,
                                source_platform=self.platform_name,
                            )
                        )

                        if len(articles) >= limit:
                            break

                except httpx.HTTPError as e:
                    logger.error(f"Failed to fetch Medium feed {feed_url}: {e}")
                    continue
                except ElementTree.ParseError as e:
                    logger.error(f"Failed to parse Medium feed {feed_url}: {e}")
                    continue

                if len(articles) >= limit:
                    break

        return articles[:limit]

    async def fetch_article_content(self, url: str) -> str | None:
        """Fetch full article content from Medium."""
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
                return self._clean_html(response.text[:50000])
        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch Medium article {url}: {e}")
            return None

    def _clean_html(self, html: str) -> str:
        """Remove HTML tags and clean up content."""
        # Simple HTML tag removal
        text = re.sub(r"<[^>]+>", " ", html)
        # Clean up whitespace
        text = re.sub(r"\s+", " ", text).strip()
        return text
