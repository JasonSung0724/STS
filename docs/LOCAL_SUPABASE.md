# Local Supabase Development Guide

本指南說明如何在本地使用 Supabase 進行開發。

## 方式一：Supabase CLI（推薦）

最簡單且功能最完整的方式。

### 1. 安裝 Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# 或使用 npm
npm install -g supabase
```

### 2. 初始化 Supabase

```bash
cd /path/to/STS
supabase init
```

這會在專案根目錄創建 `supabase/` 資料夾。

### 3. 啟動本地 Supabase

```bash
supabase start
```

首次啟動需要下載 Docker images，需要幾分鐘時間。

### 4. 取得本地憑證

```bash
supabase status
```

輸出會顯示：
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Anon key: eyJhbGciOiJIUzI1...
Service role key: eyJhbGciOiJIUzI1...
```

### 5. 設定環境變數

在專案根目錄創建 `.env.local`：

```bash
# Application
APP_NAME=STS
APP_ENV=local
DEBUG=true

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Supabase CLI)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:54322/postgres

# Supabase (從 supabase status 取得)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET=local-development-jwt-secret-key-32-chars

# OpenAI
OPENAI_API_KEY=sk-your-key
```

### 6. 常用指令

```bash
# 啟動 Supabase
supabase start

# 停止 Supabase
supabase stop

# 查看狀態
supabase status

# 重置資料庫
supabase db reset

# 查看 logs
supabase logs
```

---

## 方式二：Docker Compose

如果你不想安裝 Supabase CLI，可以使用我們提供的 Docker Compose 配置。

### 1. 啟動服務

```bash
docker compose -f deployment/docker/docker-compose.supabase.yml up -d
```

### 2. 服務端點

| 服務 | URL |
|------|-----|
| Supabase Studio | http://localhost:54323 |
| API Gateway | http://localhost:54321 |
| PostgreSQL | localhost:54322 |
| Mailpit (Email) | http://localhost:54324 |
| Redis | localhost:6379 |

### 3. 停止服務

```bash
docker compose -f deployment/docker/docker-compose.supabase.yml down
```

---

## 執行後端

確認 Supabase 已啟動後：

```bash
cd backend

# 安裝依賴
uv sync

# 執行遷移
uv run alembic upgrade head

# 啟動開發伺服器
uv run uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

## 執行前端

```bash
cd frontend

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

---

## 本地開發 vs 雲端 Supabase

| 功能 | 本地 Supabase | 雲端 Supabase |
|------|--------------|--------------|
| PostgreSQL | ✅ | ✅ |
| Auth | ✅ | ✅ |
| Realtime | ✅ | ✅ |
| Storage | ✅ | ✅ |
| Edge Functions | ❌ | ✅ |
| 免費 | ✅ | ✅ (有限制) |
| 適合 | 開發/測試 | 開發/生產 |

---

## 資料庫遷移

本地開發時，使用 Alembic 管理資料庫遷移：

```bash
cd backend

# 創建新的遷移
uv run alembic revision --autogenerate -m "描述"

# 執行遷移
uv run alembic upgrade head

# 回滾遷移
uv run alembic downgrade -1
```

## 問題排除

### Docker 無法啟動
確認 Docker Desktop 正在運行。

### 端口衝突
如果端口被佔用，修改 docker-compose 中的端口映射。

### 資料庫連線失敗
1. 確認 Supabase 服務已啟動：`supabase status` 或 `docker ps`
2. 確認 DATABASE_URL 正確

### 遷移失敗
1. 確認已安裝 psycopg2-binary
2. 確認 DATABASE_URL 使用正確的端口
