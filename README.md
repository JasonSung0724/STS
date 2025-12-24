# STS - Smart Total Solution

> AI CEO Platform - 企業智慧決策助理系統

## 產品願景

STS 是一個以 AI 為核心的企業級智慧助理平台，扮演「AI CEO」的角色，協助企業：

- **提升營收**：透過數據分析與市場洞察，提供營收成長策略建議
- **KPI 管控**：即時監控企業關鍵績效指標，自動預警與建議
- **降低成本**：識別成本優化機會，提供具體的節流方案
- **提高效率**：自動化重複性決策流程，加速企業運營

---

## 技術架構

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend                                 │
│    Next.js 15.5 + React 19 + TypeScript 5.6 + TailwindCSS       │
│    + next-intl (i18n) + OpenAI ChatKit React                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │ HTTPS / REST API / SSE Streaming
┌─────────────────────────▼───────────────────────────────────────┐
│                         Backend                                  │
│              Python 3.12 + FastAPI 0.124                        │
│    ┌─────────────┬──────────────┬─────────────────────────┐     │
│    │  Auth       │  AI Agent    │   Analytics Engine      │     │
│    │  Service    │  (Agents SDK)│   Service               │     │
│    └─────────────┴──────────────┴─────────────────────────┘     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                       Infrastructure                             │
│    ┌─────────────┬──────────────┬─────────────────────────┐     │
│    │ PostgreSQL  │    Redis     │   Nginx (Production)    │     │
│    │ 17-alpine   │  7-alpine    │   Reverse Proxy + SSL   │     │
│    └─────────────┴──────────────┴─────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                       External Services                          │
│    ┌─────────────┬──────────────┬─────────────────────────┐     │
│    │  OpenAI     │  OpenAI      │   Supabase              │     │
│    │  Agents SDK │  GPT-4o      │   (Dev/Prod DB)         │     │
│    └─────────────┴──────────────┴─────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 技術堆疊

### Frontend

| 技術                  | 版本      | 說明                      |
| --------------------- | --------- | ------------------------- |
| Node.js               | >=20.11.0 | JavaScript 執行環境 (LTS) |
| Next.js               | ^15.5.9   | React 全端框架            |
| React                 | ^19.2.0   | UI 元件庫                 |
| TypeScript            | ^5.6.0    | 型別安全的 JavaScript     |
| TailwindCSS           | ^3.4.0    | Utility-first CSS 框架    |
| next-intl             | ^4.6.1    | 國際化 (i18n)             |
| @openai/chatkit-react | ^1.4.0    | OpenAI ChatKit UI 元件    |
| @tanstack/react-query | ^5.60.0   | 伺服器狀態管理            |
| Zustand               | ^5.0.0    | 輕量狀態管理              |
| React Hook Form       | ^7.54.0   | 表單處理                  |
| Zod                   | ^3.24.0   | Schema 驗證               |
| Recharts              | ^2.15.0   | 圖表視覺化                |
| Axios                 | ^1.7.0    | HTTP 請求庫               |
| Lucide React          | ^0.460.0  | 圖示庫                    |

### Backend

| 技術              | 版本      | 說明                |
| ----------------- | --------- | ------------------- |
| Python            | >=3.12.0  | 程式語言            |
| FastAPI           | >=0.124.0 | 高效能 Web 框架     |
| Uvicorn           | >=0.32.0  | ASGI 伺服器         |
| OpenAI Agents SDK | >=0.1.0   | AI Agent 框架       |
| OpenAI            | >=1.60.0  | OpenAI Python SDK   |
| SQLAlchemy        | >=2.0.36  | ORM                 |
| asyncpg           | >=0.30.0  | PostgreSQL 異步驅動 |
| Alembic           | >=1.14.0  | 資料庫遷移          |
| Pydantic          | >=2.10.0  | 資料驗證            |
| Redis             | >=5.0.0   | 快取與 Session      |
| python-jose       | >=3.3.0   | JWT 處理            |
| passlib           | >=1.7.4   | 密碼加密            |
| httpx             | >=0.28.0  | 異步 HTTP 客戶端    |

### Infrastructure

| 技術           | 版本      | 說明                       |
| -------------- | --------- | -------------------------- |
| Docker         | >=27.0.0  | 容器化                     |
| Docker Compose | >=2.0.0   | 多容器編排                 |
| PostgreSQL     | 17-alpine | 關聯式資料庫               |
| Redis          | 7-alpine  | 快取                       |
| Nginx          | latest    | 反向代理 (Production)      |
| Supabase       | -         | 雲端 PostgreSQL (Dev/Prod) |

---

## 環境需求

```bash
# 必要軟體
Node.js >= 20.11.0
Python >= 3.12.0
Docker >= 27.0.0
Docker Compose >= 2.0.0
Git >= 2.40.0

# 推薦工具
pnpm >= 9.0.0        # Node.js 套件管理
uv >= 0.5.0          # Python 套件管理
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
# 複製本地環境變數範本
cp .env.example .env.local

# 編輯 .env.local，設定必要的環境變數：
# - OPENAI_API_KEY (必要)
# - JWT_SECRET
```

### 3. 一鍵啟動本地開發環境

```bash
# 使用部署腳本啟動 (推薦)
./scripts/deploy.sh local

# 或手動啟動
docker compose -f docker-compose.local.yml up -d
```

### 4. 訪問服務

| 服務               | URL                         |
| ------------------ | --------------------------- |
| Frontend           | http://localhost:3000       |
| Backend API        | http://localhost:8000       |
| API Docs (Swagger) | http://localhost:8000/docs  |
| API Docs (ReDoc)   | http://localhost:8000/redoc |

---

## 開發指南

### Docker 指令

```bash
# 啟動所有服務
docker compose -f deployment/docker/docker-compose.local.yml up -d

# 查看服務狀態
docker compose -f deployment/docker/docker-compose.local.yml ps

# 查看日誌
docker compose -f deployment/docker/docker-compose.local.yml logs -f
docker compose -f deployment/docker/docker-compose.local.yml logs -f backend   # 只看 backend
docker compose -f deployment/docker/docker-compose.local.yml logs -f frontend  # 只看 frontend

# 重啟單一服務
docker compose -f deployment/docker/docker-compose.local.yml restart backend

# 重建服務 (程式碼有重大變更時)
docker compose -f deployment/docker/docker-compose.local.yml build --no-cache backend
docker compose -f deployment/docker/docker-compose.local.yml up -d backend

# 停止所有服務 (保留資料)
docker compose -f deployment/docker/docker-compose.local.yml down

# 停止並清除所有資料
docker compose -f deployment/docker/docker-compose.local.yml down -v
```

### 本地開發 (不使用 Docker)

#### Frontend

```bash
cd frontend

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 其他指令
npm run build          # 建構生產版本
npm run lint           # 檢查程式碼
npm run lint:fix       # 自動修復
npm run format         # 格式化程式碼
npm run type-check     # TypeScript 型別檢查
```

#### Backend

```bash
cd backend

# 使用 uv 安裝依賴
uv sync

# 啟動開發伺服器
uv run uvicorn src.main:app --reload --port 8000

# 其他指令
uv run pytest                    # 執行測試
uv run ruff check .              # 檢查程式碼
uv run ruff format .             # 格式化程式碼
uv run mypy src                  # 型別檢查
uv run alembic upgrade head      # 執行資料庫遷移
uv run alembic revision -m "xxx" # 建立新的遷移
```

---

## 多環境部署

專案支援三種環境：

| 環境  | 配置檔                                    | 資料庫               | 用途     |
| ----- | ----------------------------------------- | -------------------- | -------- |
| Local | `.env.local` + `docker-compose.local.yml` | Docker PostgreSQL    | 本地開發 |
| Dev   | `.env.dev` + `docker-compose.dev.yml`     | Supabase             | 開發測試 |
| Prod  | `.env.prod` + `docker-compose.prod.yml`   | Supabase + Nginx SSL | 生產環境 |

### 部署指令

```bash
# 本地開發
./scripts/deploy.sh local

# 開發環境 (需先設定 .env.dev 的 Supabase 連線)
./scripts/deploy.sh dev

# 生產環境
./scripts/deploy.sh prod
```

詳細部署說明請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## API 端點

### 認證

```
POST   /api/v1/auth/register     # 註冊
POST   /api/v1/auth/login        # 登入
POST   /api/v1/auth/refresh      # 刷新 Token
POST   /api/v1/auth/logout       # 登出
```

### AI 對話

```
POST   /api/v1/chat/conversations                              # 建立對話
GET    /api/v1/chat/conversations                              # 取得對話列表
GET    /api/v1/chat/conversations/:id                          # 取得對話詳情
POST   /api/v1/chat/conversations/:id/messages                 # 發送訊息
POST   /api/v1/chat/conversations/:id/messages/stream          # 發送訊息 (SSE 串流)
DELETE /api/v1/chat/conversations/:id                          # 刪除對話
POST   /api/v1/chat/quick-chat                                 # 快速對話 (無需建立對話)
```

### 分析

```
GET    /api/v1/analytics/kpis              # 取得 KPI 數據
POST   /api/v1/analytics/kpis              # 新增 KPI
GET    /api/v1/analytics/reports           # 取得報告列表
POST   /api/v1/analytics/reports           # 建立報告
POST   /api/v1/analytics/query             # 自然語言查詢
```

### 用戶

```
GET    /api/v1/users/me                    # 取得當前用戶資訊
PUT    /api/v1/users/me                    # 更新用戶資訊
```

---

## AI Agent 功能

CEO Agent 使用 OpenAI Agents SDK 實作，提供以下工具：

| 工具                   | 說明                |
| ---------------------- | ------------------- |
| `analyze_kpis`         | 分析 KPI 指標與趨勢 |
| `get_revenue_data`     | 取得營收數據與預測  |
| `analyze_costs`        | 成本分析與優化建議  |
| `generate_report`      | 生成商業報告        |
| `search_business_data` | 搜尋商業數據        |

---

## 專案結構

```
STS/
├── README.md                    # 本文件
├── DEPLOYMENT.md                # 部署指南
├── DEVELOPMENT.md               # 開發指南
├── .env.example                 # 環境變數範本
├── .env.local                   # 本地環境變數
├── .env.dev                     # 開發環境變數
├── .env.prod                    # 生產環境變數
├── docker-compose.local.yml     # 本地 Docker Compose
├── docker-compose.dev.yml       # 開發 Docker Compose
├── docker-compose.prod.yml      # 生產 Docker Compose
│
├── frontend/                    # Next.js 前端
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── app/                 # App Router 頁面
│   │   ├── components/          # React 元件
│   │   ├── hooks/               # 自訂 Hooks
│   │   ├── lib/                 # 工具函式
│   │   ├── i18n/                # 國際化設定
│   │   ├── stores/              # Zustand 狀態
│   │   └── styles/              # 樣式
│   └── messages/                # 多語言翻譯檔
│
├── backend/                     # FastAPI 後端
│   ├── pyproject.toml           # Python 專案設定
│   ├── src/
│   │   ├── main.py              # 應用入口
│   │   ├── config.py            # 設定管理
│   │   ├── api/v1/              # API 路由
│   │   ├── core/                # 核心模組
│   │   ├── models/              # SQLAlchemy 模型
│   │   ├── schemas/             # Pydantic Schemas
│   │   ├── services/            # 業務邏輯
│   │   │   ├── agents/          # OpenAI Agents SDK 整合
│   │   │   │   └── ceo_agent.py # CEO Agent
│   │   │   └── ai_agent/        # AI Agent 工具
│   │   └── db/                  # 資料庫
│   └── tests/                   # 測試
│
├── infra/                       # 基礎設施
│   ├── docker/                  # Dockerfile
│   │   ├── backend.Dockerfile
│   │   └── frontend.Dockerfile
│   ├── nginx/                   # Nginx 配置
│   └── postgres/                # PostgreSQL 初始化
│
└── scripts/                     # 部署腳本
    ├── deploy.sh                # 統一部署腳本
    ├── dev.sh                   # 開發環境腳本
    └── dev-local.sh             # 本地開發腳本
```

---

## 程式碼規範

- **Frontend**: ESLint + Prettier
- **Backend**: Ruff (linter + formatter) + mypy

### Git Commit 格式

```
<type>(<scope>): <subject>

type: feat, fix, docs, style, refactor, test, chore
scope: frontend, backend, infra, docs
```

範例：

```
feat(backend): add CEO agent with OpenAI Agents SDK
fix(frontend): resolve chat streaming issue
docs: update README with development guide
```

---

## 參考資源

- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)
- [OpenAI AgentKit](https://openai.com/index/introducing-agentkit/)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)

---

## 授權

Private - All Rights Reserved

---

## 聯絡方式

- 專案負責人：Jason Sung
