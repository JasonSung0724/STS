"""AI article rewriter service using existing AI provider infrastructure."""

import json
import logging
from dataclasses import dataclass

from src.config import settings
from src.services.ai_agent.providers import (
    AIMessage,
    AIProvider,
    ProviderType,
    get_provider,
)

logger = logging.getLogger(__name__)


REWRITE_SYSTEM_PROMPT = """你是一位專業的文章編輯和內容創作者。你的任務是將原始文章改寫成更易讀、更有價值的中文內容。

請遵循以下規則：
1. 保持原文的核心觀點和技術內容
2. 使用繁體中文撰寫
3. 改善文章結構，使其更易閱讀
4. 添加適當的標題和段落分隔
5. 確保技術術語的準確性
6. 移除任何廣告或行銷內容
7. 不要添加原文沒有的資訊

回應格式（使用 JSON）：
{
    "summary": "50-100字的文章摘要",
    "rewritten_content": "改寫後的完整文章內容"
}"""

ANALYSIS_SYSTEM_PROMPT = """你是一位專業的文章品質分析師。你的任務是評估一篇文章是否值得改寫和發布。

請根據以下標準評估文章（總分 100 分）：
1. 內容深度 (0-25 分): 是否有實質內容和獨特見解
2. 時效性 (0-20 分): 內容是否仍然相關和最新
3. 可讀性 (0-20 分): 文章結構和表達是否清晰
4. 實用性 (0-20 分): 對讀者是否有實際幫助
5. 原創性 (0-15 分): 是否有獨特觀點而非常見內容

回應格式（使用 JSON）：
{
    "score": 總分 (0-100),
    "should_rewrite": true/false (分數 >= 50 為 true),
    "reasons": ["評估原因1", "評估原因2", ...],
    "content_depth": 分數,
    "timeliness": 分數,
    "readability": 分數,
    "practicality": 分數,
    "originality": 分數
}"""


@dataclass
class RewriteResult:
    """Result of AI article rewriting."""

    rewritten_content: str
    summary: str
    success: bool
    error: str | None = None


@dataclass
class AIAnalysisResult:
    """Result of AI article analysis."""

    score: float
    should_rewrite: bool
    reasons: list[str]
    success: bool
    error: str | None = None


def _get_ai_provider(provider: str | ProviderType | None = None) -> AIProvider:
    """Get AI provider instance."""
    return get_provider(provider or settings.default_ai_provider)


class AIRewriteService:
    """Service for rewriting articles using AI provider infrastructure."""

    def __init__(
        self,
        provider: str | ProviderType | None = None,
        model: str | None = None,
    ) -> None:
        """
        Initialize the AI rewrite service.

        Args:
            provider: AI provider to use (defaults to settings.default_ai_provider)
            model: Specific model to use (defaults to provider's default)
        """
        self.provider = _get_ai_provider(provider)
        self.model = model

    async def rewrite_article(
        self,
        title: str,
        content: str,
        source_platform: str,
    ) -> RewriteResult:
        """
        Rewrite an article using AI.

        Args:
            title: Original article title.
            content: Original article content.
            source_platform: Source platform of the article.

        Returns:
            RewriteResult with rewritten content and summary.
        """
        try:
            # Truncate content if too long
            max_content_length = 15000
            truncated_content = content[:max_content_length]
            if len(content) > max_content_length:
                truncated_content += "\n\n[Content truncated...]"

            user_prompt = f"""請改寫以下來自 {source_platform} 的文章：

標題：{title}

內容：
{truncated_content}"""

            messages = [
                AIMessage(role="system", content=REWRITE_SYSTEM_PROMPT),
                AIMessage(role="user", content=user_prompt),
            ]

            response = await self.provider.chat(
                messages=messages,
                model=self.model,
                temperature=0.7,
                max_tokens=4000,
            )

            if not response.content:
                raise ValueError("Empty response from AI")

            # Parse JSON response
            result_data = json.loads(response.content)

            return RewriteResult(
                rewritten_content=result_data.get("rewritten_content", ""),
                summary=result_data.get("summary", ""),
                success=True,
            )

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response for '{title}': {e}")
            return RewriteResult(
                rewritten_content="",
                summary="",
                success=False,
                error=f"Invalid JSON response: {e}",
            )
        except Exception as e:
            logger.error(f"Failed to rewrite article '{title}': {e}")
            return RewriteResult(
                rewritten_content="",
                summary="",
                success=False,
                error=str(e),
            )

    async def analyze_article(
        self,
        title: str,
        content: str,
        source_platform: str,
    ) -> AIAnalysisResult:
        """
        Analyze an article using AI to determine if it's worth rewriting.

        Args:
            title: Article title.
            content: Article content.
            source_platform: Source platform.

        Returns:
            AIAnalysisResult with score and recommendation.
        """
        try:
            # Use only first part of content for analysis
            preview_content = content[:3000]

            user_prompt = f"""請評估以下來自 {source_platform} 的文章是否值得改寫：

標題：{title}

內容預覽：
{preview_content}"""

            messages = [
                AIMessage(role="system", content=ANALYSIS_SYSTEM_PROMPT),
                AIMessage(role="user", content=user_prompt),
            ]

            response = await self.provider.chat(
                messages=messages,
                model=self.model,
                temperature=0.3,  # Lower temperature for consistent scoring
                max_tokens=500,
            )

            if not response.content:
                raise ValueError("Empty response from AI")

            result_data = json.loads(response.content)

            return AIAnalysisResult(
                score=float(result_data.get("score", 0)),
                should_rewrite=bool(result_data.get("should_rewrite", False)),
                reasons=result_data.get("reasons", []),
                success=True,
            )

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI analysis for '{title}': {e}")
            return AIAnalysisResult(
                score=0,
                should_rewrite=False,
                reasons=[f"分析失敗: {e}"],
                success=False,
                error=str(e),
            )
        except Exception as e:
            logger.error(f"Failed to analyze article '{title}': {e}")
            return AIAnalysisResult(
                score=0,
                should_rewrite=False,
                reasons=[f"分析失敗: {e}"],
                success=False,
                error=str(e),
            )

    async def generate_summary(self, content: str) -> str:
        """
        Generate a summary for an article.

        Args:
            content: Article content.

        Returns:
            Summary string.
        """
        try:
            messages = [
                AIMessage(
                    role="system",
                    content="你是一位專業的文章摘要生成器。請用繁體中文生成50-100字的摘要。只回覆摘要內容，不要加任何其他說明。",
                ),
                AIMessage(
                    role="user",
                    content=f"請為以下內容生成摘要：\n\n{content[:5000]}",
                ),
            ]

            response = await self.provider.chat(
                messages=messages,
                model=self.model,
                temperature=0.5,
                max_tokens=200,
            )

            return response.content or ""

        except Exception as e:
            logger.error(f"Failed to generate summary: {e}")
            return ""
