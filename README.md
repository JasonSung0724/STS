# STS - Smart Total Solution

> AI CEO Platform - 企業智慧決策助理系統

## 產品願景

STS 是一個以 AI 為核心的企業級智慧助理平台，扮演「AI CEO」的角色，協助企業：

- **提升營收**：透過數據分析與市場洞察，提供營收成長策略建議
- **KPI 管控**：即時監控企業關鍵績效指標，自動預警與建議
- **降低成本**：識別成本優化機會，提供具體的節流方案
- **提高效率**：自動化重複性決策流程，加速企業運營

## 核心功能

### Phase 1 - MVP (最小可行產品)

| 功能 | 描述 | 優先級 |
|------|------|--------|
| AI 對話介面 | 企業用戶可與 AI CEO 進行自然語言對話 | P0 |
| 基礎數據分析 | 上傳企業數據，AI 自動分析並生成報告 | P0 |
| KPI Dashboard | 視覺化呈現企業關鍵指標 | P0 |
| 用戶認證系統 | 企業帳號管理與權限控制 | P0 |

### Phase 2 - Agent 能力增強

| 功能 | 描述 | 優先級 |
|------|------|--------|
| 工具調用 (Tool Calling) | AI Agent 可調用外部工具進行分析 | P1 |
| OpenAI AgentKit 整合 | 串接 Agent Builder、ChatKit | P1 |
| 文件搜索與解析 | 上傳企業文檔，AI 自動索引與查詢 | P1 |
| 多輪對話記憶 | 維持對話上下文，提供連貫的諮詢體驗 | P1 |

### Phase 3 - 進階功能 (視需求)

| 功能 | 描述 | 優先級 |
|------|------|--------|
| 即時通知系統 | KPI 異常推播通知 | P2 |
| 任務排程 | 定期生成分析報告 | P2 |
| 訊息佇列 | 高併發處理能力 (RabbitMQ) | P2 |
| 快取機制 | 提升回應速度 (Redis) | P2 |
| 日誌分析 | 系統監控與分析 (ELK Stack) | P2 |

---

## 技術架構

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
│    Next.js 15.5 + React 19 + TypeScript 5.6 + TailwindCSS       │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS / REST API / WebSocket
┌─────────────────────────▼───────────────────────────────────────┐
│                         Backend                                  │
│              Python 3.12 + FastAPI 0.124                        │
│    ┌─────────────┬──────────────┬─────────────────────────┐     │
│    │  Auth       │  AI Agent    │   Analytics Engine      │     │
│    │  Service    │  Service     │   Service               │     │
│    └─────────────┴──────────────┴─────────────────────────┘     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                       External Services                          │
│    ┌─────────────┬──────────────┬─────────────────────────┐     │
│    │  OpenAI     │  OpenAI      │   OpenAI                │     │
│    │  AgentKit   │  ChatKit     │   API (GPT-4o)          │     │
│    └─────────────┴──────────────┴─────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                        Database                                  │
│                   PostgreSQL 17.7                                │
└─────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                       Deployment                                 │
│           GCP (Google Cloud Platform)                           │
│    ┌─────────────┬──────────────┬─────────────────────────┐     │
│    │  GKE        │  Cloud SQL   │   Cloud Storage         │     │
│    │  (K8s)      │  (PostgreSQL)│   (Files)               │     │
│    └─────────────┴──────────────┴─────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 技術堆疊與版本

### Frontend

| 技術 | 版本 | 說明 |
|------|------|------|
| Node.js | ^20.11.0 | JavaScript 執行環境 (LTS) |
| Next.js | ^15.5.9 | React 全端框架 |
| React | ^19.2.0 | UI 元件庫 |
| TypeScript | ^5.6.0 | 型別安全的 JavaScript |
| TailwindCSS | ^3.4.0 | Utility-first CSS 框架 |
| shadcn/ui | latest | UI 元件庫 (基於 Radix UI) |
| Zustand | ^5.0.0 | 輕量狀態管理 |
| React Query | ^5.60.0 | 伺服器狀態管理 |
| React Hook Form | ^7.54.0 | 表單處理 |
| Zod | ^3.24.0 | Schema 驗證 |
| Recharts | ^2.15.0 | 圖表視覺化 |
| Axios | ^1.7.0 | HTTP 請求庫 |

### Backend

| 技術 | 版本 | 說明 |
|------|------|------|
| Python | ^3.12.0 | 程式語言 |
| FastAPI | ^0.124.0 | 高效能 Web 框架 |
| Uvicorn | ^0.32.0 | ASGI 伺服器 |
| Pydantic | ^2.10.0 | 資料驗證 |
| SQLAlchemy | ^2.0.36 | ORM |
| Alembic | ^1.14.0 | 資料庫遷移 |
| asyncpg | ^0.30.0 | PostgreSQL 異步驅動 |
| python-jose | ^3.3.0 | JWT 處理 |
| passlib | ^1.7.4 | 密碼加密 |
| httpx | ^0.28.0 | 異步 HTTP 客戶端 |
| openai | ^1.60.0 | OpenAI Python SDK |

### Database

| 技術 | 版本 | 說明 |
|------|------|------|
| PostgreSQL | ^17.7 | 主要關聯式資料庫 |
| pgvector | ^0.8.0 | 向量搜尋擴展 (RAG 用) |

### DevOps & Deployment

| 技術 | 版本 | 說明 |
|------|------|------|
| Docker | ^27.0.0 | 容器化 |
| Kubernetes | ^1.31.0 | 容器編排 (GKE) |
| Terraform | ^1.10.0 | IaC 基礎設施管理 |
| GitHub Actions | - | CI/CD |

### 預留 - Phase 3 (暫不安裝)

| 技術 | 版本 | 說明 |
|------|------|------|
| Redis | ^7.4.0 | 快取與 Session |
| RabbitMQ | ^4.0.0 | 訊息佇列 |
| Elasticsearch | ^8.17.0 | 搜尋與日誌 |
| Logstash | ^8.17.0 | 日誌收集 |
| Kibana | ^8.17.0 | 日誌視覺化 |

---

## OpenAI Agent Platform 整合

### AgentKit 架構

本專案計劃整合 OpenAI 的 Agent Platform，包含：

1. **Agent Builder** (Beta)
   - 視覺化拖拽設計 AI Agent 工作流程
   - 支援多步驟、多 Agent 協作
   - 內建版本控制與回滾機制

2. **ChatKit**
   - 嵌入式聊天 UI 元件
   - 支援串流回應、檔案附件、思考鏈視覺化
   - 可自訂外觀與行為
   - 儲存空間：1GB/月免費，超過 $0.10/GB-day

3. **Connector Registry**
   - 整合外部資料來源 (Dropbox, Google Drive, SharePoint 等)
   - 支援 MCP (Model Context Protocol)

### 整合策略

```
Frontend (Next.js)
      │
      ├── 嵌入 ChatKit UI 元件
      │   └── 自訂樣式與品牌
      │
      └── API 呼叫
              │
              ▼
Backend (FastAPI)
      │
      ├── OpenAI API 整合層
      │   ├── Responses API
      │   ├── Tools (web_search, file_search, computer_use)
      │   └── Agents SDK
      │
      └── 自訂業務邏輯
          ├── KPI 分析工具
          ├── 財務報表解析
          └── 企業數據查詢
```

---

## 專案結構

```
STS/
├── README.md
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── frontend/                    # Next.js 前端應用
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── .env.local.example
│   │
│   ├── src/
│   │   ├── app/                 # App Router 頁面
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── (auth)/          # 認證相關頁面
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/     # 主控台
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── chat/        # AI 對話
│   │   │   │   ├── analytics/   # 數據分析
│   │   │   │   └── settings/    # 設定
│   │   │   └── api/             # API Routes
│   │   │
│   │   ├── components/          # 共用元件
│   │   │   ├── ui/              # shadcn/ui 元件
│   │   │   ├── chat/            # 聊天相關元件
│   │   │   ├── dashboard/       # Dashboard 元件
│   │   │   └── layout/          # 佈局元件
│   │   │
│   │   ├── hooks/               # 自訂 Hooks
│   │   ├── lib/                 # 工具函式
│   │   ├── stores/              # Zustand 狀態
│   │   ├── types/               # TypeScript 型別
│   │   └── styles/              # 全域樣式
│   │
│   └── public/                  # 靜態資源
│
├── backend/                     # FastAPI 後端應用
│   ├── pyproject.toml           # Python 專案設定 (uv/poetry)
│   ├── uv.lock
│   ├── .env.example
│   │
│   ├── src/
│   │   ├── main.py              # 應用入口
│   │   ├── config.py            # 設定管理
│   │   │
│   │   ├── api/                 # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── deps.py          # 依賴注入
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py
│   │   │       ├── chat.py
│   │   │       ├── analytics.py
│   │   │       └── users.py
│   │   │
│   │   ├── core/                # 核心模組
│   │   │   ├── __init__.py
│   │   │   ├── security.py      # 認證與加密
│   │   │   └── exceptions.py    # 例外處理
│   │   │
│   │   ├── models/              # SQLAlchemy 模型
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── conversation.py
│   │   │   └── analytics.py
│   │   │
│   │   ├── schemas/             # Pydantic Schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── chat.py
│   │   │   └── analytics.py
│   │   │
│   │   ├── services/            # 業務邏輯
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── chat_service.py
│   │   │   ├── ai_agent/        # AI Agent 服務
│   │   │   │   ├── __init__.py
│   │   │   │   ├── agent.py
│   │   │   │   └── tools/       # Agent 工具
│   │   │   │       ├── __init__.py
│   │   │   │       ├── kpi_analyzer.py
│   │   │   │       ├── financial_parser.py
│   │   │   │       └── data_query.py
│   │   │   └── analytics_service.py
│   │   │
│   │   └── db/                  # 資料庫
│   │       ├── __init__.py
│   │       ├── session.py
│   │       └── migrations/      # Alembic 遷移
│   │
│   └── tests/                   # 測試
│       ├── __init__.py
│       ├── conftest.py
│       └── api/
│
├── infra/                       # 基礎設施
│   ├── docker/
│   │   ├── frontend.Dockerfile
│   │   ├── backend.Dockerfile
│   │   └── nginx.conf
│   │
│   ├── k8s/                     # Kubernetes 配置
│   │   ├── namespace.yaml
│   │   ├── frontend/
│   │   ├── backend/
│   │   └── database/
│   │
│   └── terraform/               # GCP 基礎設施
│       ├── main.tf
│       ├── variables.tf
│       ├── gke.tf
│       ├── cloudsql.tf
│       └── outputs.tf
│
└── docs/                        # 文件
    ├── api.md                   # API 文件
    ├── architecture.md          # 架構說明
    └── deployment.md            # 部署指南
```

---

## 環境需求

### 開發環境

```bash
# 必要軟體
Node.js >= 20.11.0
Python >= 3.12.0
PostgreSQL >= 17.0
Docker >= 27.0.0
Git >= 2.40.0

# 推薦工具
pnpm >= 9.0.0        # Node.js 套件管理
uv >= 0.5.0          # Python 套件管理 (推薦)
```

---

## 快速開始

### 1. Clone 專案

```bash
git clone <repository-url>
cd STS
```

### 2. 環境變數設定

```bash
# 複製環境變數範本
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env

# 編輯環境變數 (必要)
# - OPENAI_API_KEY
# - DATABASE_URL
# - JWT_SECRET
```

### 3. 啟動開發環境 (Docker)

```bash
# 使用 Docker Compose 一鍵啟動
docker-compose up -d

# 檢查服務狀態
docker-compose ps
```

### 4. 或手動啟動 (開發模式)

#### Frontend

```bash
cd frontend

# 安裝依賴
pnpm install

# 啟動開發伺服器
pnpm dev

# 訪問 http://localhost:3000
```

#### Backend

```bash
cd backend

# 使用 uv 建立虛擬環境並安裝依賴
uv sync

# 啟動開發伺服器
uv run uvicorn src.main:app --reload --port 8000

# API 文件: http://localhost:8000/docs
```

#### Database

```bash
# 使用 Docker 啟動 PostgreSQL
docker run -d \
  --name sts-postgres \
  -e POSTGRES_USER=sts \
  -e POSTGRES_PASSWORD=sts_password \
  -e POSTGRES_DB=sts \
  -p 5432:5432 \
  postgres:17.7

# 執行資料庫遷移
cd backend
uv run alembic upgrade head
```

---

## 開發指南

### Git 分支策略

```
main        - 生產環境，受保護
develop     - 開發主線
feature/*   - 功能開發
bugfix/*    - 錯誤修復
release/*   - 發布準備
```

### Commit 訊息格式

```
<type>(<scope>): <subject>

type: feat, fix, docs, style, refactor, test, chore
scope: frontend, backend, infra, docs
```

範例：
```
feat(backend): add KPI analyzer tool for AI agent
fix(frontend): resolve chat message rendering issue
docs: update API documentation
```

### 程式碼規範

- **Frontend**: ESLint + Prettier
- **Backend**: Ruff (linter + formatter)
- **Pre-commit hooks**: 自動檢查格式

---

## API 設計

### 認證

```
POST   /api/v1/auth/register     # 註冊
POST   /api/v1/auth/login        # 登入
POST   /api/v1/auth/refresh      # 刷新 Token
POST   /api/v1/auth/logout       # 登出
```

### 對話

```
POST   /api/v1/chat/conversations            # 建立對話
GET    /api/v1/chat/conversations            # 取得對話列表
GET    /api/v1/chat/conversations/:id        # 取得對話詳情
POST   /api/v1/chat/conversations/:id/messages  # 發送訊息
DELETE /api/v1/chat/conversations/:id        # 刪除對話
```

### 分析

```
POST   /api/v1/analytics/upload      # 上傳數據
GET    /api/v1/analytics/reports     # 取得報告列表
GET    /api/v1/analytics/kpi         # 取得 KPI 數據
POST   /api/v1/analytics/query       # 自然語言查詢
```

---

## 部署

### GCP 架構

```
┌─────────────────────────────────────────────────────────┐
│                    Google Cloud Platform                 │
│                                                          │
│  ┌─────────────┐     ┌─────────────────────────────┐   │
│  │   Cloud     │     │         GKE Cluster          │   │
│  │   Load      │────▶│  ┌─────────┐  ┌─────────┐   │   │
│  │   Balancer  │     │  │Frontend │  │Backend  │   │   │
│  └─────────────┘     │  │ Pod(s)  │  │ Pod(s)  │   │   │
│                      │  └─────────┘  └─────────┘   │   │
│                      └──────────┬──────────────────┘   │
│                                 │                       │
│                      ┌──────────▼──────────┐           │
│                      │    Cloud SQL        │           │
│                      │   (PostgreSQL)      │           │
│                      └─────────────────────┘           │
│                                                          │
│  ┌─────────────┐     ┌─────────────────────┐           │
│  │   Cloud     │     │    Secret Manager   │           │
│  │   Storage   │     │    (API Keys, etc)  │           │
│  └─────────────┘     └─────────────────────┘           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 部署步驟

```bash
# 1. 設定 GCP 專案
gcloud config set project YOUR_PROJECT_ID

# 2. 建立基礎設施 (Terraform)
cd infra/terraform
terraform init
terraform plan
terraform apply

# 3. 建構並推送 Docker 映像
docker build -t gcr.io/YOUR_PROJECT_ID/sts-frontend:latest -f infra/docker/frontend.Dockerfile .
docker build -t gcr.io/YOUR_PROJECT_ID/sts-backend:latest -f infra/docker/backend.Dockerfile .
docker push gcr.io/YOUR_PROJECT_ID/sts-frontend:latest
docker push gcr.io/YOUR_PROJECT_ID/sts-backend:latest

# 4. 部署到 GKE
kubectl apply -f infra/k8s/
```

---

## 成本估算 (GCP)

### MVP 階段 (小規模)

| 服務 | 規格 | 預估月費 (USD) |
|------|------|----------------|
| GKE | e2-medium x 2 nodes | ~$50 |
| Cloud SQL | db-f1-micro | ~$10 |
| Cloud Storage | 10 GB | ~$1 |
| Cloud Load Balancer | 基本 | ~$20 |
| **小計** | | **~$81/月** |

### 生產階段 (中規模)

| 服務 | 規格 | 預估月費 (USD) |
|------|------|----------------|
| GKE | e2-standard-2 x 3 nodes | ~$150 |
| Cloud SQL | db-custom-2-4096 | ~$80 |
| Cloud Storage | 100 GB | ~$3 |
| Cloud Load Balancer | 標準 | ~$30 |
| **小計** | | **~$263/月** |

### OpenAI API 費用

| 模型 | 定價 |
|------|------|
| GPT-4o | $2.50/1M input, $10/1M output |
| GPT-4o-mini | $0.15/1M input, $0.60/1M output |
| ChatKit Storage | 1GB/月免費, 超過 $0.10/GB-day |

---

## 參考資源

### OpenAI Agent Platform
- [Introducing AgentKit](https://openai.com/index/introducing-agentkit/)
- [ChatKit Documentation](https://platform.openai.com/docs/guides/chatkit)
- [Custom ChatKit Integration](https://platform.openai.com/docs/guides/custom-chatkit)

### 技術文檔
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL 17 Release Notes](https://www.postgresql.org/docs/release/17.0/)

---

## 授權

Private - All Rights Reserved

---

## 聯絡方式

- 專案負責人：Jason Sung
- Email：[your-email@example.com]
