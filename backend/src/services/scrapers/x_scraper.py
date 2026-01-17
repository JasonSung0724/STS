"""X (Twitter) API scraper."""

import logging
from datetime import datetime

import httpx

from src.services.scrapers.base import BaseScraper, ArticleData
from src.config import settings

logger = logging.getLogger(__name__)


class XScraper(BaseScraper):
    """
    Scraper for X (Twitter) posts.
    
    Note: X API v2 requires authentication. This implementation uses
    the public RSS bridge approach as a fallback, or can be configured
    with bearer token for official API access.
    """

    platform_name = "x"
    BASE_URL = "https://api.twitter.com/2"

    def __init__(
        self,
        bearer_token: str | None = None,
        usernames: list[str] | None = None,
        search_queries: list[str] | None = None,
    ) -> None:
        """
        Initialize X scraper.

        Args:
            bearer_token: X API bearer token for authentication.
            usernames: List of usernames to fetch tweets from.
            search_queries: List of search queries to find tweets.
        """
        super().__init__()
        self.bearer_token = bearer_token or getattr(settings, "x_bearer_token", None)
        self.usernames = usernames or ["elikiyi", "JasonWeinberg"]
        self.search_queries = search_queries or ["#programming", "#AI"]

    async def fetch_articles(self, limit: int = 10) -> list[ArticleData]:
        """Fetch posts from X (Twitter)."""
        articles: list[ArticleData] = []

        if not self.bearer_token:
            logger.warning(
                "X API bearer token not configured. "
                "Set X_BEARER_TOKEN in environment variables."
            )
            return articles

        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {self.bearer_token}",
                "User-Agent": "STS-Bot/1.0",
            }

            # Search for tweets
            for query in self.search_queries:
                try:
                    response = await client.get(
                        f"{self.BASE_URL}/tweets/search/recent",
                        params={
                            "query": f"{query} -is:retweet lang:en",
                            "max_results": min(limit, 100),
                            "tweet.fields": "created_at,author_id,text",
                            "expansions": "author_id",
                            "user.fields": "name,username",
                        },
                        headers=headers,
                        timeout=30.0,
                    )
                    response.raise_for_status()
                    data = response.json()

                    # Build user lookup
                    users = {}
                    for user in data.get("includes", {}).get("users", []):
                        users[user["id"]] = user

                    for tweet in data.get("data", []):
                        author = users.get(tweet.get("author_id"), {})
                        published_at = None
                        if tweet.get("created_at"):
                            try:
                                published_at = datetime.fromisoformat(
                                    tweet["created_at"].replace("Z", "+00:00")
                                )
                            except ValueError:
                                pass

                        articles.append(
                            ArticleData(
                                title=tweet["text"][:100] + "..."
                                if len(tweet["text"]) > 100
                                else tweet["text"],
                                content=tweet["text"],
                                url=f"https://twitter.com/{author.get('username', 'user')}/status/{tweet['id']}",
                                author=author.get("name"),
                                published_at=published_at,
                                tags=[query.replace("#", "")],
                                source_platform=self.platform_name,
                            )
                        )

                        if len(articles) >= limit:
                            break

                except httpx.HTTPError as e:
                    logger.error(f"Failed to fetch X posts for query {query}: {e}")
                    continue

                if len(articles) >= limit:
                    break

        return articles[:limit]

    async def fetch_article_content(self, url: str) -> str | None:
        """
        Fetch tweet content from URL.
        
        Since tweets are short-form, we return None and rely on
        the initial fetch for content.
        """
        return None
