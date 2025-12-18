"""
STS ChatKit Server Implementation

Integrates OpenAI ChatKit with our AI Agent system.
Reference: https://openai.github.io/chatkit-python/
"""

from typing import Any, AsyncIterator
from functools import lru_cache

from chatkit import ChatKitServer, ThreadStreamEvent
from chatkit.types import (
    AssistantMessage,
    ToolStatusMessage,
    UserMessage,
)
from openai import AsyncOpenAI

from src.config import settings
from src.services.ai_agent.tools import AVAILABLE_TOOLS, execute_tool


# System prompt for STS AI CEO
SYSTEM_PROMPT = """You are an AI CEO assistant for the STS (Smart Total Solution) platform.
Your role is to help business leaders with:

1. **Revenue Growth**: Analyze sales data, identify growth opportunities, and provide strategic recommendations
2. **KPI Management**: Monitor key performance indicators, track progress, and alert on anomalies
3. **Cost Optimization**: Identify cost-saving opportunities and efficiency improvements
4. **Business Intelligence**: Provide insights from data analysis and market trends

Guidelines:
- Be professional, concise, and data-driven in your responses
- When discussing numbers, use specific figures when available
- Provide actionable recommendations
- Ask clarifying questions when needed to give better advice
- Support your insights with data when possible

You have access to tools for analyzing KPIs, financial data, and generating reports.
"""


class STSChatKitServer(ChatKitServer):
    """
    STS-specific ChatKit server implementation.

    This integrates ChatKit's streaming UI framework with our
    AI Agent tools (KPI analyzer, financial parser, data query).
    """

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model

    async def respond(
        self,
        messages: list[UserMessage | AssistantMessage],
        context: dict[str, Any] | None = None,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """
        Handle incoming messages and stream responses.

        Args:
            messages: Conversation history
            context: Additional context (user info, etc.)

        Yields:
            ThreadStreamEvent objects for ChatKit UI
        """
        # Convert messages to OpenAI format
        openai_messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        for msg in messages:
            if isinstance(msg, UserMessage):
                openai_messages.append({"role": "user", "content": msg.content})
            elif isinstance(msg, AssistantMessage):
                openai_messages.append({"role": "assistant", "content": msg.content})

        # Get user from context if available
        user = context.get("user") if context else None

        # Call OpenAI with tools
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=openai_messages,
            tools=AVAILABLE_TOOLS if AVAILABLE_TOOLS else None,
            tool_choice="auto" if AVAILABLE_TOOLS else None,
            stream=True,
        )

        # Track content and tool calls
        full_content = ""
        tool_calls_data: dict[int, dict[str, str]] = {}

        async for chunk in response:
            delta = chunk.choices[0].delta if chunk.choices else None

            if delta is None:
                continue

            # Handle streaming content
            if delta.content:
                full_content += delta.content
                yield AssistantMessage(content=delta.content, partial=True)

            # Handle tool calls
            if delta.tool_calls:
                for tc in delta.tool_calls:
                    idx = tc.index
                    if idx not in tool_calls_data:
                        tool_calls_data[idx] = {
                            "id": tc.id or "",
                            "name": tc.function.name if tc.function else "",
                            "arguments": "",
                        }
                    if tc.function and tc.function.arguments:
                        tool_calls_data[idx]["arguments"] += tc.function.arguments

        # Execute tool calls if any
        if tool_calls_data:
            for idx, tc_data in tool_calls_data.items():
                tool_name = tc_data["name"]
                tool_args = tc_data["arguments"]

                # Emit tool status
                yield ToolStatusMessage(
                    tool_name=tool_name,
                    status="running",
                    message=f"Executing {tool_name}...",
                )

                # Execute the tool
                try:
                    result = await execute_tool(tool_name, tool_args, user=user)

                    yield ToolStatusMessage(
                        tool_name=tool_name,
                        status="completed",
                        message=f"Completed {tool_name}",
                    )

                    # Add tool result to messages and get final response
                    openai_messages.append({
                        "role": "assistant",
                        "content": full_content,
                        "tool_calls": [
                            {
                                "id": tc_data["id"],
                                "type": "function",
                                "function": {
                                    "name": tool_name,
                                    "arguments": tool_args,
                                },
                            }
                        ],
                    })
                    openai_messages.append({
                        "role": "tool",
                        "tool_call_id": tc_data["id"],
                        "content": str(result),
                    })

                except Exception as e:
                    yield ToolStatusMessage(
                        tool_name=tool_name,
                        status="failed",
                        message=f"Error: {str(e)}",
                    )

            # Get final response after tool execution
            final_response = await self.client.chat.completions.create(
                model=self.model,
                messages=openai_messages,
                stream=True,
            )

            async for chunk in final_response:
                delta = chunk.choices[0].delta if chunk.choices else None
                if delta and delta.content:
                    yield AssistantMessage(content=delta.content, partial=True)

        # Signal completion
        yield AssistantMessage(content="", partial=False)


@lru_cache
def get_chatkit_server() -> STSChatKitServer:
    """Get singleton ChatKit server instance."""
    return STSChatKitServer()
