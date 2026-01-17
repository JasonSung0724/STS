"""Article analyzer service for quality and popularity assessment."""

import logging
import re
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from src.services.scrapers.base import ArticleData

logger = logging.getLogger(__name__)


@dataclass
class AnalysisResult:
    """Result of article quality analysis."""

    should_rewrite: bool
    score: float  # 0 to 100
    reasons: list[str]


class ArticleAnalyzer:
    """
    Analyze articles for quality and popularity to determine
    if they are worth rewriting (to save AI tokens).
    """

    # Minimum thresholds
    MIN_CONTENT_LENGTH = 500  # characters
    MAX_CONTENT_LENGTH = 50000  # Too long articles may be less focused
    MIN_TITLE_LENGTH = 10
    MAX_TITLE_LENGTH = 200

    # Scoring weights
    WEIGHT_CONTENT_LENGTH = 20
    WEIGHT_TITLE_QUALITY = 15
    WEIGHT_RECENCY = 20
    WEIGHT_TAGS = 10
    WEIGHT_AUTHOR = 5
    WEIGHT_ENGAGEMENT = 30  # If available

    # Threshold to pass
    PASS_THRESHOLD = 50.0

    def __init__(
        self,
        min_score: float = 50.0,
        hot_topics: list[str] | None = None,
        blocked_keywords: list[str] | None = None,
    ) -> None:
        """
        Initialize the analyzer.

        Args:
            min_score: Minimum score (0-100) to recommend rewriting.
            hot_topics: List of hot topic keywords to boost score.
                       If None, should be loaded from database before analysis.
            blocked_keywords: List of keywords to block articles.
                             If None, should be loaded from database before analysis.
        """
        self.min_score = min_score
        # Keywords should be loaded from database
        # Empty list as fallback if not provided
        self.hot_topics = hot_topics or []
        self.blocked_keywords = blocked_keywords or []

    def set_keywords(
        self,
        hot_topics: list[str],
        blocked_keywords: list[str],
    ) -> None:
        """
        Set keywords dynamically (e.g., loaded from database).
        
        Args:
            hot_topics: List of hot topic keywords.
            blocked_keywords: List of blocked keywords.
        """
        self.hot_topics = hot_topics
        self.blocked_keywords = blocked_keywords


    def analyze(
        self,
        article: ArticleData,
        engagement_score: float | None = None,
    ) -> AnalysisResult:
        """
        Analyze an article for quality and popularity.

        Args:
            article: The article data to analyze.
            engagement_score: Optional engagement score (0-100) from platform.

        Returns:
            AnalysisResult with recommendation and reasons.
        """
        score = 0.0
        reasons: list[str] = []

        # Check blocked keywords first
        if self._has_blocked_keywords(article):
            return AnalysisResult(
                should_rewrite=False,
                score=0.0,
                reasons=["文章包含被阻擋的關鍵字 (廣告/行銷內容)"],
            )

        # 1. Content length score
        content_score, content_reason = self._score_content_length(article.content)
        score += content_score
        if content_reason:
            reasons.append(content_reason)

        # 2. Title quality score
        title_score, title_reason = self._score_title(article.title)
        score += title_score
        if title_reason:
            reasons.append(title_reason)

        # 3. Recency score
        recency_score, recency_reason = self._score_recency(article.published_at)
        score += recency_score
        if recency_reason:
            reasons.append(recency_reason)

        # 4. Tags/topics score
        tags_score, tags_reason = self._score_tags(article.tags)
        score += tags_score
        if tags_reason:
            reasons.append(tags_reason)

        # 5. Author presence score
        if article.author:
            score += self.WEIGHT_AUTHOR
            reasons.append(f"有作者資訊: {article.author}")

        # 6. Hot topics bonus
        hot_bonus, hot_reason = self._score_hot_topics(article)
        score += hot_bonus
        if hot_reason:
            reasons.append(hot_reason)

        # 7. Engagement score (if available)
        if engagement_score is not None:
            eng_score = (engagement_score / 100) * self.WEIGHT_ENGAGEMENT
            score += eng_score
            reasons.append(f"互動分數: {engagement_score:.1f}")

        # Normalize score to 0-100
        max_possible = (
            self.WEIGHT_CONTENT_LENGTH +
            self.WEIGHT_TITLE_QUALITY +
            self.WEIGHT_RECENCY +
            self.WEIGHT_TAGS +
            self.WEIGHT_AUTHOR +
            self.WEIGHT_ENGAGEMENT +
            20  # Hot topics bonus max
        )
        normalized_score = min(100, (score / max_possible) * 100)

        should_rewrite = normalized_score >= self.min_score

        return AnalysisResult(
            should_rewrite=should_rewrite,
            score=normalized_score,
            reasons=reasons,
        )

    def _has_blocked_keywords(self, article: ArticleData) -> bool:
        """Check if article contains blocked keywords."""
        text = (article.title + " " + article.content).lower()
        return any(kw.lower() in text for kw in self.blocked_keywords)

    def _score_content_length(self, content: str) -> tuple[float, str | None]:
        """Score based on content length."""
        length = len(content)

        if length < self.MIN_CONTENT_LENGTH:
            return 0, f"內容過短 ({length} 字元)"
        elif length > self.MAX_CONTENT_LENGTH:
            return self.WEIGHT_CONTENT_LENGTH * 0.5, f"內容過長 ({length} 字元)"
        else:
            # Optimal range: 1000-10000
            if 1000 <= length <= 10000:
                return self.WEIGHT_CONTENT_LENGTH, None
            elif 500 <= length < 1000:
                return self.WEIGHT_CONTENT_LENGTH * 0.7, None
            else:
                return self.WEIGHT_CONTENT_LENGTH * 0.8, None

    def _score_title(self, title: str) -> tuple[float, str | None]:
        """Score based on title quality."""
        length = len(title)

        if length < self.MIN_TITLE_LENGTH:
            return 0, f"標題過短 ({length} 字元)"
        elif length > self.MAX_TITLE_LENGTH:
            return self.WEIGHT_TITLE_QUALITY * 0.5, "標題過長"

        # Check for clickbait patterns
        clickbait_patterns = [
            r"you won't believe",
            r"this one trick",
            r"shocking",
            r"mind-blowing",
            r"\d+ things",
            r"top \d+",
        ]
        for pattern in clickbait_patterns:
            if re.search(pattern, title.lower()):
                return self.WEIGHT_TITLE_QUALITY * 0.6, "可能為標題黨"

        return self.WEIGHT_TITLE_QUALITY, None

    def _score_recency(self, published_at: datetime | None) -> tuple[float, str | None]:
        """Score based on article recency."""
        if not published_at:
            return self.WEIGHT_RECENCY * 0.5, "無發布日期"

        now = datetime.now(timezone.utc)
        if published_at.tzinfo is None:
            published_at = published_at.replace(tzinfo=timezone.utc)

        age = now - published_at

        if age < timedelta(days=1):
            return self.WEIGHT_RECENCY, "今日發布"
        elif age < timedelta(days=7):
            return self.WEIGHT_RECENCY * 0.9, "一週內發布"
        elif age < timedelta(days=30):
            return self.WEIGHT_RECENCY * 0.7, "一個月內發布"
        elif age < timedelta(days=90):
            return self.WEIGHT_RECENCY * 0.5, "三個月內發布"
        else:
            return self.WEIGHT_RECENCY * 0.3, "文章較舊"

    def _score_tags(self, tags: list[str]) -> tuple[float, str | None]:
        """Score based on tags presence and relevance."""
        if not tags:
            return 0, "無標籤"

        if len(tags) >= 3:
            return self.WEIGHT_TAGS, f"有 {len(tags)} 個標籤"
        elif len(tags) >= 1:
            return self.WEIGHT_TAGS * 0.7, f"有 {len(tags)} 個標籤"

        return 0, None

    def _score_hot_topics(self, article: ArticleData) -> tuple[float, str | None]:
        """Score bonus for hot topics."""
        text = (article.title + " " + " ".join(article.tags)).lower()
        matches = [t for t in self.hot_topics if t.lower() in text]

        if len(matches) >= 3:
            return 20, f"熱門主題: {', '.join(matches[:3])}"
        elif len(matches) >= 1:
            return 10, f"熱門主題: {', '.join(matches)}"

        return 0, None

    def filter_articles(
        self,
        articles: list[ArticleData],
    ) -> tuple[list[ArticleData], list[tuple[ArticleData, AnalysisResult]]]:
        """
        Filter a list of articles, returning only those worth rewriting.

        Returns:
            Tuple of (passed_articles, rejected_with_reasons)
        """
        passed: list[ArticleData] = []
        rejected: list[tuple[ArticleData, AnalysisResult]] = []

        for article in articles:
            result = self.analyze(article)
            if result.should_rewrite:
                passed.append(article)
            else:
                rejected.append((article, result))

        logger.info(
            f"Article filter: {len(passed)} passed, {len(rejected)} rejected"
        )

        return passed, rejected
