"""Article processing pipeline with multi-stage analysis."""

import logging
import re
from datetime import datetime, timezone
from dataclasses import dataclass, field

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from src.services.scrapers.base import ArticleData
from src.models.article import Article, ArticleStatus

logger = logging.getLogger(__name__)


@dataclass
class QuickFilterResult:
    """Result of Stage 1 quick filter."""
    passed: bool
    reason: str
    priority: int = 0  # Higher = process first
    matched_keywords: list[str] = field(default_factory=list)


@dataclass
class DeepAnalysisResult:
    """Result of Stage 2 deep analysis."""
    score: float  # 0-100
    should_rewrite: bool
    reasons: list[str] = field(default_factory=list)
    keyword_matches: dict[str, int] = field(default_factory=dict)


class ArticlePipeline:
    """
    Two-stage article processing pipeline.
    
    Stage 1 (Quick Filter): Title + summary analysis, no HTTP requests
    Stage 2 (Deep Analysis): Full content analysis after fetching
    """

    # Default minimum score to pass deep analysis
    MIN_SCORE = 50.0
    
    # Content fetch settings
    MAX_CONTENT_LENGTH = 100000  # 100KB
    FETCH_TIMEOUT = 30.0

    def __init__(
        self,
        db: AsyncSession,
        hot_topics: list[str] | None = None,
        blocked_keywords: list[str] | None = None,
        min_score: float = 50.0,
    ) -> None:
        """
        Initialize the pipeline.
        
        Args:
            db: Database session.
            hot_topics: Keywords that boost article priority.
            blocked_keywords: Keywords that cause immediate rejection.
            min_score: Minimum score for deep analysis to pass.
        """
        self.db = db
        self.hot_topics = [kw.lower() for kw in (hot_topics or [])]
        self.blocked_keywords = [kw.lower() for kw in (blocked_keywords or [])]
        self.min_score = min_score

    def set_keywords(
        self,
        hot_topics: list[str],
        blocked_keywords: list[str],
    ) -> None:
        """Set keywords dynamically (e.g., from database)."""
        self.hot_topics = [kw.lower() for kw in hot_topics]
        self.blocked_keywords = [kw.lower() for kw in blocked_keywords]

    # =========================================================================
    # Stage 1: Quick Filter
    # =========================================================================

    def quick_filter(self, article: ArticleData) -> QuickFilterResult:
        """
        Stage 1: Quick filter based on title and available metadata.
        
        This is a fast check that doesn't require fetching full content.
        
        Returns:
            QuickFilterResult with passed status and priority.
        """
        title_lower = article.title.lower()
        summary_lower = (article.content[:500] if article.content else "").lower()
        text = title_lower + " " + summary_lower

        # Check blocked keywords first
        for blocked in self.blocked_keywords:
            if blocked in text:
                return QuickFilterResult(
                    passed=False,
                    reason=f"Blocked keyword: {blocked}",
                )

        # Check for clickbait patterns
        clickbait_patterns = [
            r"you won't believe",
            r"shocking",
            r"\d+ things",
            r"\?{3,}",
            r"!{3,}",
        ]
        for pattern in clickbait_patterns:
            if re.search(pattern, title_lower):
                return QuickFilterResult(
                    passed=False,
                    reason=f"Clickbait pattern detected",
                )

        # Count hot topic matches
        matched = []
        priority = 0
        for topic in self.hot_topics:
            if topic in text:
                matched.append(topic)
                # Title matches are worth more
                if topic in title_lower:
                    priority += 3
                else:
                    priority += 1

        # Require at least one hot topic match for relevance
        if not matched and self.hot_topics:
            return QuickFilterResult(
                passed=False,
                reason="No relevant keywords found",
            )

        return QuickFilterResult(
            passed=True,
            reason=f"Matched {len(matched)} keywords",
            priority=priority,
            matched_keywords=matched,
        )

    # =========================================================================
    # Content Fetching
    # =========================================================================

    async def fetch_full_content(self, url: str) -> str | None:
        """
        Fetch full article content from URL.
        
        Returns:
            Cleaned text content or None if failed.
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    timeout=self.FETCH_TIMEOUT,
                    follow_redirects=True,
                    headers={
                        "User-Agent": "Mozilla/5.0 (compatible; STS-Bot/1.0; +https://sts.app)",
                        "Accept": "text/html,application/xhtml+xml",
                    },
                )
                response.raise_for_status()
                
                # Get content, limit size
                html = response.text[:self.MAX_CONTENT_LENGTH]
                return self._clean_html(html)
                
        except httpx.HTTPError as e:
            logger.warning(f"Failed to fetch content from {url}: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching {url}: {e}")
            return None

    def _clean_html(self, html: str) -> str:
        """Remove HTML tags and clean up content."""
        # Remove script and style blocks
        html = re.sub(r"<script[^>]*>.*?</script>", " ", html, flags=re.DOTALL | re.IGNORECASE)
        html = re.sub(r"<style[^>]*>.*?</style>", " ", html, flags=re.DOTALL | re.IGNORECASE)
        # Remove HTML tags
        text = re.sub(r"<[^>]+>", " ", html)
        # Clean up whitespace
        text = re.sub(r"\s+", " ", text).strip()
        # Decode common HTML entities
        text = text.replace("&nbsp;", " ")
        text = text.replace("&amp;", "&")
        text = text.replace("&lt;", "<")
        text = text.replace("&gt;", ">")
        text = text.replace("&quot;", '"')
        return text

    # =========================================================================
    # Stage 2: Deep Analysis
    # =========================================================================

    def deep_analyze(
        self,
        article: ArticleData,
        full_content: str | None,
    ) -> DeepAnalysisResult:
        """
        Stage 2: Deep analysis with full content.
        
        Scoring breakdown (0-100):
        - Content length: 25 points
        - Keyword density: 30 points
        - Title quality: 15 points
        - Freshness: 10 points
        - Structure quality: 20 points
        
        Returns:
            DeepAnalysisResult with score and decision.
        """
        reasons: list[str] = []
        score = 0.0
        keyword_matches: dict[str, int] = {}

        # Use full content if available, otherwise fall back to article.content
        content = full_content or article.content or ""
        content_lower = content.lower()
        title_lower = article.title.lower()

        # 1. Content Length (25 points)
        content_len = len(content)
        if content_len < 500:
            length_score = 0
            reasons.append(f"Content too short ({content_len} chars)")
        elif content_len < 1000:
            length_score = 10
            reasons.append(f"Content short ({content_len} chars)")
        elif content_len <= 8000:
            length_score = 25
            reasons.append(f"Good content length ({content_len} chars)")
        elif content_len <= 15000:
            length_score = 20
            reasons.append(f"Long content ({content_len} chars)")
        else:
            length_score = 15
            reasons.append(f"Very long content ({content_len} chars)")
        score += length_score

        # 2. Keyword Density (30 points)
        total_matches = 0
        for topic in self.hot_topics:
            count = content_lower.count(topic)
            if count > 0:
                keyword_matches[topic] = count
                total_matches += count

        if total_matches == 0:
            keyword_score = 0
            reasons.append("No hot topic keywords found")
        elif total_matches <= 3:
            keyword_score = 10
            reasons.append(f"Few keyword matches ({total_matches})")
        elif total_matches <= 10:
            keyword_score = 20
            reasons.append(f"Good keyword matches ({total_matches})")
        else:
            keyword_score = 30
            reasons.append(f"Excellent keyword matches ({total_matches})")
        score += keyword_score

        # 3. Title Quality (15 points)
        title_len = len(article.title)
        if 20 <= title_len <= 100:
            title_score = 15
        elif 10 <= title_len <= 150:
            title_score = 10
        else:
            title_score = 5
            reasons.append("Title length not optimal")
        
        # Bonus for title containing hot topics
        title_topic_matches = sum(1 for t in self.hot_topics if t in title_lower)
        if title_topic_matches > 0:
            title_score = min(15, title_score + 5)
            reasons.append(f"Title contains {title_topic_matches} keywords")
        score += title_score

        # 4. Freshness (10 points)
        freshness_score = 5  # Default
        if article.published_at:
            age_hours = (datetime.now(timezone.utc) - article.published_at).total_seconds() / 3600
            if age_hours <= 24:
                freshness_score = 10
                reasons.append("Published in last 24h")
            elif age_hours <= 72:
                freshness_score = 8
            elif age_hours <= 168:  # 1 week
                freshness_score = 5
            else:
                freshness_score = 2
                reasons.append("Older article")
        score += freshness_score

        # 5. Structure Quality (20 points)
        structure_score = 0
        # Check for paragraphs
        paragraph_count = content.count("\n\n") + content.count("。\n")
        if paragraph_count >= 5:
            structure_score += 5
        
        # Check for code blocks (technical content)
        if "```" in content or "<code>" in content.lower():
            structure_score += 5
            reasons.append("Contains code examples")
        
        # Check for lists
        if re.search(r"^\s*[-*•]\s", content, re.MULTILINE):
            structure_score += 5
        
        # Check for numbers/data
        if re.search(r"\d+%|\$\d+|NT\$|億|萬", content):
            structure_score += 5
            reasons.append("Contains data/numbers")
        
        score += min(20, structure_score)

        # Final decision
        should_rewrite = score >= self.min_score

        if should_rewrite:
            reasons.insert(0, f"✓ Passed with score {score:.0f}")
        else:
            reasons.insert(0, f"✗ Failed with score {score:.0f} (min: {self.min_score})")

        return DeepAnalysisResult(
            score=score,
            should_rewrite=should_rewrite,
            reasons=reasons,
            keyword_matches=keyword_matches,
        )

    # =========================================================================
    # Database Operations
    # =========================================================================

    async def save_qualified_article(
        self,
        article_data: ArticleData,
        full_content: str,
        score: float,
    ) -> Article:
        """Save a qualified article to database."""
        from uuid import uuid4
        from src.models.article import SourcePlatform

        # Map platform name to enum
        platform_map = {
            "devto": SourcePlatform.DEVTO,
            "medium": SourcePlatform.MEDIUM,
            "hackernews": SourcePlatform.HACKERNEWS,
            "x": SourcePlatform.X,
            "reddit": SourcePlatform.REDDIT,
            "taiwan_news": SourcePlatform.TAIWAN_NEWS,
        }
        platform = platform_map.get(
            article_data.source_platform,
            SourcePlatform.CUSTOM,
        )

        article = Article(
            id=str(uuid4()),
            title=article_data.title,
            original_url=str(article_data.url),
            source_platform=platform,
            author=article_data.author,
            original_content=full_content,  # Use fetched full content
            tags=article_data.tags,
            published_at=article_data.published_at,
            status=ArticleStatus.PENDING,
            is_analyzed=True,
            is_qualified=True,
            analysis_score=score,
        )
        
        self.db.add(article)
        await self.db.commit()
        await self.db.refresh(article)
        
        logger.info(f"Saved qualified article: {article.title[:50]}... (score: {score:.0f})")
        return article

    async def save_skipped_article(
        self,
        article_data: ArticleData,
        reason: str,
        score: float = 0.0,
    ) -> Article:
        """Save a skipped article with minimal data."""
        from uuid import uuid4
        from src.models.article import SourcePlatform

        platform_map = {
            "devto": SourcePlatform.DEVTO,
            "medium": SourcePlatform.MEDIUM,
            "hackernews": SourcePlatform.HACKERNEWS,
            "x": SourcePlatform.X,
            "reddit": SourcePlatform.REDDIT,
            "taiwan_news": SourcePlatform.TAIWAN_NEWS,
        }
        platform = platform_map.get(
            article_data.source_platform,
            SourcePlatform.CUSTOM,
        )

        article = Article(
            id=str(uuid4()),
            title=article_data.title,
            original_url=str(article_data.url),
            source_platform=platform,
            author=article_data.author,
            original_content="",  # Don't store content for skipped
            status=ArticleStatus.SKIPPED,
            is_analyzed=True,
            is_qualified=False,
            analysis_score=score,
            skip_reason=reason[:500],
        )
        
        self.db.add(article)
        await self.db.commit()
        
        logger.debug(f"Skipped article: {article.title[:50]}... ({reason})")
        return article

    async def is_article_processed(self, url: str) -> bool:
        """Check if article URL has already been processed."""
        from sqlalchemy import select
        
        result = await self.db.execute(
            select(Article.id).where(Article.original_url == url).limit(1)
        )
        return result.scalar_one_or_none() is not None

    # =========================================================================
    # Main Processing Flow
    # =========================================================================

    async def process_articles(
        self,
        articles: list[ArticleData],
        max_qualified: int = 10,
    ) -> dict:
        """
        Process a batch of articles through the two-stage pipeline.
        
        Args:
            articles: List of ArticleData from scrapers.
            max_qualified: Maximum qualified articles to process.
            
        Returns:
            Statistics dict with counts.
        """
        stats = {
            "total": len(articles),
            "already_processed": 0,
            "stage1_passed": 0,
            "stage1_failed": 0,
            "stage2_passed": 0,
            "stage2_failed": 0,
            "fetch_failed": 0,
        }

        # Stage 1: Quick filter all articles
        candidates: list[tuple[ArticleData, QuickFilterResult]] = []
        
        for article in articles:
            # Skip already processed
            if await self.is_article_processed(str(article.url)):
                stats["already_processed"] += 1
                continue

            result = self.quick_filter(article)
            
            if result.passed:
                candidates.append((article, result))
                stats["stage1_passed"] += 1
            else:
                # Save as skipped immediately
                await self.save_skipped_article(article, result.reason)
                stats["stage1_failed"] += 1

        # Sort by priority (higher first)
        candidates.sort(key=lambda x: x[1].priority, reverse=True)

        # Stage 2: Deep analysis on top candidates
        qualified_count = 0
        
        for article, filter_result in candidates:
            if qualified_count >= max_qualified:
                break

            # Fetch full content
            full_content = await self.fetch_full_content(str(article.url))
            
            if not full_content:
                stats["fetch_failed"] += 1
                await self.save_skipped_article(article, "Failed to fetch content")
                continue

            # Deep analysis
            result = self.deep_analyze(article, full_content)

            if result.should_rewrite:
                await self.save_qualified_article(article, full_content, result.score)
                stats["stage2_passed"] += 1
                qualified_count += 1
            else:
                reason = "; ".join(result.reasons[:2])
                await self.save_skipped_article(article, reason, result.score)
                stats["stage2_failed"] += 1

        logger.info(
            f"Pipeline complete: {stats['stage2_passed']} qualified, "
            f"{stats['stage1_failed'] + stats['stage2_failed']} skipped"
        )
        
        return stats
