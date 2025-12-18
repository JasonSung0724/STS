from typing import Any, AsyncIterator

from openai import AsyncOpenAI

from src.config import settings
from src.services.ai_agent.providers.base import (
    AIProvider,
    AIMessage,
    AIResponse,
    ToolCall,
    ProviderType,
)


class OpenAIProvider(AIProvider):
    """OpenAI API provider (GPT-4o, GPT-4, GPT-3.5)."""

    provider_type = ProviderType.OPENAI

    AVAILABLE_MODELS = [
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-4-turbo",
        "gpt-4",
        "gpt-3.5-turbo",
        "o1-preview",
        "o1-mini",
    ]

    def __init__(self, api_key: str | None = None):
        self.client = AsyncOpenAI(api_key=api_key or settings.openai_api_key)
        self.default_model = settings.openai_model

    def _convert_messages(self, messages: list[AIMessage]) -> list[dict[str, Any]]:
        """Convert unified messages to OpenAI format."""
        result = []
        for msg in messages:
            converted: dict[str, Any] = {
                "role": msg.role,
                "content": msg.content,
            }
            if msg.name:
                converted["name"] = msg.name
            if msg.tool_call_id:
                converted["tool_call_id"] = msg.tool_call_id
            if msg.tool_calls:
                converted["tool_calls"] = [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {"name": tc.name, "arguments": tc.arguments},
                    }
                    for tc in msg.tool_calls
                ]
            result.append(converted)
        return result

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
        """Send chat completion request to OpenAI."""
        request_params: dict[str, Any] = {
            "model": model or self.default_model,
            "messages": self._convert_messages(messages),
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        if tools:
            request_params["tools"] = tools
            if tool_choice:
                request_params["tool_choice"] = tool_choice

        request_params.update(kwargs)

        response = await self.client.chat.completions.create(**request_params)

        message = response.choices[0].message
        tool_calls = None

        if message.tool_calls:
            tool_calls = [
                ToolCall(
                    id=tc.id,
                    name=tc.function.name,
                    arguments=tc.function.arguments,
                )
                for tc in message.tool_calls
            ]

        return AIResponse(
            content=message.content or "",
            tool_calls=tool_calls,
            usage={
                "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                "completion_tokens": (
                    response.usage.completion_tokens if response.usage else 0
                ),
                "total_tokens": response.usage.total_tokens if response.usage else 0,
            },
            model=response.model,
            finish_reason=response.choices[0].finish_reason,
        )

    async def stream_chat(
        self,
        messages: list[AIMessage],
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs: Any,
    ) -> AsyncIterator[str]:
        """Stream chat completion response from OpenAI."""
        stream = await self.client.chat.completions.create(
            model=model or self.default_model,
            messages=self._convert_messages(messages),
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
            **kwargs,
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    def get_available_models(self) -> list[str]:
        return self.AVAILABLE_MODELS

    def get_default_model(self) -> str:
        return self.default_model

    def supports_vision(self) -> bool:
        return True  # GPT-4o supports vision
