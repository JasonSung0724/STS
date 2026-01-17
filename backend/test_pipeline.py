"""Test script for the two-stage article pipeline."""
import asyncio
import sys
sys.path.insert(0, '.')

from src.services.scrapers import (
    DevToScraper,
    TaiwanNewsScraper,
)
from src.services.article_pipeline import ArticlePipeline, QuickFilterResult


# Sample keywords for testing
SAMPLE_HOT_TOPICS = [
    "startup", "創業", "ai", "saas", "投資", "融資",
    "scale", "成長", "marketing", "行銷", "kpi",
]
SAMPLE_BLOCKED = [
    "sponsored", "廣告", "giveaway", "coupon",
]


async def test_quick_filter():
    """Test Stage 1 quick filter."""
    print("\n" + "="*60)
    print("       STAGE 1: QUICK FILTER TEST")
    print("="*60)

    # Create pipeline with test keywords
    pipeline = ArticlePipeline(
        db=None,  # type: ignore
        hot_topics=SAMPLE_HOT_TOPICS,
        blocked_keywords=SAMPLE_BLOCKED,
    )

    # Test cases
    from src.services.scrapers.base import ArticleData
    from datetime import datetime

    test_articles = [
        ArticleData(
            title="How to Scale Your SaaS Startup",
            content="Growing a startup requires focus on key metrics...",
            url="https://example.com/1",
            author="Test",
            source_platform="devto",
        ),
        ArticleData(
            title="SPONSORED: Get 50% off our product!",
            content="Limited time coupon code...",
            url="https://example.com/2",
            author="Ad",
            source_platform="medium",
        ),
        ArticleData(
            title="Random unrelated article",
            content="Nothing about business here",
            url="https://example.com/3",
            author="Random",
            source_platform="reddit",
        ),
        ArticleData(
            title="台灣新創公司獲得 AI 投資",
            content="今日宣布完成融資...",
            url="https://example.com/4",
            author="科技報橘",
            source_platform="taiwan_news",
        ),
    ]

    for article in test_articles:
        result = pipeline.quick_filter(article)
        status = "✓ PASS" if result.passed else "✗ FAIL"
        print(f"\n{status} [{result.priority:2d}] {article.title[:45]}...")
        print(f"    └─ {result.reason}")
        if result.matched_keywords:
            print(f"    └─ Matched: {', '.join(result.matched_keywords[:5])}")


async def test_deep_analyze():
    """Test Stage 2 deep analysis."""
    print("\n" + "="*60)
    print("       STAGE 2: DEEP ANALYSIS TEST")
    print("="*60)

    pipeline = ArticlePipeline(
        db=None,  # type: ignore
        hot_topics=SAMPLE_HOT_TOPICS,
        blocked_keywords=SAMPLE_BLOCKED,
    )

    # Fetch real articles for testing
    scraper = DevToScraper()
    articles = await scraper.fetch_articles(limit=3)

    for article in articles:
        # Simulate fetching full content (use article.content as placeholder)
        full_content = article.content

        result = pipeline.deep_analyze(article, full_content)
        status = "✓ PASS" if result.should_rewrite else "✗ FAIL"
        
        print(f"\n{status} [{result.score:5.1f}] {article.title[:45]}...")
        for reason in result.reasons[:4]:
            print(f"    └─ {reason}")


async def test_full_pipeline():
    """Test the complete pipeline flow."""
    print("\n" + "="*60)
    print("       FULL PIPELINE TEST (without DB)")
    print("="*60)

    pipeline = ArticlePipeline(
        db=None,  # type: ignore
        hot_topics=SAMPLE_HOT_TOPICS,
        blocked_keywords=SAMPLE_BLOCKED,
    )

    # Fetch from Dev.to
    scraper = DevToScraper()
    articles = await scraper.fetch_articles(limit=5)

    passed_stage1 = 0
    passed_stage2 = 0

    for article in articles:
        # Stage 1
        filter_result = pipeline.quick_filter(article)
        
        if not filter_result.passed:
            print(f"✗ Stage 1 FAIL: {article.title[:40]}...")
            continue
        
        passed_stage1 += 1

        # Fetch full content (for test, use article.content)
        full_content = article.content
        if not full_content:
            full_content = await pipeline.fetch_full_content(str(article.url))

        # Stage 2
        analysis_result = pipeline.deep_analyze(article, full_content)

        if analysis_result.should_rewrite:
            print(f"✓ QUALIFIED [{analysis_result.score:.0f}]: {article.title[:40]}...")
            passed_stage2 += 1
        else:
            print(f"✗ Stage 2 FAIL [{analysis_result.score:.0f}]: {article.title[:40]}...")

    print(f"\n結果: Stage 1 通過 {passed_stage1}/{len(articles)}, Stage 2 通過 {passed_stage2}/{len(articles)}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Test article pipeline")
    parser.add_argument("--stage1", action="store_true", help="Test Stage 1 quick filter")
    parser.add_argument("--stage2", action="store_true", help="Test Stage 2 deep analysis")
    parser.add_argument("--full", action="store_true", help="Test full pipeline")

    args = parser.parse_args()

    if args.stage1:
        asyncio.run(test_quick_filter())
    elif args.stage2:
        asyncio.run(test_deep_analyze())
    elif args.full:
        asyncio.run(test_full_pipeline())
    else:
        # Run all tests
        asyncio.run(test_quick_filter())
        asyncio.run(test_deep_analyze())
        asyncio.run(test_full_pipeline())
