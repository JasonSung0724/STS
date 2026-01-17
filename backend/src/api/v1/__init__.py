from fastapi import APIRouter

from src.api.v1.auth import router as auth_router
from src.api.v1.chat import router as chat_router
from src.api.v1.chatkit import router as chatkit_router
from src.api.v1.analytics import router as analytics_router
from src.api.v1.users import router as users_router
from src.api.v1.oauth import router as oauth_router
from src.api.v1.articles import router as articles_router
from src.api.v1.admin import router as admin_router
from src.api.v1.keywords import router as keywords_router

router = APIRouter()

router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
router.include_router(oauth_router, prefix="/oauth", tags=["OAuth"])
router.include_router(chat_router, prefix="/chat", tags=["Chat"])
router.include_router(chatkit_router, prefix="/chatkit", tags=["ChatKit"])
router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
router.include_router(users_router, prefix="/users", tags=["Users"])
router.include_router(articles_router, prefix="/articles", tags=["Articles"])
router.include_router(admin_router, prefix="/admin", tags=["Admin"])
router.include_router(keywords_router, prefix="/keywords", tags=["Keywords"])

__all__ = ["router"]

