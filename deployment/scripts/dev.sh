#!/bin/bash
# ===========================================
# STS Development Environment Startup Script
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Print banner
echo -e "${BLUE}"
echo "=================================================="
echo "   STS - Smart Total Solution"
echo "   Development Environment"
echo "=================================================="
echo -e "${NC}"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}[!] .env file not found. Copying from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}[✓] .env file created. Please update it with your API keys.${NC}"
fi

# Parse arguments
SERVICES="all"
while [[ $# -gt 0 ]]; do
    case $1 in
        --backend-only)
            SERVICES="backend"
            shift
            ;;
        --frontend-only)
            SERVICES="frontend"
            shift
            ;;
        --db-only)
            SERVICES="db"
            shift
            ;;
        --help|-h)
            echo "Usage: ./scripts/dev.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --backend-only   Start only backend services (db, redis, backend)"
            echo "  --frontend-only  Start only frontend"
            echo "  --db-only        Start only database services (db, redis)"
            echo "  -h, --help       Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}[✗] Docker is not running. Please start Docker first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}[✓] Docker is running${NC}"
}

# Function to start services
start_services() {
    echo -e "\n${BLUE}[*] Starting services...${NC}"

    case $SERVICES in
        "all")
            docker compose up -d db redis
            echo -e "${YELLOW}[*] Waiting for database to be ready...${NC}"
            sleep 5
            docker compose up -d backend
            echo -e "${YELLOW}[*] Waiting for backend to be ready...${NC}"
            sleep 3
            docker compose up -d frontend nginx
            ;;
        "backend")
            docker compose up -d db redis backend
            ;;
        "frontend")
            docker compose up -d frontend
            ;;
        "db")
            docker compose up -d db redis
            ;;
    esac
}

# Function to show service status
show_status() {
    echo -e "\n${BLUE}[*] Service Status:${NC}"
    docker compose ps
}

# Function to show access URLs
show_urls() {
    echo -e "\n${GREEN}=================================================="
    echo "   Access URLs:"
    echo "==================================================${NC}"
    echo -e "  Frontend:    ${BLUE}http://localhost:3000${NC}"
    echo -e "  Backend API: ${BLUE}http://localhost:8000${NC}"
    echo -e "  API Docs:    ${BLUE}http://localhost:8000/docs${NC}"
    echo -e "  Nginx:       ${BLUE}http://localhost${NC}"
    echo ""
    echo -e "${YELLOW}[!] Logs: docker compose logs -f [service]${NC}"
    echo -e "${YELLOW}[!] Stop: docker compose down${NC}"
}

# Main execution
check_docker
start_services
show_status
show_urls

echo -e "\n${GREEN}[✓] Development environment is ready!${NC}"
