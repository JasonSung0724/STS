from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class ProviderType(str, Enum):
    """Supported AI providers."""

    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"


@dataclass
class AIMessage:
    """Unified message format across providers."""

    role: str  # "system", "user", "assistant"
    content: str
    name: str | None = None
    tool_calls: list["ToolCall"] | None = None
    tool_call_id: str | None = None  # For tool responses


@dataclass
class ToolCall:
    """Tool call information."""

    id: str
    name: str
    arguments: str  # JSON string


@dataclass
class AIResponse:
    """Unified response format across providers."""

    content: str
    tool_calls: list[ToolCall] | None = None
    usage: dict[str, int] | None = None  # tokens used
    model: str | None = None
    finish_reason: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


class AIProvider(ABC):
    """Abstract base class for AI providers."""

    provider_type: ProviderType

    @abstractmethod
    async def chat(
        self,
        messages: list[AIMessage],
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        tools: list[dict[str, Any]] | None = None,
        tool_choice: str | None = None,
        **kwargs: Any,
    ) -> AIResponse:
        """
        Send chat completion request.

        Args:
            messages: List of messages in the conversation
            model: Model to use (provider-specific)
            temperature: Sampling temperature
            max_tokens: Maximum tokens in response
            tools: List of tool definitions for function calling
            tool_choice: Tool choice strategy ("auto", "none", or specific tool)
            **kwargs: Provider-specific additional arguments

        Returns:
            AIResponse with the model's response
        """
        pass

    @abstractmethod
    async def stream_chat(
        self,
        messages: list[AIMessage],
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs: Any,
    ):
        """
        Stream chat completion response.

        Yields:
            Chunks of the response as they arrive
        """
        pass

    @abstractmethod
    def get_available_models(self) -> list[str]:
        """Get list of available models for this provider."""
        pass

    @abstractmethod
    def get_default_model(self) -> str:
        """Get the default model for this provider."""
        pass

    def supports_tools(self) -> bool:
        """Check if provider supports tool/function calling."""
        return True

    def supports_vision(self) -> bool:
        """Check if provider supports vision/image inputs."""
        return False

    def supports_streaming(self) -> bool:
        """Check if provider supports streaming responses."""
        return True
