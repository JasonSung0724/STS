"""Article scraper services."""

from src.services.scrapers.base import BaseScraper, ArticleData
from src.services.scrapers.devto import DevToScraper
from src.services.scrapers.hackernews import HackerNewsScraper
from src.services.scrapers.medium import MediumScraper
from src.services.scrapers.x_scraper import XScraper
from src.services.scrapers.reddit import RedditScraper
from src.services.scrapers.taiwan_news import TaiwanNewsScraper
from src.services.scrapers.rewriter import AIRewriteService, RewriteResult, AIAnalysisResult
from src.services.scrapers.manager import ScraperManager
from src.services.scrapers.analyzer import ArticleAnalyzer, AnalysisResult

__all__ = [
    "BaseScraper",
    "ArticleData",
    "DevToScraper",
    "HackerNewsScraper",
    "MediumScraper",
    "XScraper",
    "RedditScraper",
    "TaiwanNewsScraper",
    "AIRewriteService",
    "RewriteResult",
    "AIAnalysisResult",
    "ScraperManager",
    "ArticleAnalyzer",
    "AnalysisResult",
]
