"""Reddit API scraper."""

import logging
from datetime import datetime

import httpx

from src.services.scrapers.base import BaseScraper, ArticleData

logger = logging.getLogger(__name__)


class RedditScraper(BaseScraper):
    """
    Scraper for Reddit posts using the public JSON API.
    
    Reddit provides a public JSON API that doesn't require authentication
    for read-only access to public subreddits.
    """

    platform_name = "reddit"
    BASE_URL = "https://www.reddit.com"

    def __init__(
        self,
        subreddits: list[str] | None = None,
        sort: str = "hot",
    ) -> None:
        """
        Initialize Reddit scraper.

        Args:
            subreddits: List of subreddit names to scrape.
            sort: Sort method ('hot', 'new', 'top', 'rising').
        """
        super().__init__()
        # Business, startup, and finance focused subreddits
        self.subreddits = subreddits or [
            "startups",
            "Entrepreneur",
            "smallbusiness",
            "venturecapital",
            "fintech",
            "business",
            "SaaS",
            "ecommerce",
        ]
        self.sort = sort

    async def fetch_articles(self, limit: int = 10) -> list[ArticleData]:
        """Fetch posts from Reddit."""
        articles: list[ArticleData] = []

        async with httpx.AsyncClient() as client:
            for subreddit in self.subreddits:
                try:
                    response = await client.get(
                        f"{self.BASE_URL}/r/{subreddit}/{self.sort}.json",
                        params={"limit": min(limit, 25)},
                        timeout=30.0,
                        headers={
                            "User-Agent": "STS-Bot/1.0 (by /u/sts_bot)"
                        },
                    )
                    response.raise_for_status()
                    data = response.json()

                    for post in data.get("data", {}).get("children", []):
                        post_data = post.get("data", {})

                        # Skip stickied posts and non-text content
                        if post_data.get("stickied"):
                            continue

                        # Get content
                        content = post_data.get("selftext", "")
                        if not content:
                            # Link post - use title and URL
                            external_url = post_data.get("url", "")
                            content = f"{post_data.get('title', '')}\n\nLink: {external_url}"

                        published_at = None
                        if post_data.get("created_utc"):
                            published_at = datetime.fromtimestamp(
                                post_data["created_utc"]
                            )

                        permalink = post_data.get("permalink", "")
                        url = f"{self.BASE_URL}{permalink}" if permalink else ""

                        articles.append(
                            ArticleData(
                                title=post_data.get("title", "Untitled"),
                                content=content,
                                url=url,
                                author=post_data.get("author"),
                                published_at=published_at,
                                tags=[subreddit],
                                source_platform=self.platform_name,
                            )
                        )

                        if len(articles) >= limit:
                            break

                except httpx.HTTPError as e:
                    logger.error(
                        f"Failed to fetch Reddit posts from r/{subreddit}: {e}"
                    )
                    continue

                if len(articles) >= limit:
                    break

        return articles[:limit]

    async def fetch_article_content(self, url: str) -> str | None:
        """Fetch full post content from Reddit."""
        try:
            # Convert to JSON URL
            json_url = url.rstrip("/") + ".json"

            async with httpx.AsyncClient() as client:
                response = await client.get(
                    json_url,
                    timeout=30.0,
                    headers={
                        "User-Agent": "STS-Bot/1.0 (by /u/sts_bot)"
                    },
                )
                response.raise_for_status()
                data = response.json()

                # Reddit returns a list of listings
                if data and len(data) > 0:
                    post = data[0].get("data", {}).get("children", [{}])[0]
                    post_data = post.get("data", {})
                    return post_data.get("selftext", "")

        except httpx.HTTPError as e:
            logger.error(f"Failed to fetch Reddit post {url}: {e}")
        except (KeyError, IndexError) as e:
            logger.error(f"Failed to parse Reddit response for {url}: {e}")

        return None
