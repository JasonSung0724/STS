#!/bin/bash
# ===========================================
# STS - 本地開發環境腳本
# ===========================================
# 使用方式:
#   啟動: ./scripts/dev.sh start (或 ./scripts/dev.sh)
#   停止: ./scripts/dev.sh stop
#   重啟: ./scripts/dev.sh restart
#   狀態: ./scripts/dev.sh status

set -e

# 顏色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 專案根目錄
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# 環境變數檔案
ENV_FILE="$PROJECT_ROOT/deployment/env/.env.local"

# 同步環境變數到根目錄 .env (給 Supabase CLI 使用)
sync_env() {
    echo -e "${YELLOW}📝 Syncing environment variables...${NC}"

    # 從 .env.local 提取 Supabase CLI 需要的變數
    if [ -f "$ENV_FILE" ]; then
        # 提取 Google OAuth 和 OpenAI 變數
        grep -E '^(GOOGLE_CLIENT_ID|GOOGLE_CLIENT_SECRET|OPENAI_API_KEY)=' "$ENV_FILE" > "$PROJECT_ROOT/.env" 2>/dev/null || true
        echo "   Synced from: deployment/env/.env.local → .env"
    fi
}

start_services() {
    echo -e "${GREEN}🚀 Starting STS Local Development Environment...${NC}"
    echo ""

    # 檢查 Supabase CLI
    if ! command -v supabase &> /dev/null; then
        echo -e "${RED}❌ Supabase CLI not found. Please install it first:${NC}"
        echo "   brew install supabase/tap/supabase"
        exit 1
    fi

    # 檢查 Docker
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker is not running. Please start Docker Desktop first.${NC}"
        exit 1
    fi

    # 同步環境變數
    sync_env

    # Step 1: 啟動 Supabase
    echo -e "${YELLOW}📦 Starting Supabase...${NC}"
    supabase start

    # Step 2: 啟動其他服務
    echo ""
    echo -e "${YELLOW}🐳 Starting Redis, Backend, Frontend...${NC}"
    docker compose -f deployment/docker/docker-compose.local.yml --env-file "$ENV_FILE" up -d

    echo ""
    echo -e "${YELLOW}⏳ Waiting for services...${NC}"
    sleep 3

    show_status
}

stop_services() {
    echo -e "${RED}🛑 Stopping STS Local Development Environment...${NC}"
    echo ""

    # 停止 Docker 容器
    echo -e "${YELLOW}🐳 Stopping Docker containers...${NC}"
    docker compose -f deployment/docker/docker-compose.local.yml down 2>/dev/null || true

    # 停止 Supabase
    echo -e "${YELLOW}📦 Stopping Supabase...${NC}"
    supabase stop 2>/dev/null || true

    echo ""
    echo -e "${GREEN}✅ All services stopped!${NC}"
}

show_status() {
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}🎉 STS Local Development Environment${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo "📌 Service Endpoints:"
    echo "   • Frontend:        http://localhost:3000"
    echo "   • Backend API:     http://localhost:8000"
    echo "   • Supabase API:    http://localhost:54321"
    echo "   • Supabase Studio: http://localhost:54323"
    echo "   • Email Testing:   http://localhost:54324"
    echo ""
    echo "📌 Database:"
    echo "   • PostgreSQL: postgresql://postgres:postgres@localhost:54322/postgres"
    echo ""
    echo "📌 Commands:"
    echo "   • View logs:    docker compose -f deployment/docker/docker-compose.local.yml logs -f"
    echo "   • Stop all:     ./scripts/dev.sh stop"
    echo "   • DB diff:      supabase db diff"
    echo "   • DB push:      supabase db push"
    echo ""
}

case "${1:-start}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        echo ""
        start_services
        ;;
    status)
        echo "📊 Service Status:"
        echo ""
        echo "Supabase:"
        supabase status 2>/dev/null || echo "  Not running"
        echo ""
        echo "Docker containers:"
        docker compose -f deployment/docker/docker-compose.local.yml ps 2>/dev/null || echo "  Not running"
        ;;
    logs)
        docker compose -f deployment/docker/docker-compose.local.yml logs -f
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
