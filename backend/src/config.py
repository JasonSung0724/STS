from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = "STS"
    app_env: Literal["local", "development", "staging", "production"] = "local"
    debug: bool = True

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # CORS
    cors_origins: list[str] = ["http://localhost:3000"]

    # Database
    database_url: str = "postgresql+asyncpg://sts:sts_password@localhost:5432/sts"
    db_echo: bool = False

    @property
    def async_database_url(self) -> str:
        """Get database URL with asyncpg driver for async operations."""
        url = self.database_url
        # Convert postgresql:// to postgresql+asyncpg:// if needed
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    @property
    def sync_database_url(self) -> str:
        """Get database URL with psycopg2 driver for sync operations (like Alembic)."""
        url = self.database_url
        # Convert postgresql+asyncpg:// to postgresql:// if needed
        if url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql+asyncpg://", "postgresql://", 1)
        return url

    # Supabase Configuration
    use_supabase: bool = False
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    supabase_jwt_secret: str = ""

    # LINE OAuth Configuration
    line_channel_id: str = ""
    line_channel_secret: str = ""
    line_redirect_uri: str = "http://localhost:3000/auth/line/callback"

    # JWT
    jwt_secret: str = "your-super-secret-jwt-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # AI Provider Configuration
    default_ai_provider: str = "openai"  # openai, anthropic, google

    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o"
    openai_embedding_model: str = "text-embedding-3-small"

    # Anthropic (Claude)
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"

    # Google (Gemini)
    google_api_key: str = ""
    google_model: str = "gemini-1.5-pro"

    # Optional services
    redis_url: str | None = None
    rabbitmq_url: str | None = None

    @property
    def is_local(self) -> bool:
        return self.app_env == "local"

    @property
    def is_development(self) -> bool:
        return self.app_env in ("local", "development")

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
