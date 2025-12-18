from typing import Any

from src.config import settings
from src.models import User, KPIRecord, Report
from src.services.ai_agent.providers import (
    AIMessage,
    AIProvider,
    ProviderType,
    get_provider,
)
from src.services.ai_agent.tools import AVAILABLE_TOOLS, execute_tool

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


def _get_ai_provider(provider: str | ProviderType | None = None) -> AIProvider:
    """Get AI provider instance."""
    return get_provider(provider or settings.default_ai_provider)


def _convert_to_ai_messages(
    messages: list[dict[str, str]],
    include_system: bool = True,
) -> list[AIMessage]:
    """Convert dict messages to AIMessage format."""
    result = []

    if include_system:
        result.append(AIMessage(role="system", content=SYSTEM_PROMPT))

    for msg in messages:
        result.append(
            AIMessage(
                role=msg.get("role", "user"),
                content=msg.get("content", ""),
                tool_call_id=msg.get("tool_call_id"),
            )
        )

    return result


async def get_ai_response(
    messages: list[dict[str, str]],
    user: User,
    provider: str | ProviderType | None = None,
    model: str | None = None,
) -> dict[str, Any]:
    """
    Get AI response for chat messages.

    Args:
        messages: Conversation history
        user: Current user
        provider: AI provider to use (defaults to settings.default_ai_provider)
        model: Specific model to use (defaults to provider's default)

    Returns:
        Dict with 'content' and optional 'metadata'
    """
    try:
        ai_provider = _get_ai_provider(provider)
        ai_messages = _convert_to_ai_messages(messages)

        # First call with tools
        response = await ai_provider.chat(
            messages=ai_messages,
            model=model,
            tools=AVAILABLE_TOOLS if AVAILABLE_TOOLS else None,
            tool_choice="auto" if AVAILABLE_TOOLS else None,
            temperature=0.7,
            max_tokens=2000,
        )

        content = response.content
        metadata: dict[str, Any] = {
            "provider": ai_provider.provider_type.value,
            "model": response.model,
            "usage": response.usage,
        }

        # Handle tool calls if any
        if response.tool_calls:
            tool_results = []
            for tool_call in response.tool_calls:
                result = await execute_tool(
                    tool_call.name,
                    tool_call.arguments,
                    user=user,
                )
                tool_results.append({
                    "tool": tool_call.name,
                    "result": result,
                })

            metadata["tool_calls"] = tool_results

            # Build messages with tool results for second call
            tool_messages = ai_messages.copy()
            tool_messages.append(
                AIMessage(
                    role="assistant",
                    content=content,
                    tool_calls=response.tool_calls,
                )
            )

            for tc, tr in zip(response.tool_calls, tool_results):
                tool_messages.append(
                    AIMessage(
                        role="tool",
                        content=str(tr["result"]),
                        tool_call_id=tc.id,
                    )
                )

            # Get final response with tool results
            final_response = await ai_provider.chat(
                messages=tool_messages,
                model=model,
                temperature=0.7,
                max_tokens=2000,
            )
            content = final_response.content

            # Update usage
            if final_response.usage:
                metadata["usage"] = final_response.usage

        return {
            "content": content,
            "metadata": metadata if metadata else None,
        }

    except Exception as e:
        return {
            "content": f"I apologize, but I'm having trouble processing your request. Error: {str(e)}. Please try again later or contact support if the issue persists.",
            "metadata": {"error": str(e)},
        }


async def analyze_query(
    query: str,
    kpis: list[KPIRecord],
    reports: list[Report],
    user: User,
    provider: str | ProviderType | None = None,
    model: str | None = None,
) -> dict[str, Any]:
    """
    Analyze a natural language query about analytics data.

    Args:
        query: User's question
        kpis: Available KPI records
        reports: Available reports
        user: Current user
        provider: AI provider to use
        model: Specific model to use

    Returns:
        Dict with 'answer', 'data', and 'charts'
    """
    try:
        ai_provider = _get_ai_provider(provider)

        # Build context from KPIs and reports
        kpi_context = (
            "\n".join(
                [
                    f"- {kpi.name}: {kpi.value} {kpi.unit} (Previous: {kpi.previous_value}, Category: {kpi.category.value})"
                    for kpi in kpis
                ]
            )
            if kpis
            else "No KPI data available."
        )

        report_context = (
            "\n".join(
                [
                    f"- {report.title}: {report.description or 'No description'}"
                    for report in reports
                ]
            )
            if reports
            else "No reports available."
        )

        analysis_prompt = f"""Analyze the following business query and provide insights.

User Query: {query}

Available KPI Data:
{kpi_context}

Available Reports:
{report_context}

Provide a comprehensive analysis with:
1. Direct answer to the query
2. Supporting data points
3. Actionable recommendations

Format your response as a clear, executive-style briefing."""

        messages = [
            AIMessage(role="system", content=SYSTEM_PROMPT),
            AIMessage(role="user", content=analysis_prompt),
        ]

        response = await ai_provider.chat(
            messages=messages,
            model=model,
            temperature=0.7,
            max_tokens=2000,
        )

        return {
            "answer": response.content,
            "data": {
                "kpi_count": len(kpis),
                "report_count": len(reports),
                "provider": ai_provider.provider_type.value,
                "model": response.model,
            },
            "charts": None,  # TODO: Generate chart configurations based on query
        }

    except Exception as e:
        return {
            "answer": f"Unable to analyze query: {str(e)}",
            "data": None,
            "charts": None,
        }


async def stream_ai_response(
    messages: list[dict[str, str]],
    provider: str | ProviderType | None = None,
    model: str | None = None,
):
    """
    Stream AI response for chat messages.

    Args:
        messages: Conversation history
        provider: AI provider to use
        model: Specific model to use

    Yields:
        Chunks of the response as they arrive
    """
    ai_provider = _get_ai_provider(provider)
    ai_messages = _convert_to_ai_messages(messages)

    async for chunk in ai_provider.stream_chat(
        messages=ai_messages,
        model=model,
        temperature=0.7,
        max_tokens=2000,
    ):
        yield chunk
