from typing import Any

from src.models import User

# Tool definition for OpenAI function calling
data_query_tool = {
    "type": "function",
    "function": {
        "name": "query_data",
        "description": "Query business data based on natural language. Supports queries about sales, customers, products, and performance metrics.",
        "parameters": {
            "type": "object",
            "properties": {
                "query_type": {
                    "type": "string",
                    "description": "Type of data to query",
                    "enum": ["sales", "customers", "products", "metrics", "trends"],
                },
                "filters": {
                    "type": "object",
                    "description": "Optional filters for the query",
                    "properties": {
                        "date_from": {"type": "string", "description": "Start date"},
                        "date_to": {"type": "string", "description": "End date"},
                        "region": {"type": "string", "description": "Geographic region"},
                        "product_category": {
                            "type": "string",
                            "description": "Product category",
                        },
                    },
                },
                "aggregation": {
                    "type": "string",
                    "description": "How to aggregate results",
                    "enum": ["sum", "average", "count", "max", "min"],
                },
                "group_by": {
                    "type": "string",
                    "description": "Field to group results by",
                    "enum": ["day", "week", "month", "region", "product", "customer"],
                },
            },
            "required": ["query_type"],
        },
    },
}


async def query_data(
    user: User,
    query_type: str,
    filters: dict[str, Any] | None = None,
    aggregation: str = "sum",
    group_by: str | None = None,
) -> dict[str, Any]:
    """Query business data based on parameters."""
    # TODO: Implement actual database queries
    # This is a placeholder implementation

    mock_data = {
        "sales": {
            "total": 1_250_000,
            "by_region": {
                "North America": 450_000,
                "Europe": 380_000,
                "Asia Pacific": 320_000,
                "Latin America": 100_000,
            },
            "by_product": {
                "Enterprise": 600_000,
                "Professional": 400_000,
                "Starter": 250_000,
            },
            "top_customers": [
                {"name": "Acme Corp", "revenue": 125_000},
                {"name": "Tech Industries", "revenue": 98_000},
                {"name": "Global Services", "revenue": 87_000},
            ],
        },
        "customers": {
            "total": 2543,
            "new_this_month": 156,
            "churned_this_month": 23,
            "by_tier": {
                "Enterprise": 45,
                "Professional": 312,
                "Starter": 2186,
            },
            "average_ltv": 2450,
            "retention_rate": 94.2,
        },
        "products": {
            "total_skus": 48,
            "top_selling": [
                {"name": "Enterprise Suite", "units": 450, "revenue": 600_000},
                {"name": "Professional Plan", "units": 1200, "revenue": 400_000},
                {"name": "Starter Package", "units": 3500, "revenue": 250_000},
            ],
            "inventory_status": {
                "in_stock": 42,
                "low_stock": 4,
                "out_of_stock": 2,
            },
        },
        "metrics": {
            "revenue_growth": 12.5,
            "customer_growth": 8.2,
            "gross_margin": 64.0,
            "operating_margin": 30.0,
            "nps_score": 72,
            "csat_score": 4.5,
        },
        "trends": {
            "revenue_trend": [
                {"month": "Jul", "value": 95000},
                {"month": "Aug", "value": 102000},
                {"month": "Sep", "value": 108000},
                {"month": "Oct", "value": 115000},
                {"month": "Nov", "value": 120000},
                {"month": "Dec", "value": 125430},
            ],
            "customer_trend": [
                {"month": "Jul", "value": 2100},
                {"month": "Aug", "value": 2200},
                {"month": "Sep", "value": 2300},
                {"month": "Oct", "value": 2400},
                {"month": "Nov", "value": 2480},
                {"month": "Dec", "value": 2543},
            ],
        },
    }

    result = mock_data.get(query_type, {})

    return {
        "query_type": query_type,
        "filters": filters,
        "aggregation": aggregation,
        "group_by": group_by,
        "data": result,
        "record_count": len(result) if isinstance(result, list) else 1,
    }
