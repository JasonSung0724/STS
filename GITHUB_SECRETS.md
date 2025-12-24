# GitHub Secrets 配置指南

## 必需的 Secrets

以下是部署到生產環境所需的 GitHub Secrets：

### 1. VM / SSH 連線
```
VM_HOST          = your-vm-ip-or-hostname
VM_USER          = your-ssh-username
VM_SSH_KEY       = your-private-ssh-key (完整的 PEM 格式)
```

### 2. Supabase (生產環境)
```
SUPABASE_URL              = https://your-project.supabase.co
SUPABASE_ANON_KEY         = your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY = your-supabase-service-role-key
SUPABASE_JWT_SECRET       = your-supabase-jwt-secret
```

### 3. Database
```
DATABASE_URL     = postgresql+asyncpg://user:password@host:5432/dbname
POSTGRES_USER    = your-db-user
POSTGRES_PASSWORD = your-db-password
```

### 4. Authentication
```
JWT_SECRET       = your-production-jwt-secret (建議 64+ 字元隨機字串)
```

### 5. Google OAuth
```
GOOGLE_CLIENT_ID     = your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = your-google-client-secret
```

### 6. OpenAI API
```
OPENAI_API_KEY   = sk-your-openai-api-key
```

### 7. Docker Registry (如使用私有 Registry)
```
DOCKER_REGISTRY  = ghcr.io/your-username (或其他 registry)
DOCKER_USERNAME  = your-username
DOCKER_PASSWORD  = your-token-or-password
```

---

## 如何設置 GitHub Secrets

1. 進入你的 GitHub repo
2. 點擊 **Settings** > **Secrets and variables** > **Actions**
3. 點擊 **New repository secret**
4. 輸入 Name 和 Value

---

## 本地 vs 生產環境對照表

| 用途 | 本地 (.env) | 生產 (GitHub Secret) |
|------|------------|---------------------|
| Supabase URL | `http://localhost:54321` | `https://xxx.supabase.co` |
| Database Port | `54322` | `5432` |
| Google OAuth Redirect | `http://localhost:54321/auth/v1/callback` | `https://your-domain/auth/v1/callback` |
| JWT Secret | `super-secret-...` | 強隨機字串 |

---

## 生成安全的 JWT Secret

```bash
# macOS / Linux
openssl rand -base64 64

# 或使用 Python
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

## Google OAuth 設置步驟

1. 前往 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 建立專案或選擇現有專案
3. 點擊 **Create Credentials** > **OAuth client ID**
4. 選擇 **Web application**
5. 設定授權重定向 URI：
   - 本地開發：`http://localhost:54321/auth/v1/callback`
   - 生產環境：`https://your-supabase-url/auth/v1/callback`
6. 複製 Client ID 和 Client Secret
