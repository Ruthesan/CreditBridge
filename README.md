# CreditBridge

**AI Credit Intelligence Platform** for Nigerian SMEs. A business uploads a bank
statement; four backend agents — intake, analysis, scoring, and advisor — turn
it into a plain-language readiness verdict against real lender criteria, with
a ranked, AI-generated improvement plan. The frontend is a full enterprise
fintech SaaS dashboard built to feel like Stripe, Ramp, or Linear.

## Architecture

```
Trigger (upload or monthly cron)
        ↓
  Orchestrator
        ↓
  Intake agent      → normalizes messy statement exports into a typed Transaction contract
        ↓
  Analysis agent     → pure computation: cash flow volatility, revenue trend, ratios
        ↓
  Scoring agent      → deterministic weighted rubric against 3 lender profiles
        ↓
  Advisor agent       → explains the fixed scores in plain language, never re-scores
        ↓
  Readiness report
```

Every agent is independently testable. Intake and advisor call an LLM (Claude);
analysis and scoring are pure Python and never touch a model — a credit
decision needs to be deterministic and auditable, not a black box.

## Project structure

```
backend/
  app/
    agents/            # the four agents + lender rubric config
    routers/            # auth + pipeline HTTP endpoints
    orchestrator.py       # chains the agents, hard-stop guard on bad data
    scheduler.py            # monthly automated re-check with skip-if-unchanged
    llm_client.py             # live Anthropic calls + deterministic mock mode
  evals/                        # golden-case eval harness (see backend README notes below)
  tests/                          # pytest API/auth/tenant-isolation suite

frontend/
  src/
    components/
      ui/               # Button, Card, Modal, Table, CircularGauge, Tabs, Tooltip, etc.
      layout/            # Sidebar, Topbar, DashboardLayout, AuthLayout, ProtectedRoute
      marketing/          # Landing page sections
      dashboard/ analysis/ recommendations/ lenders/ upload/   # feature-specific composites
      charts/                # Recharts wrappers (score trend, cash flow, revenue)
    pages/                     # one file per route
    contexts/                    # Auth, Toast, Notifications (React Context, no Redux)
    hooks/                        # useLatestRun, useScoreHistory, useRunHistory, usePreferences
    lib/                           # api.ts (axios client), utils.ts, validation.ts (zod)
    types.ts                        # mirrors backend Pydantic schemas exactly
  nginx.conf, Dockerfile              # production static-serve + API reverse proxy

DECISIONS.md                              # judgment calls made along the way, and why
```

## Running it locally

### Backend

Needs a running Postgres instance first — either the one in `docker-compose.yml`:

```bash
docker compose up db
```

or your own local Postgres, matching (or overriding via `.env`) the default
in `app/config.py`: `postgresql://creditbridge:creditbridge@localhost:5432/creditbridge`.

Then:

```bash
cd backend
pip install -r requirements.txt --break-system-packages
python -m uvicorn app.main:app --reload --port 8000
```

Runs in **mock LLM mode** by default — no Anthropic API key needed. You can
register, upload a statement, and see a full readiness report immediately.

To use the real Claude API instead:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export LLM_MODE=live
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`, proxying API calls to the backend on `:8000`
(see `vite.config.ts`). No environment variables are required in development.

### Tests

```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest tests/ -v
```

### Eval harness

```bash
cd backend
python -m evals.run_evals
```

### Frontend build & typecheck

```bash
cd frontend
npm run build     # tsc -b && vite build
```

### Docker (full stack)

```bash
docker compose up --build
```

Backend on `:8000`, frontend on `:80` via nginx (`frontend/nginx.conf` proxies
`/auth`, `/webhook`, `/pipeline`, `/lenders` straight to the backend container
— the same routes the Vite dev proxy handles locally). Runs in mock LLM mode
by default; set `ANTHROPIC_API_KEY` and `LLM_MODE=live` before running compose
to use the real Claude API.

## What the frontend actually talks to

The frontend consumes exactly four backend resources — no invented endpoints:

| Endpoint | Used for |
|---|---|
| `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Account creation, sign-in, session hydration |
| `POST /webhook/statement-upload` | Uploading a statement, kicks off a pipeline run |
| `GET /pipeline/status/{run_id}`, `GET /pipeline/runs` | Polling a run, dashboard data, analysis history, score-trend reconstruction |
| `GET /lenders` | Lender comparison criteria |

A few screens the original spec called for — password reset delivery, profile
editing, notifications, PDF generation — have no corresponding backend
endpoint yet. Rather than fabricate data or fake success states, each of
these was either (a) built against real derived data where possible
(notifications reconstructed from actual pipeline run transitions, score
history reconstructed from real run records), or (b) clearly marked in the UI
and in code comments as pending backend work. The full reasoning for every
one of these calls is in **DECISIONS.md**.

## Database

PostgreSQL, by default — a fintech app needs real concurrent-write handling
and transaction isolation, which SQLite doesn't give you. `docker-compose.yml`
runs a Postgres 16 container out of the box; point `DATABASE_URL` at a managed
Postgres instance (RDS, Supabase, etc.) for production.

Tests still run against a local SQLite file for speed and isolation
(`tests/conftest.py` sets `DATABASE_URL` explicitly before the app imports) —
that's a deliberate, contained exception, not a sign Postgres is optional
elsewhere. `app/database.py` supports both via the same `DATABASE_URL` env
var; nothing else needs to change to switch.

## Production safety

The backend refuses to start with `ENV=production` if it detects the default
JWT secret, mock LLM mode, or a SQLite database. See
`app/config.py::validate_production_settings`.
