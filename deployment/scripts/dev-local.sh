#!/bin/bash
# ===========================================
# STS Local Development (Without Docker)
# ===========================================
# This script runs services locally without Docker
# Useful for faster development iteration

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}"
echo "=================================================="
echo "   STS - Local Development Mode"
echo "=================================================="
echo -e "${NC}"

# Check for .env
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}[✓] Created .env from .env.example${NC}"
fi

# Load environment variables
set -a
source .env
set +a

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}[*] Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    echo -e "${GREEN}[✓] Services stopped${NC}"
}
trap cleanup EXIT

# Start database services with Docker
echo -e "${BLUE}[*] Starting database services...${NC}"
docker compose up -d db redis
sleep 3

# Check if backend dependencies are installed
if [ ! -d "backend/.venv" ]; then
    echo -e "${YELLOW}[*] Installing backend dependencies...${NC}"
    cd backend
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -e ".[dev]"
    cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}[*] Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    cd ..
fi

# Start backend
echo -e "${BLUE}[*] Starting backend...${NC}"
cd backend
source .venv/bin/activate
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

# Wait for backend
sleep 2

# Start frontend
echo -e "${BLUE}[*] Starting frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "\n${GREEN}=================================================="
echo "   Services Running:"
echo "==================================================${NC}"
echo -e "  Frontend:    ${BLUE}http://localhost:3000${NC}"
echo -e "  Backend:     ${BLUE}http://localhost:8000${NC}"
echo -e "  API Docs:    ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for processes
wait
