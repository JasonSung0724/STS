# VM Multi-Environment Setup Guide

本指南說明如何在單一 GCP VM 上同時運行 dev 和 prod 環境。

## 架構概覽

```
                     ┌─────────────────────────────────────────────┐
                     │                  GCP VM                      │
                     │                                              │
   Port 80/443  ────►│  ┌─────────┐    ┌───────────────────────┐   │
   (Production)      │  │         │    │  backend-prod  :8000  │   │
                     │  │  Nginx  │───►│  frontend-prod :3000  │   │
   Port 8080/8443───►│  │         │    ├───────────────────────┤   │
   (Development)     │  │         │───►│  backend-dev   :8000  │   │
                     │  └─────────┘    │  frontend-dev  :3000  │   │
                     │       │         └───────────────────────┘   │
                     │       │         ┌───────────────────────┐   │
                     │       └────────►│     Redis (共用)       │   │
                     │                 └───────────────────────┘   │
                     └─────────────────────────────────────────────┘
```

## 訪問方式

### 無網域（使用 IP）

| 環境 | Frontend | Backend API | API Docs |
|------|----------|-------------|----------|
| Production | `http://VM_IP/` | `http://VM_IP/api/` | `http://VM_IP/docs` |
| Development | `http://VM_IP:8080/` | `http://VM_IP:8080/api/` | `http://VM_IP:8080/docs` |

### 有網域

| 環境 | Frontend | Backend API |
|------|----------|-------------|
| Production | `https://sts.example.com/` | `https://sts.example.com/api/` |
| Development | `https://dev.sts.example.com/` | `https://dev.sts.example.com/api/` |

---

## 初次設定

### 1. VM 準備

```bash
# 連線到 VM
ssh YOUR_USER@VM_IP

# 安裝 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安裝 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 登出後重新登入以套用 docker 群組
exit
ssh YOUR_USER@VM_IP

# 確認安裝
docker --version
docker-compose --version
```

### 2. 防火牆設定

在 GCP Console 中開啟以下端口：

| 端口 | 用途 |
|------|------|
| 80 | Production HTTP |
| 443 | Production HTTPS |
| 8080 | Development HTTP |
| 8443 | Development HTTPS |

### 3. 目錄結構

部署後，VM 上的目錄結構如下：

```
~/sts/
├── docker/
│   └── docker-compose.vm.yml
├── nginx/
│   ├── nginx.conf
│   └── conf.d/
│       ├── production.conf
│       └── development.conf
├── env/
│   ├── .env.dev
│   └── .env.prod
└── certbot/
    ├── www/
    └── conf/
```

---

## GitHub 環境設定

### Environment Variables（每個環境）

在 GitHub → Settings → Environments 中設定：

#### dev 環境

| Variable | 值 |
|----------|-----|
| `VM_HOST` | VM 的 IP 或主機名 |
| `VM_USER` | SSH 使用者名稱 |
| `API_URL` | `http://VM_IP:8080` |
| `APP_URL` | `http://VM_IP:8080` |
| `SUPABASE_URL` | Supabase Dev 專案 URL |
| `SUPABASE_ANON_KEY` | Supabase Dev Anon Key |
| `LINE_CHANNEL_ID` | LINE Dev Channel ID |

#### prod 環境

| Variable | 值 |
|----------|-----|
| `VM_HOST` | VM 的 IP 或主機名（與 dev 相同） |
| `VM_USER` | SSH 使用者名稱（與 dev 相同） |
| `API_URL` | `http://VM_IP` 或 `https://sts.example.com` |
| `APP_URL` | `http://VM_IP` 或 `https://sts.example.com` |
| `SUPABASE_URL` | Supabase Prod 專案 URL |
| `SUPABASE_ANON_KEY` | Supabase Prod Anon Key |
| `LINE_CHANNEL_ID` | LINE Prod Channel ID |

### Environment Secrets（每個環境）

| Secret | 說明 |
|--------|------|
| `DATABASE_URL` | Supabase Direct connection URL (port 5432) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key |
| `JWT_SECRET` | JWT 簽名金鑰（32+ 字元） |
| `OPENAI_API_KEY` | OpenAI API Key |
| `LINE_CHANNEL_SECRET` | LINE Channel Secret |
| `VM_SSH_KEY` | SSH 私鑰 |

---

## SSL 憑證設定（有網域後）

### 1. DNS 設定

在你的 DNS 提供商設定以下記錄：

```
sts.example.com.     A    VM_IP
dev.sts.example.com. A    VM_IP
```

### 2. 取得 SSL 憑證

```bash
# 連線到 VM
ssh YOUR_USER@VM_IP
cd ~/sts

# 執行 SSL 設定腳本
./scripts/setup-ssl.sh sts.example.com dev.sts.example.com
```

### 3. 啟用 HTTPS

編輯 Nginx 配置檔案，取消 HTTPS server block 的註解：

```bash
# 編輯 production 配置
nano ~/sts/nginx/conf.d/production.conf

# 編輯 development 配置
nano ~/sts/nginx/conf.d/development.conf
```

然後重啟 Nginx：

```bash
cd ~/sts/docker
docker compose -f docker-compose.vm.yml restart nginx
```

---

## 手動部署指令

如果需要手動操作：

```bash
# 連線到 VM
ssh YOUR_USER@VM_IP
cd ~/sts/docker

# 查看服務狀態
docker compose -f docker-compose.vm.yml ps

# 查看日誌
docker compose -f docker-compose.vm.yml logs -f backend-prod
docker compose -f docker-compose.vm.yml logs -f backend-dev

# 重啟特定服務
docker compose -f docker-compose.vm.yml restart backend-prod
docker compose -f docker-compose.vm.yml restart nginx

# 重新拉取並部署所有服務
docker compose -f docker-compose.vm.yml pull
docker compose -f docker-compose.vm.yml up -d

# 停止所有服務
docker compose -f docker-compose.vm.yml down
```

---

## 監控與除錯

### 查看服務健康狀態

```bash
# Production
curl http://localhost/health

# Development
curl http://localhost:8080/health
```

### 查看資源使用

```bash
docker stats
```

### 查看 Nginx 錯誤日誌

```bash
docker logs sts-nginx
```

---

## 常見問題

### 502 Bad Gateway

1. 確認後端服務已啟動：`docker compose -f docker-compose.vm.yml ps`
2. 查看後端日誌：`docker compose -f docker-compose.vm.yml logs backend-prod`
3. 確認 Nginx 配置正確：`docker exec sts-nginx nginx -t`

### SSL 憑證失敗

1. 確認 DNS 已正確指向 VM
2. 確認 port 80 已開放
3. 查看 certbot 日誌

### 資料庫連線失敗

1. 確認 DATABASE_URL 使用 Direct mode（port 5432）
2. 確認 Supabase 允許來自 VM IP 的連線

---

## 資源配置建議

| VM 規格 | 建議配置 |
|---------|----------|
| 最小配置 | 2 vCPU, 4GB RAM |
| 建議配置 | 4 vCPU, 8GB RAM |
| 生產環境 | 4 vCPU, 16GB RAM |

如果只運行 dev 環境，2 vCPU + 4GB RAM 即可。
同時運行 dev + prod，建議至少 4 vCPU + 8GB RAM。
