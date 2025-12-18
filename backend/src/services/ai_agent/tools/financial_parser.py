from typing import Any

from src.models import User

# Tool definition for OpenAI function calling
financial_parser_tool = {
    "type": "function",
    "function": {
        "name": "parse_financial_data",
        "description": "Parse and analyze financial statements or reports. Extracts key metrics and provides financial insights.",
        "parameters": {
            "type": "object",
            "properties": {
                "report_type": {
                    "type": "string",
                    "description": "Type of financial report to analyze",
                    "enum": [
                        "income_statement",
                        "balance_sheet",
                        "cash_flow",
                        "budget_variance",
                    ],
                },
                "period": {
                    "type": "string",
                    "description": "Reporting period (Q1, Q2, Q3, Q4, annual)",
                },
                "year": {
                    "type": "integer",
                    "description": "Fiscal year",
                },
            },
            "required": ["report_type"],
        },
    },
}


async def parse_financial_data(
    user: User,
    report_type: str,
    period: str = "Q4",
    year: int = 2024,
) -> dict[str, Any]:
    """Parse and analyze financial data."""
    # TODO: Implement actual financial data parsing
    # This is a placeholder implementation

    mock_reports = {
        "income_statement": {
            "revenue": {
                "total": 1_250_000,
                "product_sales": 950_000,
                "services": 300_000,
            },
            "expenses": {
                "total": 875_000,
                "cost_of_goods": 450_000,
                "operating": 325_000,
                "marketing": 100_000,
            },
            "net_income": 375_000,
            "gross_margin": 64.0,
            "operating_margin": 30.0,
            "insights": [
                "Gross margin of 64% exceeds industry average of 55%",
                "Operating expenses well controlled at 26% of revenue",
                "Net income up 18% year-over-year",
            ],
        },
        "balance_sheet": {
            "assets": {
                "total": 2_500_000,
                "current": 1_200_000,
                "fixed": 1_300_000,
            },
            "liabilities": {
                "total": 800_000,
                "current": 350_000,
                "long_term": 450_000,
            },
            "equity": 1_700_000,
            "current_ratio": 3.43,
            "debt_to_equity": 0.47,
            "insights": [
                "Strong liquidity with current ratio of 3.43",
                "Conservative debt levels with D/E ratio of 0.47",
                "Healthy asset base supporting growth initiatives",
            ],
        },
        "cash_flow": {
            "operating": 450_000,
            "investing": -200_000,
            "financing": -100_000,
            "net_change": 150_000,
            "beginning_cash": 500_000,
            "ending_cash": 650_000,
            "insights": [
                "Strong operating cash flow of $450K",
                "Investment in growth with $200K capex",
                "Positive net cash position increase",
            ],
        },
        "budget_variance": {
            "revenue": {
                "budget": 1_200_000,
                "actual": 1_250_000,
                "variance": 50_000,
                "variance_pct": 4.2,
            },
            "expenses": {
                "budget": 900_000,
                "actual": 875_000,
                "variance": -25_000,
                "variance_pct": -2.8,
            },
            "net_income": {
                "budget": 300_000,
                "actual": 375_000,
                "variance": 75_000,
                "variance_pct": 25.0,
            },
            "insights": [
                "Revenue exceeded budget by 4.2%",
                "Expenses under budget by 2.8%",
                "Net income 25% above target - excellent performance",
            ],
        },
    }

    return {
        "report_type": report_type,
        "period": period,
        "year": year,
        "data": mock_reports.get(report_type, {}),
        "generated_at": "2024-12-18",
    }
