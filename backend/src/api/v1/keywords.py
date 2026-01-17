"""Keyword management API endpoints."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.v1.deps import get_current_user, get_db
from src.models.user import User
from src.models.keyword import Keyword, KeywordCategory
from src.schemas.keyword import (
    KeywordCreate,
    KeywordUpdate,
    KeywordResponse,
    KeywordListResponse,
    KeywordBulkCreate,
    KeywordCategoryInfo,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# Category display names
CATEGORY_DISPLAY_NAMES = {
    KeywordCategory.STARTUP: "創業相關",
    KeywordCategory.BUSINESS: "商業策略與經營",
    KeywordCategory.MARKETING: "行銷概念",
    KeywordCategory.KPI: "KPI 與績效管理",
    KeywordCategory.COST: "成本與效率",
    KeywordCategory.FINANCE: "金融投資",
    KeywordCategory.INDUSTRY: "產業分析",
    KeywordCategory.TECH: "AI 與科技趨勢",
    KeywordCategory.TAIWAN: "台灣相關",
    KeywordCategory.MANAGEMENT: "管理與領導",
    KeywordCategory.ECOMMERCE: "電商與消費",
}


@router.get("", response_model=KeywordListResponse)
async def list_keywords(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    category: str | None = Query(None),
    active_only: bool = Query(True),
) -> KeywordListResponse:
    """
    Get list of keywords.
    
    Requires authentication.
    """
    query = select(Keyword)

    if category:
        query = query.where(Keyword.category == category)
    if active_only:
        query = query.where(Keyword.is_active == True)

    query = query.order_by(Keyword.category, Keyword.keyword)

    result = await db.execute(query)
    keywords = list(result.scalars().all())

    # Get unique categories
    categories = list(set(k.category for k in keywords))

    return KeywordListResponse(
        items=[KeywordResponse.model_validate(k) for k in keywords],
        total=len(keywords),
        categories=sorted(categories),
    )


@router.get("/categories", response_model=list[KeywordCategoryInfo])
async def list_categories(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[KeywordCategoryInfo]:
    """
    Get keyword categories with counts.
    
    Requires authentication.
    """
    result = await db.execute(
        select(
            Keyword.category,
            func.count(Keyword.id),
            func.sum(func.cast(Keyword.is_active, Integer)),
        ).group_by(Keyword.category)
    )

    from sqlalchemy import Integer

    categories = []
    for row in result.all():
        category = row[0]
        categories.append(
            KeywordCategoryInfo(
                category=category,
                display_name=CATEGORY_DISPLAY_NAMES.get(category, category),
                count=row[1],
                active_count=row[2] or 0,
            )
        )

    return categories


@router.post("", response_model=KeywordResponse)
async def create_keyword(
    keyword_data: KeywordCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> KeywordResponse:
    """
    Create a new keyword.
    
    Requires authentication.
    """
    # Check if keyword already exists
    existing = await db.execute(
        select(Keyword).where(
            Keyword.category == keyword_data.category,
            Keyword.keyword == keyword_data.keyword,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="Keyword already exists in this category",
        )

    keyword = Keyword(
        category=keyword_data.category,
        keyword=keyword_data.keyword,
        keyword_zh=keyword_data.keyword_zh,
        description=keyword_data.description,
        is_active=keyword_data.is_active,
        weight=keyword_data.weight,
    )
    db.add(keyword)
    await db.commit()
    await db.refresh(keyword)

    return KeywordResponse.model_validate(keyword)


@router.post("/bulk", response_model=dict)
async def bulk_create_keywords(
    bulk_data: KeywordBulkCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """
    Bulk create keywords.
    
    Requires authentication.
    """
    created = 0
    skipped = 0

    for kw_data in bulk_data.keywords:
        # Check if exists
        existing = await db.execute(
            select(Keyword).where(
                Keyword.category == kw_data.category,
                Keyword.keyword == kw_data.keyword,
            )
        )
        if existing.scalar_one_or_none():
            skipped += 1
            continue

        keyword = Keyword(
            category=kw_data.category,
            keyword=kw_data.keyword,
            keyword_zh=kw_data.keyword_zh,
            description=kw_data.description,
            is_active=kw_data.is_active,
            weight=kw_data.weight,
        )
        db.add(keyword)
        created += 1

    await db.commit()

    return {"created": created, "skipped": skipped}


@router.put("/{keyword_id}", response_model=KeywordResponse)
async def update_keyword(
    keyword_id: str,
    update_data: KeywordUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> KeywordResponse:
    """
    Update a keyword.
    
    Requires authentication.
    """
    result = await db.execute(select(Keyword).where(Keyword.id == keyword_id))
    keyword = result.scalar_one_or_none()

    if not keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")

    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(keyword, key, value)

    await db.commit()
    await db.refresh(keyword)

    return KeywordResponse.model_validate(keyword)


@router.delete("/{keyword_id}")
async def delete_keyword(
    keyword_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """
    Delete a keyword.
    
    Requires authentication.
    """
    result = await db.execute(select(Keyword).where(Keyword.id == keyword_id))
    keyword = result.scalar_one_or_none()

    if not keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")

    await db.delete(keyword)
    await db.commit()

    return {"message": "Keyword deleted"}


@router.post("/{keyword_id}/toggle")
async def toggle_keyword(
    keyword_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> KeywordResponse:
    """
    Toggle keyword active status.
    
    Requires authentication.
    """
    result = await db.execute(select(Keyword).where(Keyword.id == keyword_id))
    keyword = result.scalar_one_or_none()

    if not keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")

    keyword.is_active = not keyword.is_active
    await db.commit()
    await db.refresh(keyword)

    return KeywordResponse.model_validate(keyword)


# Default keywords for seeding
DEFAULT_KEYWORDS = [
    # 創業相關
    ("startup", "startup", "創業"),
    ("startup", "創業", None),
    ("startup", "新創", None),
    ("startup", "募資", None),
    ("startup", "融資", None),
    ("startup", "天使投資", None),
    ("startup", "創投", None),
    ("startup", "VC", None),
    ("startup", "YC", "Y Combinator"),
    ("startup", "accelerator", "加速器"),
    ("startup", "founder", "創辦人"),
    ("startup", "entrepreneur", "創業家"),
    
    # 商業策略
    ("business", "business model", "商業模式"),
    ("business", "營收", None),
    ("business", "獲利", None),
    ("business", "growth", "成長"),
    ("business", "scale", "規模化"),
    ("business", "GTM", "go-to-market"),
    ("business", "PMF", "product-market fit"),
    ("business", "經營策略", None),
    ("business", "競爭優勢", None),
    ("business", "轉型", None),
    ("business", "數位轉型", None),
    
    # 行銷概念
    ("marketing", "marketing", "行銷"),
    ("marketing", "SEO", None),
    ("marketing", "SEM", None),
    ("marketing", "社群行銷", None),
    ("marketing", "growth hacking", "成長駭客"),
    ("marketing", "conversion", "轉換率"),
    ("marketing", "CAC", None),
    ("marketing", "LTV", None),
    ("marketing", "ROAS", None),
    ("marketing", "positioning", "品牌定位"),
    
    # KPI 與績效管理
    ("kpi", "KPI", None),
    ("kpi", "OKR", None),
    ("kpi", "績效", None),
    ("kpi", "metrics", "指標"),
    ("kpi", "ROI", "投資報酬率"),
    ("kpi", "毛利率", None),
    ("kpi", "MRR", None),
    ("kpi", "ARR", None),
    ("kpi", "churn rate", "流失率"),
    ("kpi", "retention", "留存率"),
    ("kpi", "NPS", None),
    
    # 成本與效率
    ("cost", "cost", "成本"),
    ("cost", "成本控制", None),
    ("cost", "efficiency", "效率"),
    ("cost", "productivity", "生產力"),
    ("cost", "automation", "自動化"),
    ("cost", "lean", "精實"),
    ("cost", "burn rate", "燒錢率"),
    ("cost", "cash flow", "現金流"),
    ("cost", "unit economics", "單位經濟"),
    
    # 金融投資
    ("finance", "fintech", "金融科技"),
    ("finance", "投資", None),
    ("finance", "IPO", "上市"),
    ("finance", "M&A", "併購"),
    ("finance", "valuation", "估值"),
    ("finance", "venture capital", None),
    ("finance", "private equity", None),
    
    # 產業分析
    ("industry", "產業分析", None),
    ("industry", "市場分析", None),
    ("industry", "趨勢", "trend"),
    ("industry", "forecast", "預測"),
    ("industry", "TAM", None),
    ("industry", "SAM", None),
    ("industry", "SOM", None),
    
    # AI 與科技
    ("tech", "AI", "人工智慧"),
    ("tech", "ChatGPT", None),
    ("tech", "GPT", None),
    ("tech", "LLM", "大型語言模型"),
    ("tech", "SaaS", None),
    ("tech", "B2B", None),
    ("tech", "cloud", "雲端"),
    
    # 台灣相關
    ("taiwan", "台灣", "Taiwan"),
    ("taiwan", "台積電", "TSMC"),
    ("taiwan", "半導體", "semiconductor"),
    ("taiwan", "鴻海", None),
    ("taiwan", "東南亞", None),
    
    # 管理與領導
    ("management", "leadership", "領導"),
    ("management", "management", "管理"),
    ("management", "團隊", None),
    ("management", "招募", None),
    ("management", "人才", None),
    ("management", "企業文化", None),
    
    # 電商與消費
    ("ecommerce", "ecommerce", "電商"),
    ("ecommerce", "D2C", None),
    ("ecommerce", "retail", "零售"),
    ("ecommerce", "branding", "品牌"),
    ("ecommerce", "supply chain", "供應鏈"),
    
    # 阻擋關鍵字
    ("blocked", "sponsored", "贊助"),
    ("blocked", "advertisement", "廣告"),
    ("blocked", "業配", None),
    ("blocked", "giveaway", None),
    ("blocked", "coupon", "折扣碼"),
    ("blocked", "affiliate", "聯盟行銷"),
    ("blocked", "gaming", "遊戲"),
    ("blocked", "celebrity", "名人"),
    ("blocked", "gossip", "八卦"),
]


@router.post("/seed")
async def seed_keywords(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict:
    """
    Seed database with default keywords.
    
    This is a one-time operation to populate the keywords table
    with the predefined default keywords.
    
    Requires authentication.
    """
    created = 0
    skipped = 0

    for category, keyword, keyword_zh in DEFAULT_KEYWORDS:
        # Check if exists
        existing = await db.execute(
            select(Keyword).where(
                Keyword.category == category,
                Keyword.keyword == keyword,
            )
        )
        if existing.scalar_one_or_none():
            skipped += 1
            continue

        kw = Keyword(
            category=category,
            keyword=keyword,
            keyword_zh=keyword_zh,
            is_active=True,
            weight=1.0,
        )
        db.add(kw)
        created += 1

    await db.commit()

    return {
        "message": f"Seeded {created} keywords, skipped {skipped} existing",
        "created": created,
        "skipped": skipped,
    }

