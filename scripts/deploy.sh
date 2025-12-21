#!/bin/bash
# ===========================================
# STS Deployment Script
# ===========================================
# Usage:
#   ./scripts/deploy.sh local    # Local development with Docker PostgreSQL
#   ./scripts/deploy.sh dev      # Development with Supabase
#   ./scripts/deploy.sh prod     # Production deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Print banner
print_banner() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "   STS - Smart Total Solution"
    echo "   Deployment Script"
    echo "=================================================="
    echo -e "${NC}"
}

# Check Docker
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}[✗] Docker is not running. Please start Docker first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}[✓] Docker is running${NC}"
}

# Validate environment
validate_env() {
    local env_file=$1
    if [ ! -f "$env_file" ]; then
        echo -e "${RED}[✗] Environment file not found: $env_file${NC}"
        echo -e "${YELLOW}[!] Please copy from template and configure:${NC}"
        echo -e "    cp .env.example $env_file"
        exit 1
    fi
    echo -e "${GREEN}[✓] Environment file found: $env_file${NC}"
}

# Deploy Local Environment
deploy_local() {
    echo -e "\n${BLUE}[*] Deploying LOCAL environment...${NC}"

    validate_env ".env.local"

    # Load environment variables
    set -a
    source .env.local
    set +a

    # Stop existing containers
    docker compose -f docker-compose.local.yml down 2>/dev/null || true

    # Start services
    echo -e "${YELLOW}[*] Starting database and Redis...${NC}"
    docker compose -f docker-compose.local.yml up -d db redis

    echo -e "${YELLOW}[*] Waiting for database...${NC}"
    sleep 5

    echo -e "${YELLOW}[*] Starting backend and frontend...${NC}"
    docker compose -f docker-compose.local.yml up -d backend frontend

    # Show status
    echo -e "\n${GREEN}=================================================="
    echo "   Local Environment Ready!"
    echo "==================================================${NC}"
    echo -e "  Frontend:    ${BLUE}http://localhost:3000${NC}"
    echo -e "  Backend API: ${BLUE}http://localhost:8000${NC}"
    echo -e "  API Docs:    ${BLUE}http://localhost:8000/docs${NC}"
    echo -e "  PostgreSQL:  ${BLUE}localhost:${POSTGRES_PORT:-5433}${NC}"
    echo -e "  Redis:       ${BLUE}localhost:${REDIS_PORT:-6380}${NC}"
    echo ""
    echo -e "${YELLOW}[!] Logs: docker compose -f docker-compose.local.yml logs -f${NC}"
    echo -e "${YELLOW}[!] Stop: docker compose -f docker-compose.local.yml down${NC}"
}

# Deploy Development Environment (Supabase)
deploy_dev() {
    echo -e "\n${BLUE}[*] Deploying DEVELOPMENT environment (Supabase)...${NC}"

    validate_env ".env.dev"

    # Check Supabase configuration
    source .env.dev
    if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "https://your-project.supabase.co" ]; then
        echo -e "${RED}[✗] Supabase not configured in .env.dev${NC}"
        echo -e "${YELLOW}[!] Please configure SUPABASE_URL and other Supabase settings${NC}"
        exit 1
    fi

    # Stop existing containers
    docker compose -f docker-compose.dev.yml down 2>/dev/null || true

    # Start services
    echo -e "${YELLOW}[*] Starting Redis...${NC}"
    docker compose -f docker-compose.dev.yml up -d redis

    sleep 2

    echo -e "${YELLOW}[*] Starting backend and frontend...${NC}"
    docker compose -f docker-compose.dev.yml up -d backend frontend

    # Show status
    echo -e "\n${GREEN}=================================================="
    echo "   Development Environment Ready!"
    echo "==================================================${NC}"
    echo -e "  Frontend:    ${BLUE}http://localhost:3000${NC}"
    echo -e "  Backend API: ${BLUE}http://localhost:8000${NC}"
    echo -e "  API Docs:    ${BLUE}http://localhost:8000/docs${NC}"
    echo -e "  Database:    ${BLUE}Supabase (Cloud)${NC}"
    echo -e "  Redis:       ${BLUE}localhost:6379${NC}"
    echo ""
    echo -e "${YELLOW}[!] Logs: docker compose -f docker-compose.dev.yml logs -f${NC}"
    echo -e "${YELLOW}[!] Stop: docker compose -f docker-compose.dev.yml down${NC}"
}

# Deploy Production Environment
deploy_prod() {
    echo -e "\n${BLUE}[*] Deploying PRODUCTION environment...${NC}"

    validate_env ".env.prod"

    # Check production configuration
    source .env.prod
    if [ -z "$SUPABASE_URL" ] || [ "$SUPABASE_URL" = "https://your-project.supabase.co" ]; then
        echo -e "${RED}[✗] Supabase not configured in .env.prod${NC}"
        exit 1
    fi

    if [ "$JWT_SECRET" = "your-production-secret-key-minimum-32-characters" ]; then
        echo -e "${RED}[✗] JWT_SECRET not configured for production${NC}"
        echo -e "${YELLOW}[!] Generate a secure secret: openssl rand -hex 32${NC}"
        exit 1
    fi

    # Confirm deployment
    echo -e "${YELLOW}[!] You are about to deploy to PRODUCTION${NC}"
    read -p "Are you sure? (y/N): " confirm
    if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
        echo -e "${RED}[✗] Deployment cancelled${NC}"
        exit 0
    fi

    # Stop existing containers
    docker compose -f docker-compose.prod.yml down 2>/dev/null || true

    # Build production images
    echo -e "${YELLOW}[*] Building production images...${NC}"
    docker compose -f docker-compose.prod.yml build --no-cache

    # Start services
    echo -e "${YELLOW}[*] Starting production services...${NC}"
    docker compose -f docker-compose.prod.yml up -d

    # Wait for health checks
    echo -e "${YELLOW}[*] Waiting for services to be healthy...${NC}"
    sleep 10

    # Check health
    if curl -s http://localhost:8000/health | grep -q "healthy"; then
        echo -e "${GREEN}[✓] Backend is healthy${NC}"
    else
        echo -e "${RED}[✗] Backend health check failed${NC}"
    fi

    # Show status
    echo -e "\n${GREEN}=================================================="
    echo "   Production Environment Deployed!"
    echo "==================================================${NC}"
    echo -e "  Application: ${BLUE}https://your-domain.com${NC}"
    echo -e "  Health:      ${BLUE}https://your-domain.com/health${NC}"
    echo ""
    echo -e "${YELLOW}[!] Logs: docker compose -f docker-compose.prod.yml logs -f${NC}"
    echo -e "${YELLOW}[!] Stop: docker compose -f docker-compose.prod.yml down${NC}"
}

# Show help
show_help() {
    echo "Usage: ./scripts/deploy.sh [ENVIRONMENT]"
    echo ""
    echo "Environments:"
    echo "  local    Local development with Docker PostgreSQL"
    echo "  dev      Development with Supabase cloud database"
    echo "  prod     Production deployment"
    echo ""
    echo "Examples:"
    echo "  ./scripts/deploy.sh local    # Start local development"
    echo "  ./scripts/deploy.sh dev      # Start with Supabase"
    echo "  ./scripts/deploy.sh prod     # Deploy to production"
}

# Main
print_banner
check_docker

case "${1:-}" in
    local)
        deploy_local
        ;;
    dev)
        deploy_dev
        ;;
    prod)
        deploy_prod
        ;;
    -h|--help|help)
        show_help
        ;;
    *)
        echo -e "${RED}[✗] Invalid environment: ${1:-none}${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
