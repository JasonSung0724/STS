# STS Development Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Nginx (Port 80)                        │
│                    Reverse Proxy / Load Balancer            │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌───────────────────┐     ┌───────────────────┐
│  Frontend         │     │  Backend          │
│  Next.js (3000)   │     │  FastAPI (8000)   │
└───────────────────┘     └────────┬──────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
             ┌──────────┐  ┌──────────┐  ┌──────────┐
             │PostgreSQL│  │  Redis   │  │ OpenAI   │
             │  (5432)  │  │  (6379)  │  │   API    │
             └──────────┘  └──────────┘  └──────────┘
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js >= 20.11.0
- Python >= 3.12
- OpenAI API Key

### 1. Clone and Setup

```bash
# Clone repository
git clone <repo-url>
cd STS

# Copy environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
nano .env
```

### 2. Start Development Environment

**Option A: Docker (Recommended)**
```bash
# Start all services
./scripts/dev.sh

# Or start specific services
./scripts/dev.sh --backend-only
./scripts/dev.sh --frontend-only
./scripts/dev.sh --db-only
```

**Option B: Local Development**
```bash
# Runs services locally (faster iteration)
./scripts/dev-local.sh
```

### 3. Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| Nginx (Unified) | http://localhost |

## Project Structure

```
STS/
├── frontend/                 # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities
│   │   └── styles/          # CSS styles
│   └── package.json
│
├── backend/                  # FastAPI backend
│   ├── src/
│   │   ├── api/             # API endpoints
│   │   ├── core/            # Core utilities
│   │   ├── db/              # Database config
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic
│   └── pyproject.toml
│
├── infra/                    # Infrastructure
│   ├── docker/              # Dockerfiles
│   ├── nginx/               # Nginx config
│   ├── postgres/            # DB init scripts
│   ├── k8s/                 # Kubernetes manifests
│   └── terraform/           # IaC scripts
│
├── scripts/                  # Utility scripts
├── docker-compose.yml        # Docker Compose config
└── .env.example             # Environment template
```

## Development Workflow

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Lint and format
npm run lint
npm run format
```

### Backend Development

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# Install dependencies
pip install -e ".[dev]"

# Start dev server
uvicorn src.main:app --reload

# Run tests
pytest

# Lint and format
ruff check --fix .
ruff format .
```

### Database Migrations

```bash
cd backend

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Docker Commands

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f
docker compose logs -f backend  # specific service

# Stop services
docker compose down

# Rebuild containers
docker compose build --no-cache

# Reset database
docker compose down -v  # removes volumes
docker compose up -d
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### ChatKit (AI Chat)
- `POST /api/v1/chatkit/session` - Create chat session
- `POST /api/v1/chatkit/respond` - Send message (SSE)
- `GET /api/v1/chatkit/config` - Get chat config

### Users
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update profile

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard KPIs
- `GET /api/v1/analytics/revenue` - Revenue analytics

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens | Yes |
| `REDIS_URL` | Redis connection URL | No |
| `APP_ENV` | development/staging/production | No |

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

**Database connection failed**
```bash
# Check if PostgreSQL is running
docker compose ps db
# View logs
docker compose logs db
```

**Frontend build errors**
```bash
# Clear Next.js cache
rm -rf frontend/.next
npm run dev
```

### Getting Help

- Check logs: `docker compose logs -f`
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health
