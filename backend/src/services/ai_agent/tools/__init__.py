import json
from typing import Any

from src.models import User
from src.services.ai_agent.tools.kpi_analyzer import kpi_analyzer_tool, analyze_kpis
from src.services.ai_agent.tools.financial_parser import (
    financial_parser_tool,
    parse_financial_data,
)
from src.services.ai_agent.tools.data_query import data_query_tool, query_data

# Define available tools for OpenAI function calling
AVAILABLE_TOOLS = [
    kpi_analyzer_tool,
    financial_parser_tool,
    data_query_tool,
]

TOOL_FUNCTIONS = {
    "analyze_kpis": analyze_kpis,
    "parse_financial_data": parse_financial_data,
    "query_data": query_data,
}


async def execute_tool(
    tool_name: str,
    arguments: str,
    user: User,
) -> Any:
    """Execute a tool by name with given arguments."""
    if tool_name not in TOOL_FUNCTIONS:
        return {"error": f"Unknown tool: {tool_name}"}

    try:
        args = json.loads(arguments)
        result = await TOOL_FUNCTIONS[tool_name](user=user, **args)
        return result
    except json.JSONDecodeError:
        return {"error": "Invalid JSON arguments"}
    except Exception as e:
        return {"error": str(e)}


__all__ = ["AVAILABLE_TOOLS", "execute_tool"]
