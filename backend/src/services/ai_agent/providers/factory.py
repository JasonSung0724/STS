from typing import Type

from src.config import settings
from src.services.ai_agent.providers.base import AIProvider, ProviderType


# Provider registry - lazy loaded to avoid import errors
_PROVIDER_CLASSES: dict[ProviderType, Type[AIProvider]] = {}


def _register_providers() -> None:
    """Register available providers."""
    global _PROVIDER_CLASSES

    if _PROVIDER_CLASSES:
        return  # Already registered

    # Always register OpenAI (required dependency)
    from src.services.ai_agent.providers.openai_provider import OpenAIProvider

    _PROVIDER_CLASSES[ProviderType.OPENAI] = OpenAIProvider

    # Try to register Anthropic
    try:
        from src.services.ai_agent.providers.anthropic_provider import AnthropicProvider

        _PROVIDER_CLASSES[ProviderType.ANTHROPIC] = AnthropicProvider
    except ImportError:
        pass  # anthropic not installed

    # Try to register Google
    try:
        from src.services.ai_agent.providers.google_provider import GoogleProvider

        _PROVIDER_CLASSES[ProviderType.GOOGLE] = GoogleProvider
    except ImportError:
        pass  # google-generativeai not installed


def get_provider(
    provider_type: ProviderType | str | None = None,
    api_key: str | None = None,
) -> AIProvider:
    """
    Get an AI provider instance.

    Args:
        provider_type: Provider to use (defaults to settings.default_ai_provider)
        api_key: Optional API key override

    Returns:
        AIProvider instance

    Raises:
        ValueError: If provider is not available
    """
    _register_providers()

    # Default to configured provider
    if provider_type is None:
        provider_type = settings.default_ai_provider

    # Convert string to enum
    if isinstance(provider_type, str):
        try:
            provider_type = ProviderType(provider_type.lower())
        except ValueError:
            raise ValueError(
                f"Unknown provider: {provider_type}. "
                f"Available: {[p.value for p in _PROVIDER_CLASSES.keys()]}"
            )

    if provider_type not in _PROVIDER_CLASSES:
        raise ValueError(
            f"Provider {provider_type.value} is not available. "
            f"Make sure the required package is installed."
        )

    provider_class = _PROVIDER_CLASSES[provider_type]
    return provider_class(api_key=api_key)


def get_available_providers() -> list[ProviderType]:
    """Get list of available providers (with installed dependencies)."""
    _register_providers()
    return list(_PROVIDER_CLASSES.keys())


def is_provider_available(provider_type: ProviderType | str) -> bool:
    """Check if a provider is available."""
    _register_providers()

    if isinstance(provider_type, str):
        try:
            provider_type = ProviderType(provider_type.lower())
        except ValueError:
            return False

    return provider_type in _PROVIDER_CLASSES
