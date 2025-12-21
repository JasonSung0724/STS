#!/bin/bash
# ========================================
# STS Local Development Setup Script
# ========================================

set -e

echo "🚀 STS Local Development Setup"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 is installed"
        return 0
    else
        echo -e "${RED}✗${NC} $1 is not installed"
        return 1
    fi
}

echo ""
echo "Checking prerequisites..."
echo "-------------------------"

MISSING_DEPS=0

check_command "node" || MISSING_DEPS=1
check_command "npm" || MISSING_DEPS=1
check_command "python3" || MISSING_DEPS=1
check_command "docker" || MISSING_DEPS=1
check_command "docker-compose" || MISSING_DEPS=1

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 20 ]; then
        echo -e "${GREEN}✓${NC} Node.js version >= 20"
    else
        echo -e "${RED}✗${NC} Node.js version must be >= 20 (current: $(node -v))"
        MISSING_DEPS=1
    fi
fi

# Check Python version
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 -c 'import sys; print(sys.version_info.minor)')
    if [ "$PYTHON_VERSION" -ge 12 ]; then
        echo -e "${GREEN}✓${NC} Python version >= 3.12"
    else
        echo -e "${YELLOW}!${NC} Python 3.12+ recommended (current: $(python3 --version))"
    fi
fi

if [ $MISSING_DEPS -eq 1 ]; then
    echo ""
    echo -e "${RED}Please install missing dependencies before continuing.${NC}"
    exit 1
fi

echo ""
echo "Setting up environment..."
echo "-------------------------"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Created .env file from .env.example"
    echo -e "${YELLOW}!${NC} Please edit .env and add your OPENAI_API_KEY"
else
    echo -e "${GREEN}✓${NC} .env file already exists"
fi

echo ""
echo "Starting PostgreSQL with Docker..."
echo "-----------------------------------"

# Start only PostgreSQL
docker-compose up -d postgres
echo -e "${GREEN}✓${NC} PostgreSQL is starting..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 5

echo ""
echo "Setup complete!"
echo "==============="
echo ""
echo "Next steps:"
echo "1. Edit .env and add your OPENAI_API_KEY"
echo "2. Run backend: cd backend && ./scripts/dev.sh"
echo "3. Run frontend: cd frontend && npm run dev"
echo ""
echo "Or use Docker Compose for everything:"
echo "  docker-compose up"
echo ""
