from typing import Any, AsyncIterator

from src.config import settings
from src.services.ai_agent.providers.base import (
    AIProvider,
    AIMessage,
    AIResponse,
    ToolCall,
    ProviderType,
)


class AnthropicProvider(AIProvider):
    """Anthropic API provider (Claude 3.5, Claude 3)."""

    provider_type = ProviderType.ANTHROPIC

    AVAILABLE_MODELS = [
        "claude-sonnet-4-20250514",
        "claude-opus-4-20250514",
        "claude-3-7-sonnet-20250219",
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
    ]

    def __init__(self, api_key: str | None = None):
        # Lazy import to avoid dependency issues if not installed
        try:
            from anthropic import AsyncAnthropic

            self.client = AsyncAnthropic(api_key=api_key or settings.anthropic_api_key)
        except ImportError:
            raise ImportError(
                "anthropic package not installed. Run: uv add anthropic"
            )
        self.default_model = settings.anthropic_model

    def _convert_messages(
        self, messages: list[AIMessage]
    ) -> tuple[str | None, list[dict[str, Any]]]:
        """
        Convert unified messages to Anthropic format.
        Returns (system_prompt, messages) tuple.
        """
        system_prompt = None
        result = []

        for msg in messages:
            if msg.role == "system":
                system_prompt = msg.content
                continue

            converted: dict[str, Any] = {
                "role": msg.role if msg.role != "tool" else "user",
                "content": msg.content,
            }

            # Handle tool results (Anthropic uses different format)
            if msg.tool_call_id:
                converted["content"] = [
                    {
                        "type": "tool_result",
                        "tool_use_id": msg.tool_call_id,
                        "content": msg.content,
                    }
                ]

            result.append(converted)

        return system_prompt, result

    def _convert_tools(self, tools: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Convert OpenAI-style tools to Anthropic format."""
        anthropic_tools = []
        for tool in tools:
            if tool.get("type") == "function":
                func = tool["function"]
                anthropic_tools.append(
                    {
                        "name": func["name"],
                        "description": func.get("description", ""),
                        "input_schema": func.get("parameters", {}),
                    }
                )
        return anthropic_tools

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
        """Send chat completion request to Anthropic."""
        system_prompt, converted_messages = self._convert_messages(messages)

        request_params: dict[str, Any] = {
            "model": model or self.default_model,
            "messages": converted_messages,
            "max_tokens": max_tokens,
        }

        # Anthropic doesn't support temperature > 1
        if temperature <= 1:
            request_params["temperature"] = temperature

        if system_prompt:
            request_params["system"] = system_prompt

        if tools:
            request_params["tools"] = self._convert_tools(tools)
            if tool_choice:
                if tool_choice == "auto":
                    request_params["tool_choice"] = {"type": "auto"}
                elif tool_choice == "none":
                    request_params["tool_choice"] = {"type": "none"}

        request_params.update(kwargs)

        response = await self.client.messages.create(**request_params)

        # Extract content and tool calls
        content = ""
        tool_calls = []

        for block in response.content:
            if block.type == "text":
                content += block.text
            elif block.type == "tool_use":
                import json

                tool_calls.append(
                    ToolCall(
                        id=block.id,
                        name=block.name,
                        arguments=json.dumps(block.input),
                    )
                )

        return AIResponse(
            content=content,
            tool_calls=tool_calls if tool_calls else None,
            usage={
                "prompt_tokens": response.usage.input_tokens,
                "completion_tokens": response.usage.output_tokens,
                "total_tokens": (
                    response.usage.input_tokens + response.usage.output_tokens
                ),
            },
            model=response.model,
            finish_reason=response.stop_reason,
        )

    async def stream_chat(
        self,
        messages: list[AIMessage],
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs: Any,
    ) -> AsyncIterator[str]:
        """Stream chat completion response from Anthropic."""
        system_prompt, converted_messages = self._convert_messages(messages)

        request_params: dict[str, Any] = {
            "model": model or self.default_model,
            "messages": converted_messages,
            "max_tokens": max_tokens,
        }

        if temperature <= 1:
            request_params["temperature"] = temperature

        if system_prompt:
            request_params["system"] = system_prompt

        request_params.update(kwargs)

        async with self.client.messages.stream(**request_params) as stream:
            async for text in stream.text_stream:
                yield text

    def get_available_models(self) -> list[str]:
        return self.AVAILABLE_MODELS

    def get_default_model(self) -> str:
        return self.default_model

    def supports_vision(self) -> bool:
        return True  # Claude 3 supports vision
