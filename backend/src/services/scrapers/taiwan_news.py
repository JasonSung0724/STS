"""Taiwan business news RSS scraper."""

import logging
import re
from datetime import datetime
from xml.etree import ElementTree

import httpx

from src.services.scrapers.base import BaseScraper, ArticleData

logger = logging.getLogger(__name__)


class TaiwanNewsScraper(BaseScraper):
    """
    Scraper for Taiwan business news using RSS feeds.
    
    Sources include:
    - TechOrange 科技報橘 (startup/tech)
    - 創業小聚 Meet Startup
    - 數位時代 Business Next
    - 經濟日報
    - 工商時報
    """

    platform_name = "taiwan_news"

    # Taiwan business/startup news RSS feeds
    DEFAULT_FEEDS = [
        # 科技創業
        ("https://techorange.com/feed/", "TechOrange"),  # Updated from buzzorange
        ("https://rss.bnextmedia.com.tw/feed/meet/rss", "創業小聚"),  # Updated redirect
        # 財經新聞
        ("https://money.udn.com/rssfeed/news/1001/5591", "經濟日報-科技產業"),
        ("https://money.udn.com/rssfeed/news/1001/5592", "經濟日報-金融要聞"),
        ("https://ctee.com.tw/feed", "工商時報"),
        # 國際財經
        ("https://www.cna.com.tw/rss/afe.xml", "中央社-財經"),
    ]

    def __init__(
        self,
        feeds: list[tuple[str, str]] | None = None,
        keywords_filter: list[str] | None = None,
    ) -> None:
        """
        Initialize Taiwan news scraper.

        Args:
            feeds: List of (feed_url, source_name) tuples.
            keywords_filter: Optional keywords to filter articles.
        """
        super().__init__()
        self.feeds = feeds or self.DEFAULT_FEEDS
        # Business-related keywords for filtering
        self.keywords_filter = keywords_filter or [
            "創業", "新創", "募資", "融資", "投資",
            "上市", "IPO", "併購", "收購",
            "營收", "獲利", "財報",
            "科技", "AI", "半導體", "晶片",
            "電商", "金融科技", "數位轉型",
            "台積電", "鴻海", "聯發科",
        ]

    async def fetch_articles(self, limit: int = 10) -> list[ArticleData]:
        """Fetch articles from Taiwan news RSS feeds."""
        articles: list[ArticleData] = []

        async with httpx.AsyncClient() as client:
            for feed_url, source_name in self.feeds:
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
                    
                    # Handle both RSS 2.0 and Atom formats
                    items = root.findall(".//item")
                    if not items:
                        items = root.findall(".//{http://www.w3.org/2005/Atom}entry")

                    for item in items:
                        article = self._parse_item(item, source_name)
                        if article and self._matches_filter(article):
                            articles.append(article)

                        if len(articles) >= limit:
                            break

                except httpx.HTTPError as e:
                    logger.error(f"Failed to fetch Taiwan news from {source_name}: {e}")
                    continue
                except ElementTree.ParseError as e:
                    logger.error(f"Failed to parse feed from {source_name}: {e}")
                    continue

                if len(articles) >= limit:
                    break

        return articles[:limit]

    def _parse_item(self, item: ElementTree.Element, source_name: str) -> ArticleData | None:
        """Parse a single RSS item."""
        # Try RSS 2.0 format first
        title_elem = item.find("title")
        link_elem = item.find("link")
        desc_elem = item.find("description")
        pubdate_elem = item.find("pubDate")
        
        # Fall back to Atom format
        if title_elem is None:
            title_elem = item.find("{http://www.w3.org/2005/Atom}title")
        if link_elem is None:
            link_elem = item.find("{http://www.w3.org/2005/Atom}link")
            if link_elem is not None:
                # Atom links have href attribute
                link_text = link_elem.get("href", "")
            else:
                link_text = None
        else:
            link_text = link_elem.text
        
        if desc_elem is None:
            desc_elem = item.find("{http://www.w3.org/2005/Atom}summary")
        if pubdate_elem is None:
            pubdate_elem = item.find("{http://www.w3.org/2005/Atom}published")

        if title_elem is None or not link_text:
            return None

        # Parse publication date
        published_at = None
        if pubdate_elem is not None and pubdate_elem.text:
            published_at = self._parse_date(pubdate_elem.text)

        # Get content
        content = ""
        if desc_elem is not None and desc_elem.text:
            content = self._clean_html(desc_elem.text)

        # Extract categories/tags
        tags = [source_name]
        for category in item.findall("category"):
            if category.text:
                tags.append(category.text)

        return ArticleData(
            title=title_elem.text or "Untitled",
            content=content,
            url=link_text,
            author=source_name,
            published_at=published_at,
            tags=tags,
            source_platform=self.platform_name,
        )

    def _parse_date(self, date_str: str) -> datetime | None:
        """Parse various date formats from RSS feeds."""
        formats = [
            "%a, %d %b %Y %H:%M:%S %z",  # RFC 822
            "%a, %d %b %Y %H:%M:%S %Z",  # With timezone name
            "%Y-%m-%dT%H:%M:%S%z",       # ISO 8601
            "%Y-%m-%dT%H:%M:%SZ",        # ISO 8601 UTC
        ]
        for fmt in formats:
            try:
                return datetime.strptime(date_str.strip(), fmt)
            except ValueError:
                continue
        return None

    def _matches_filter(self, article: ArticleData) -> bool:
        """Check if article matches keyword filter."""
        if not self.keywords_filter:
            return True
        
        text = (article.title + " " + article.content).lower()
        return any(kw.lower() in text for kw in self.keywords_filter)

    def _clean_html(self, html: str) -> str:
        """Remove HTML tags and clean up content."""
        text = re.sub(r"<[^>]+>", " ", html)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    async def fetch_article_content(self, url: str) -> str | None:
        """Fetch full article content from URL."""
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
            logger.error(f"Failed to fetch Taiwan news article {url}: {e}")
            return None
