# STS Deployment Guide

## 環境總覽

| 環境 | 資料庫 | 快取 | 用途 |
|------|--------|------|------|
| **Local** | Docker PostgreSQL | Docker Redis | 本地開發，無需外部服務 |
| **Dev** | Supabase (Cloud) | Docker Redis | 團隊開發，整合測試 |
| **Prod** | Supabase (Cloud) | Upstash Redis | 正式上線 |

## 快速開始

```bash
# 本地開發 (使用 Docker PostgreSQL)
./scripts/deploy.sh local

# 開發環境 (使用 Supabase)
./scripts/deploy.sh dev

# 生產環境
./scripts/deploy.sh prod
```

---

## 1. 本地開發環境 (Local)

### 適用場景
- 個人開發
- 離線開發
- 快速原型測試

### 配置步驟

```bash
# 1. 複製環境變數
cp .env.local .env

# 2. 設定 OpenAI API Key
nano .env.local
# 修改: OPENAI_API_KEY=sk-your-key

# 3. 啟動服務
./scripts/deploy.sh local
```

### 服務端口

| 服務 | URL |
|------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### 常用命令

```bash
# 查看日誌
docker compose -f docker-compose.local.yml logs -f

# 查看特定服務
docker compose -f docker-compose.local.yml logs -f backend

# 停止服務
docker compose -f docker-compose.local.yml down

# 重置資料庫
docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d
```

---

## 2. 開發環境 (Development with Supabase)

### 適用場景
- 團隊協作開發
- 整合測試
- 資料共享

### Supabase 設定

#### Step 1: 建立 Supabase 專案

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 點擊 "New Project"
3. 選擇組織和區域 (建議: `asia-southeast1`)
4. 設定專案名稱和資料庫密碼

#### Step 2: 取得連線資訊

從 Supabase Dashboard > Settings > Database 取得:

```
Project URL: https://xxxxx.supabase.co
Anon Key: eyJhbGciOi...
Service Role Key: eyJhbGciOi...
Database Password: your-password
Connection String: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

#### Step 3: 配置環境變數

```bash
# 複製模板
cp .env.dev .env

# 編輯配置
nano .env.dev
```

修改以下設定:
```bash
# Supabase
USE_SUPABASE=true
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Database (使用 Pooler 連線)
DATABASE_URL=postgresql+asyncpg://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# OpenAI
OPENAI_API_KEY=sk-your-key
```

#### Step 4: 啟動服務

```bash
./scripts/deploy.sh dev
```

### 資料庫遷移

```bash
# 進入 backend 目錄
cd backend

# 執行遷移
docker compose -f ../docker-compose.dev.yml exec backend alembic upgrade head
```

---

## 3. 生產環境 (Production)

### 適用場景
- 正式上線
- 客戶使用

### 架構圖

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │   (CDN + WAF)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Nginx       │
                    │  (Port 80/443)  │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐         │
    │  Frontend   │   │   Backend   │         │
    │   (3000)    │   │   (8000)    │         │
    └─────────────┘   └──────┬──────┘         │
                             │                 │
              ┌──────────────┼─────────────────┤
              │              │                 │
       ┌──────▼──────┐ ┌─────▼─────┐   ┌──────▼──────┐
       │  Supabase   │ │  Upstash  │   │   OpenAI    │
       │  PostgreSQL │ │   Redis   │   │     API     │
       └─────────────┘ └───────────┘   └─────────────┘
```

### VM 準備

#### 建議規格

| 用戶數 | CPU | RAM | 儲存 |
|--------|-----|-----|------|
| < 500 | 2 vCPU | 4 GB | 40 GB SSD |
| 500-2000 | 4 vCPU | 8 GB | 80 GB SSD |
| 2000+ | 8 vCPU | 16 GB | 160 GB SSD |

#### 系統設定

```bash
# Ubuntu 22.04 LTS
# 1. 更新系統
sudo apt update && sudo apt upgrade -y

# 2. 安裝 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. 安裝 Docker Compose
sudo apt install docker-compose-plugin -y

# 4. 安裝 Certbot (SSL)
sudo apt install certbot -y
```

### SSL 憑證設定

```bash
# 取得 Let's Encrypt 憑證
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# 憑證位置
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem

# 自動更新
sudo crontab -e
# 加入: 0 0 * * * certbot renew --quiet
```

### 部署步驟

#### Step 1: 上傳程式碼

```bash
# 在 VM 上
git clone <repo-url> /opt/sts
cd /opt/sts
```

#### Step 2: 配置環境

```bash
# 複製生產環境配置
cp .env.prod .env

# 編輯配置
nano .env.prod
```

重要設定:
```bash
# 網域
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com

# JWT (使用強密鑰)
JWT_SECRET=$(openssl rand -hex 32)

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
DATABASE_URL=postgresql+asyncpg://...

# OpenAI
OPENAI_API_KEY=sk-prod-key
```

#### Step 3: 更新 Nginx 配置

```bash
# 編輯生產 Nginx 配置
nano infra/nginx/conf.d/production.conf

# 替換 your-domain.com 為實際網域
```

#### Step 4: 部署

```bash
./scripts/deploy.sh prod
```

### 健康檢查

```bash
# 檢查服務狀態
docker compose -f docker-compose.prod.yml ps

# 檢查健康端點
curl https://your-domain.com/health

# 查看日誌
docker compose -f docker-compose.prod.yml logs -f
```

---

## 環境變數參考

### 必要變數

| 變數 | 說明 | Local | Dev | Prod |
|------|------|-------|-----|------|
| `OPENAI_API_KEY` | OpenAI API 金鑰 | ✅ | ✅ | ✅ |
| `JWT_SECRET` | JWT 簽名密鑰 | 預設 | 預設 | **必須自訂** |
| `DATABASE_URL` | 資料庫連線 | Docker | Supabase | Supabase |

### Supabase 變數

| 變數 | 說明 |
|------|------|
| `USE_SUPABASE` | 是否使用 Supabase |
| `SUPABASE_URL` | 專案 URL |
| `SUPABASE_ANON_KEY` | 匿名公開金鑰 |
| `SUPABASE_SERVICE_ROLE_KEY` | 服務角色金鑰 (後端用) |

---

## 故障排除

### 資料庫連線失敗

```bash
# 檢查連線字串格式
# Supabase Pooler (推薦):
postgresql+asyncpg://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# 直接連線:
postgresql+asyncpg://postgres:[password]@db.[ref].supabase.co:5432/postgres
```

### 前端建置失敗

```bash
# 清除快取重建
docker compose -f docker-compose.prod.yml build --no-cache frontend
```

### SSL 憑證問題

```bash
# 檢查憑證
sudo certbot certificates

# 手動更新
sudo certbot renew --force-renewal
```

---

## 監控 (選用)

### Grafana Cloud (免費)

1. 註冊 [Grafana Cloud](https://grafana.com/products/cloud/)
2. 設定 Prometheus 採集
3. 匯入 Docker 和 PostgreSQL 儀表板

### Uptime 監控

建議使用:
- [Better Stack](https://betterstack.com/) (免費方案)
- [UptimeRobot](https://uptimerobot.com/) (免費方案)
