from contextlib import asynccontextmanager
from typing import AsyncGenerator
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.v1 import router as api_v1_router
from src.config import settings
from src.db.session import init_db

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler."""
    # Startup
    await init_db()
    
    # Start scheduler (only if enabled)
    scheduler = None
    if settings.enable_scheduler:
        from src.services.scheduler import get_scheduler, setup_scheduled_jobs
        scheduler = get_scheduler()
        setup_scheduled_jobs(scheduler)
        scheduler.start()
        logger.info("Scheduler started with scheduled jobs")
    
    yield
    
    # Shutdown
    if scheduler:
        scheduler.shutdown()
        logger.info("Scheduler shutdown")


def create_app() -> FastAPI:
    """Create FastAPI application."""
    app = FastAPI(
        title=settings.app_name,
        description="STS - Smart Total Solution API",
        version="0.1.0",
        docs_url="/docs" if settings.debug else None,
        redoc_url="/redoc" if settings.debug else None,
        lifespan=lifespan,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(api_v1_router, prefix="/api/v1")

    @app.get("/health")
    async def health_check() -> dict[str, str]:
        """Health check endpoint."""
        return {"status": "healthy"}

    @app.get("/scheduler/jobs")
    async def get_scheduler_jobs() -> dict:
        """Get scheduled jobs status."""
        if settings.enable_scheduler:
            from src.services.scheduler import get_scheduler
            scheduler = get_scheduler()
            return {"jobs": scheduler.get_jobs()}
        return {"jobs": [], "scheduler_enabled": False}

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.is_development,
    )

