#!/bin/bash
# ========================================
# STS Backend Development Script
# ========================================

set -e

cd "$(dirname "$0")/.."

echo "🐍 STS Backend Development Server"
echo "=================================="

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Check if uv is installed
if command -v uv &> /dev/null; then
    echo "Using uv for package management..."
    uv pip install -e ".[dev]"
else
    echo "Using pip for package management..."
    pip install -e ".[dev]"
fi

# Load environment variables
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

echo ""
echo "Starting FastAPI development server..."
echo "API docs: http://localhost:8000/docs"
echo ""

# Run the development server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
