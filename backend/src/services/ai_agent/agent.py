from typing import Any

from openai import AsyncOpenAI

from src.config import settings
from src.models import User, KPIRecord, Report
from src.services.ai_agent.tools import AVAILABLE_TOOLS, execute_tool

# Initialize OpenAI client
client = AsyncOpenAI(api_key=settings.openai_api_key)

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


async def get_ai_response(
    messages: list[dict[str, str]],
    user: User,
) -> dict[str, Any]:
    """Get AI response for chat messages."""
    try:
        # Prepare messages with system prompt
        full_messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            *messages,
        ]

        # Call OpenAI API
        response = await client.chat.completions.create(
            model=settings.openai_model,
            messages=full_messages,  # type: ignore
            tools=AVAILABLE_TOOLS if AVAILABLE_TOOLS else None,
            tool_choice="auto" if AVAILABLE_TOOLS else None,
            temperature=0.7,
            max_tokens=2000,
        )

        message = response.choices[0].message
        content = message.content or ""
        metadata: dict[str, Any] = {}

        # Handle tool calls if any
        if message.tool_calls:
            tool_results = []
            for tool_call in message.tool_calls:
                result = await execute_tool(
                    tool_call.function.name,
                    tool_call.function.arguments,
                    user=user,
                )
                tool_results.append({
                    "tool": tool_call.function.name,
                    "result": result,
                })

            metadata["tool_calls"] = tool_results

            # Get final response with tool results
            tool_messages = full_messages + [
                {"role": "assistant", "content": content, "tool_calls": message.tool_calls},  # type: ignore
                *[
                    {
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": str(tr["result"]),
                    }
                    for tc, tr in zip(message.tool_calls, tool_results)
                ],
            ]

            final_response = await client.chat.completions.create(
                model=settings.openai_model,
                messages=tool_messages,  # type: ignore
                temperature=0.7,
                max_tokens=2000,
            )
            content = final_response.choices[0].message.content or ""

        return {
            "content": content,
            "metadata": metadata if metadata else None,
        }

    except Exception as e:
        # Fallback response if OpenAI API fails
        return {
            "content": f"I apologize, but I'm having trouble processing your request. Error: {str(e)}. Please try again later or contact support if the issue persists.",
            "metadata": {"error": str(e)},
        }


async def analyze_query(
    query: str,
    kpis: list[KPIRecord],
    reports: list[Report],
    user: User,
) -> dict[str, Any]:
    """Analyze a natural language query about analytics data."""
    try:
        # Build context from KPIs and reports
        kpi_context = "\n".join([
            f"- {kpi.name}: {kpi.value} {kpi.unit} (Previous: {kpi.previous_value}, Category: {kpi.category.value})"
            for kpi in kpis
        ]) if kpis else "No KPI data available."

        report_context = "\n".join([
            f"- {report.title}: {report.description or 'No description'}"
            for report in reports
        ]) if reports else "No reports available."

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

        response = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": analysis_prompt},
            ],
            temperature=0.7,
            max_tokens=2000,
        )

        content = response.choices[0].message.content or ""

        return {
            "answer": content,
            "data": {
                "kpi_count": len(kpis),
                "report_count": len(reports),
            },
            "charts": None,  # TODO: Generate chart configurations based on query
        }

    except Exception as e:
        return {
            "answer": f"Unable to analyze query: {str(e)}",
            "data": None,
            "charts": None,
        }
