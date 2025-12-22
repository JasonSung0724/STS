from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from src.config import settings
from src.db.base import Base  # noqa: F401 - re-export for backward compatibility


def create_engine():
    """Create database engine.

    Uses NullPool to let external connection poolers (like Supabase pgbouncer
    or local Supavisor) manage connections efficiently.
    """
    return create_async_engine(
        settings.async_database_url,
        echo=settings.db_echo,
        pool_pre_ping=True,
        poolclass=NullPool,
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
