from typing import Any, AsyncIterator

from src.config import settings
from src.services.ai_agent.providers.base import (
    AIProvider,
    AIMessage,
    AIResponse,
    ToolCall,
    ProviderType,
)


class GoogleProvider(AIProvider):
    """Google Gemini API provider."""

    provider_type = ProviderType.GOOGLE

    AVAILABLE_MODELS = [
        "gemini-2.0-flash-exp",
        "gemini-1.5-pro",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.0-pro",
    ]

    def __init__(self, api_key: str | None = None):
        # Lazy import to avoid dependency issues if not installed
        try:
            import google.generativeai as genai

            self.genai = genai
            genai.configure(api_key=api_key or settings.google_api_key)
        except ImportError:
            raise ImportError(
                "google-generativeai package not installed. Run: uv add google-generativeai"
            )
        self.default_model = settings.google_model

    def _convert_messages(self, messages: list[AIMessage]) -> tuple[str | None, list]:
        """
        Convert unified messages to Gemini format.
        Returns (system_instruction, history) tuple.
        """
        system_instruction = None
        history = []

        for msg in messages:
            if msg.role == "system":
                system_instruction = msg.content
                continue

            role = "user" if msg.role == "user" else "model"
            history.append({"role": role, "parts": [msg.content]})

        return system_instruction, history

    def _convert_tools(self, tools: list[dict[str, Any]]) -> list:
        """Convert OpenAI-style tools to Gemini format."""
        gemini_tools = []
        for tool in tools:
            if tool.get("type") == "function":
                func = tool["function"]
                # Gemini uses a different schema format
                gemini_tools.append(
                    self.genai.protos.Tool(
                        function_declarations=[
                            self.genai.protos.FunctionDeclaration(
                                name=func["name"],
                                description=func.get("description", ""),
                                parameters=self._convert_parameters(
                                    func.get("parameters", {})
                                ),
                            )
                        ]
                    )
                )
        return gemini_tools

    def _convert_parameters(self, params: dict) -> Any:
        """Convert JSON Schema parameters to Gemini format."""
        # Simplified conversion - may need enhancement for complex schemas
        if not params:
            return None

        return self.genai.protos.Schema(
            type=self.genai.protos.Type.OBJECT,
            properties={
                k: self.genai.protos.Schema(
                    type=self._get_gemini_type(v.get("type", "string")),
                    description=v.get("description", ""),
                )
                for k, v in params.get("properties", {}).items()
            },
            required=params.get("required", []),
        )

    def _get_gemini_type(self, json_type: str) -> Any:
        """Map JSON Schema types to Gemini types."""
        type_map = {
            "string": self.genai.protos.Type.STRING,
            "number": self.genai.protos.Type.NUMBER,
            "integer": self.genai.protos.Type.INTEGER,
            "boolean": self.genai.protos.Type.BOOLEAN,
            "array": self.genai.protos.Type.ARRAY,
            "object": self.genai.protos.Type.OBJECT,
        }
        return type_map.get(json_type, self.genai.protos.Type.STRING)

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
        """Send chat completion request to Gemini."""
        system_instruction, history = self._convert_messages(messages)

        generation_config = self.genai.types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        )

        model_instance = self.genai.GenerativeModel(
            model_name=model or self.default_model,
            system_instruction=system_instruction,
            generation_config=generation_config,
        )

        # Get the last user message
        last_message = history[-1]["parts"][0] if history else ""
        chat_history = history[:-1] if len(history) > 1 else []

        chat = model_instance.start_chat(history=chat_history)

        # Handle tools
        gemini_tools = None
        if tools:
            gemini_tools = self._convert_tools(tools)

        response = await chat.send_message_async(
            last_message,
            tools=gemini_tools,
        )

        # Extract tool calls if any
        tool_calls = []
        content = ""

        for part in response.parts:
            if hasattr(part, "text"):
                content += part.text
            elif hasattr(part, "function_call"):
                import json

                fc = part.function_call
                tool_calls.append(
                    ToolCall(
                        id=f"call_{fc.name}",  # Gemini doesn't provide IDs
                        name=fc.name,
                        arguments=json.dumps(dict(fc.args)),
                    )
                )

        return AIResponse(
            content=content,
            tool_calls=tool_calls if tool_calls else None,
            usage={
                "prompt_tokens": response.usage_metadata.prompt_token_count,
                "completion_tokens": response.usage_metadata.candidates_token_count,
                "total_tokens": response.usage_metadata.total_token_count,
            },
            model=model or self.default_model,
            finish_reason=str(response.candidates[0].finish_reason)
            if response.candidates
            else None,
        )

    async def stream_chat(
        self,
        messages: list[AIMessage],
        model: str | None = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        **kwargs: Any,
    ) -> AsyncIterator[str]:
        """Stream chat completion response from Gemini."""
        system_instruction, history = self._convert_messages(messages)

        generation_config = self.genai.types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        )

        model_instance = self.genai.GenerativeModel(
            model_name=model or self.default_model,
            system_instruction=system_instruction,
            generation_config=generation_config,
        )

        last_message = history[-1]["parts"][0] if history else ""
        chat_history = history[:-1] if len(history) > 1 else []

        chat = model_instance.start_chat(history=chat_history)

        response = await chat.send_message_async(last_message, stream=True)

        async for chunk in response:
            if chunk.text:
                yield chunk.text

    def get_available_models(self) -> list[str]:
        return self.AVAILABLE_MODELS

    def get_default_model(self) -> str:
        return self.default_model

    def supports_vision(self) -> bool:
        return True  # Gemini Pro Vision supports images
