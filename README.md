# MentorMatch

> AI-powered academic mentor finder for CSED, Thapar Institute of Engineering & Technology.

Students describe their capstone project idea, and MentorMatch recommends the top 5 faculty mentors based on research alignment — using a RAG pipeline powered by [ChatVat](https://pypi.org/project/chatvat/).

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Frontend   │────▶│  Backend (API)   │────▶│   ChatVat    │
│  Next.js 16  │     │    FastAPI        │     │  RAG Engine  │
│  Port 3000   │     │   Port 8080       │     │  Port 8000   │
└──────────────┘     └────────┬─────────┘     └──────┬───────┘
                              │                       │
                     ┌────────▼─────────┐     ┌──────▼───────┐
                     │  PostgreSQL 15   │     │  ChromaDB    │
                     │   Port 5432      │     │ (embedded)   │
                     └──────────────────┘     └──────────────┘
```

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Shadcn/UI, Framer Motion | Chat UI, admin dashboard |
| Backend | FastAPI, SQLAlchemy, Pydantic v2 | API gateway, auth, rate limiting, security middleware |
| AI Engine | [ChatVat](https://pypi.org/project/chatvat/) (Groq LLM + ChromaDB) | RAG pipeline — retrieves faculty data, generates mentor recommendations |
| Database | PostgreSQL 15 (Docker) | Sessions, messages, feedback, admin users, security events |
| Auth | Google OAuth 2.0 + JWT | Admin portal access |
| Security | Cloudflare Turnstile, LLM Guard, rate limiter, SQLi middleware | Bot protection, prompt injection defense |

---

## Quick Start (Local Development)

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.11+ (for ChatVat)
- A [Groq API key](https://console.groq.com/) (free tier works)

### 1. Clone & Setup Backend

```bash
cd mentormatch-backend
cp .env.sample .env
# Edit .env — fill in your secrets (Groq key, Google OAuth, Turnstile, JWT secret)
docker compose up --build
```

Wait for `Application startup complete` on port 8080.

### 2. Setup ChatVat (RAG Engine)

```bash
pip install chatvat
# Configure chatvat.config.json with your Groq key, faculty data source, etc.
# Run ChatVat on port 8000
chatvat run
```

### 3. Setup Frontend

```bash
cd mentormatch-frontend
cp .env.sample .env.local
# Edit .env.local — add your Turnstile site key and Google Client ID
npm install
npm run dev
```

Open http://localhost:3000

---

## Environment Variables

### Backend (`mentormatch-backend/.env`)

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` | Database username |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name |
| `DATABASE_URL` | Full PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `SUPER_ADMIN_EMAIL` | Email with super_admin privileges |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server key |
| `JWT_SECRET_KEY` | Random string for signing JWTs |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `CHATVAT_HOST` | ChatVat engine host IP |

### Frontend (`mentormatch-frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile public key |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |

> **No `NEXT_PUBLIC_API_URL` needed.** In dev, Next.js rewrites proxy `/api/*` to localhost:8080. In prod, Nginx handles it.

---

## Project Structure

```
MentorMatch/
├── mentormatch-backend/          # FastAPI + Docker
│   ├── app/
│   │   ├── api/endpoints/        # Route handlers (chat, admin)
│   │   ├── core/                 # Config, DB, auth, security
│   │   ├── middleware/           # Rate limiter, prompt guard, SQLi filter
│   │   ├── models/               # SQLAlchemy models
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   └── services/             # ChatVat integration service
│   ├── docker-compose.yml        # PostgreSQL + Backend containers
│   ├── Dockerfile
│   └── .env.sample               # Template for environment variables
│
├── mentormatch-frontend/         # Next.js 16 + React 19
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── (public)/         # Homepage, about, contact
│   │   │   └── (admin)/          # Login, dashboard, analytics, SQL console
│   │   ├── components/           # UI components (chat, admin, shared)
│   │   ├── hooks/                # useAuth, useChat
│   │   ├── lib/                  # Axios, auth, utils
│   │   └── types/                # TypeScript interfaces
│   └── .env.sample               # Template for public env vars
│
└── Archive/                      # Personal notes (gitignored)
```

---

## Features

### Public
- Chat with AI to find mentors by project topic
- Faculty directory browsing
- Feedback submission with star ratings
- Dark/light theme with animated UI

### Admin Dashboard (Google OAuth)
- Real-time analytics (traffic, latency, tokens)
- Security monitoring (rate limits, injection attempts — persisted to DB)
- Feedback management (resolve/unresolve)
- User management (add/revoke admins with role-based access)
- SQL console with schema reference (read-only)
- System health (CPU, RAM, DB status, ChatVat status)

---

## Deployment

See [Archive/Deployment-Guide.md](Archive/Deployment-Guide.md) for a step-by-step guide to deploy on AWS EC2 (t3.small) with Docker, Nginx, and auto-deploy via GitHub webhook.

---

## License

Private — Capstone project for Thapar Institute of Engineering & Technology.
