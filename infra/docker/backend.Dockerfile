# ===========================================
# STS Backend Dockerfile (Multi-stage)
# ===========================================

# ===========================================
# Base Stage
# ===========================================
FROM python:3.12-slim AS base

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast package management
RUN pip install uv

# ===========================================
# Development Stage
# ===========================================
FROM base AS development

# Copy dependency files
COPY backend/pyproject.toml ./

# Install dependencies (including dev)
RUN uv pip install --system -e ".[dev]"

# Copy application code
COPY backend/ .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Development command with hot reload
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ===========================================
# Production Stage
# ===========================================
FROM base AS production

# Copy dependency files
COPY backend/pyproject.toml ./

# Install production dependencies only
RUN uv pip install --system -e .

# Copy application code
COPY backend/ .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Production command with workers
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
