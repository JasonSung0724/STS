from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from src.config import settings


class Base(DeclarativeBase):
    """SQLAlchemy declarative base."""

    pass


def create_engine():
    """Create database engine with environment-specific settings."""
    # Supabase Pooler 需要特殊的連線池設定
    if settings.use_supabase:
        # 使用 NullPool 讓 Supabase Pooler 管理連線
        return create_async_engine(
            settings.database_url,
            echo=settings.db_echo,
            pool_pre_ping=True,
            poolclass=NullPool,  # Supabase 使用 pgbouncer，不需要本地 pool
        )
    else:
        # 本地 PostgreSQL 使用預設連線池
        return create_async_engine(
            settings.database_url,
            echo=settings.db_echo,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
        )


engine = create_engine()

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    """Initialize database tables."""
    async with engine.begin() as conn:
        # Import all models here to register them
        from src.models import user, conversation, analytics  # noqa: F401

        await conn.run_sync(Base.metadata.create_all)
