"""Test script for scrapers - run locally to verify scrapers work."""
import asyncio
import sys
sys.path.insert(0, '.')

from src.services.scrapers import (
    DevToScraper,
    MediumScraper,
    HackerNewsScraper,
    RedditScraper,
    TaiwanNewsScraper,
    ArticleAnalyzer,
)


async def test_single_scraper(name: str, scraper, limit: int = 3):
    """Test a single scraper."""
    print(f"\n{'='*50}")
    print(f"Testing: {name}")
    print('='*50)
    
    try:
        articles = await scraper.fetch_articles(limit=limit)
        print(f"✓ Fetched {len(articles)} articles")
        
        for i, a in enumerate(articles, 1):
            print(f"\n  [{i}] {a.title[:60]}...")
            print(f"      URL: {a.url}")
            print(f"      Author: {a.author or 'N/A'}")
            print(f"      Content: {len(a.content)} chars")
            
        return articles
    except Exception as e:
        print(f"✗ Error: {e}")
        return []


async def test_all_scrapers():
    """Test all scrapers."""
    print("\n" + "="*60)
    print("       SCRAPER TEST SUITE")
    print("="*60)
    
    scrapers = [
        ("Dev.to", DevToScraper()),
        ("Medium RSS", MediumScraper()),
        ("Hacker News", HackerNewsScraper()),
        ("Reddit", RedditScraper()),
        ("Taiwan News", TaiwanNewsScraper()),
    ]
    
    all_articles = []
    
    for name, scraper in scrapers:
        articles = await test_single_scraper(name, scraper, limit=2)
        all_articles.extend(articles)
    
    print("\n" + "="*60)
    print(f"       TOTAL: {len(all_articles)} articles fetched")
    print("="*60)
    
    return all_articles


async def test_with_analyzer():
    """Test scrapers with quality analyzer."""
    print("\n" + "="*60)
    print("       ANALYZER TEST")
    print("="*60)
    
    # Fetch some articles
    scraper = DevToScraper()
    articles = await scraper.fetch_articles(limit=5)
    
    # Create analyzer with test keywords
    analyzer = ArticleAnalyzer(min_score=50)
    analyzer.set_keywords(
        hot_topics=["startup", "創業", "AI", "SaaS", "Python", "JavaScript"],
        blocked_keywords=["sponsored", "廣告", "giveaway"]
    )
    
    print(f"\nAnalyzing {len(articles)} articles...\n")
    
    passed = 0
    for a in articles:
        result = analyzer.analyze(a)
        status = "✓ PASS" if result.should_rewrite else "✗ SKIP"
        print(f"{status} [{result.score:5.1f}] {a.title[:45]}...")
        
        for reason in result.reasons[:2]:
            print(f"         └─ {reason}")
        
        if result.should_rewrite:
            passed += 1
    
    print(f"\n結果: {passed}/{len(articles)} 篇通過品質檢測")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Test scrapers locally")
    parser.add_argument("--all", action="store_true", help="Test all scrapers")
    parser.add_argument("--analyzer", action="store_true", help="Test with analyzer")
    parser.add_argument("--scraper", type=str, help="Test specific scraper (devto, medium, hn, reddit, taiwan)")
    
    args = parser.parse_args()
    
    if args.analyzer:
        asyncio.run(test_with_analyzer())
    elif args.scraper:
        scraper_map = {
            "devto": ("Dev.to", DevToScraper()),
            "medium": ("Medium", MediumScraper()),
            "hn": ("Hacker News", HackerNewsScraper()),
            "reddit": ("Reddit", RedditScraper()),
            "taiwan": ("Taiwan News", TaiwanNewsScraper()),
        }
        if args.scraper in scraper_map:
            name, scraper = scraper_map[args.scraper]
            asyncio.run(test_single_scraper(name, scraper, limit=5))
        else:
            print(f"Unknown scraper: {args.scraper}")
            print(f"Available: {', '.join(scraper_map.keys())}")
    else:
        asyncio.run(test_all_scrapers())
