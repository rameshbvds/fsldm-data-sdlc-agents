# FSLDM AI · Data SDLC Console

[![Live](https://img.shields.io/badge/live-fsldm.vercel.app-c9a961)](https://fsldm.vercel.app)
[![API](https://img.shields.io/badge/api-render-10b981)](https://fsldm-data-sdlc-agents.onrender.com/api/health)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)

AI-powered scaffolding for **FSLDM (Financial Services Logical Data Model)** data warehouse
migrations. Drop your Excel mapping spec or use the bundled FSLDM deposit schema and the
platform auto-resolves ~80% of column lineage, flags the rest for human review, and emits
dialect-correct SQL skeletons + data-quality test suites in seconds.

> **Honest scope:** this is a *scaffolding* tool, not a turnkey migration. Output SQL has
> placeholder JOINs that an analyst must fill. The agent flags ambiguity — it does not
> resolve it. See [What it is / isn't](#what-it-is--isnt) below.

---

## Live demo

| Surface | URL | Notes |
|---|---|---|
| **Web app** | <https://fsldm.vercel.app> | Vercel · Hobby tier · auto SSL |
| **API** | <https://fsldm-data-sdlc-agents.onrender.com/api/health> | Render · Free tier · sleeps after 15 min idle |
| **Code** | <https://github.com/rameshbvds/fsldm-data-sdlc-agents> | Private |

First request after idle takes ~30-50s (Render cold start). Subsequent runs are fast.

---

## What it is / isn't

### Today — what it does
- Reads source ODS + target FSLDM JSON schemas (or parses an `.xlsx` mapping spec)
- Auto-resolves direct column-name matches between source and target
- Flags ambiguous mappings as `open_question` with confidence scores (never invents lineage)
- Emits Teradata + dbt SQL skeletons (sqlglot-validated)
- Generates GX / Soda / BTEQ test stubs from FSLDM column-name conventions
- Persists every run + reviewer decision to an audit trail

### Today — what it doesn't
- Doesn't produce runnable SQL — JOIN keys are `/* TODO */` placeholders
- Doesn't solve open questions — judgment stays human
- Doesn't run against a real warehouse — generation only
- Test stubs are templates, not domain-specific business rules

---

## Architecture

```
┌─────────────────────────┐    HTTPS    ┌──────────────────────────┐
│ Vercel  (Next.js 16)    │ ──────────▶ │ Render  (FastAPI · uvicorn)│
│ fsldm.vercel.app        │             │ fsldm-data-sdlc-agents...  │
│ App Router · Tailwind v3│             │ openpyxl · sqlglot · …    │
└─────────────────────────┘             └──────────────────────────┘
                                                      │
                                                      ▼
                                          OpenRouter API (LLM review)
                                          claude-sonnet-4.6
```

### Backend pipeline (LangGraph)
```
Mapping Agent ─▶ HITL Gate ─▶ Dev Agent ─▶ Testing Agent
   │                              │              │
   └─ MappingSpec JSON             └─ SQL+dbt     └─ GX + Soda + BTEQ
```

| Stage | Module | Output |
|---|---|---|
| Excel Parse (optional) | `agents/excel_loader.py` | `MappingSpec` from `.xlsx` |
| Mapping | `agents/mapping_agent.py` | `MappingSpec` (heuristic + LLM review note) |
| HITL | LangGraph `interrupt_before` | approve / revise / reject + feedback |
| Dev | `agents/dev_agent.py` | `sql_teradata/*.gen.sql`, `sql_dbt_gen/*.sql` |
| Testing | `agents/testing_agent.py` | `gx/*.gen.json`, `soda/*.gen.yml`, `sql_bteq/*.gen.sql` |

---

## Quick start (local)

### Prereqs
- Python 3.12
- Node 20+
- `claude` CLI (free dev mode) **or** `OPENROUTER_API_KEY` **or** `ANTHROPIC_API_KEY`

### Backend
```bash
cd fsldm-data-sdlc-agents
make setup        # creates .venv, installs deps
cp .env.example .env   # add OPENROUTER_API_KEY etc.
make run          # CLI pipeline (terminal-only)
```

### Frontend (Next.js)
```bash
cd web
npm install --legacy-peer-deps
npm run dev       # http://localhost:3000
```

### Full stack via Docker
```bash
docker compose up --build
# api  → http://localhost:8000
# web  → http://localhost:3000
```

---

## LLM provider (factory pattern)

Configured in `agents/llm.py`. Choose via `LLM_PROVIDER` env var:

| Value | Backend | When |
|---|---|---|
| `openrouter` | OpenAI-compatible OpenRouter API | Demos / one-month deploys |
| `anthropic` | `langchain-anthropic` direct | Production, native Claude API |
| `claude_code` | Local `claude` CLI | Free dev mode |
| `auto` *(default)* | OpenRouter > Anthropic > local CLI based on env vars | Mixed |

**OpenRouter setup:**
```bash
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=anthropic/claude-sonnet-4.6   # latest sonnet on OpenRouter
```

---

## Excel mapping spec format

Drop any `.xlsx` matching this layout (sheets named `FCT_*` or `DIM_*`):

| Sheet | Purpose |
|---|---|
| `COVER` | Mapping ID · Source System · Target System (key/value rows) |
| `SOURCE_SCHEMA` | header `Table \| Column \| Data Type \| Nullable \| PK \| FK/Notes` |
| `FCT_DPOS_BAL` (etc.) | row 1 = title, row 2 = header `Target Column \| Type \| Null \| Transform \| Source Table(s) \| Source Expression \| Products \| Notes`, rows 3+ = mappings |
| `JOIN_TOPOLOGY` | optional |
| `BUSINESS_RULES` | optional |

The bundled `FSLDM_Deposit_Mapping_Spec_COMPLETE.xlsx` is a working reference.

---

## Folder structure

```
fsldm-data-sdlc-agents/
├── agents/                       # LangGraph pipeline
│   ├── state.py                  # Pydantic models (MappingSpec, Artifact, TestReport)
│   ├── llm.py                    # LLM factory: openrouter | anthropic | claude_code
│   ├── excel_loader.py           # Excel mapping-spec parser (openpyxl)
│   ├── mapping_agent.py          # Stage 1
│   ├── dev_agent.py              # Stage 3 (SQL + dbt emit, sqlglot-validated)
│   ├── testing_agent.py          # Stage 4 (GX + Soda + BTEQ stubs)
│   ├── graph.py                  # LangGraph state machine
│   ├── main.py                   # Typer CLI
│   ├── runs.py                   # SQLite persistence (audit trail)
│   ├── contacts.py               # Contact form submissions
│   ├── config.py                 # pydantic-settings
│   ├── logging_setup.py          # structlog + PII redaction
│   └── sql_validate.py           # sqlglot CLI
│
├── api/
│   └── server.py                 # FastAPI: /api/runs, /api/runs/from-excel, /api/health
│
├── web/                          # Next.js 16 App Router frontend
│   ├── app/
│   │   ├── page.tsx              # Dashboard (hero, problem/solution, pipeline, features)
│   │   ├── pipeline/page.tsx     # Run Pipeline (Excel upload + dialect picker)
│   │   ├── about/page.tsx        # Architecture + Built by Ramesh V
│   │   ├── history/page.tsx      # Audit trail
│   │   ├── contact/page.tsx      # Contact form
│   │   └── built-by/ramesh/page.tsx  # Architect deep-dive
│   ├── components/
│   │   ├── ui/                   # shadcn-style primitives (Button, Card, Badge)
│   │   ├── nav.tsx · footer.tsx · hero.tsx
│   │   ├── pipeline-flow.tsx     # Animated SVG flow diagram
│   │   ├── stage-detail.tsx      # Stage deep-dive cards
│   │   ├── stat-card.tsx · count-up.tsx · scroll-reveal.tsx
│   │   ├── gradient-orbs.tsx · marquee.tsx
│   │   └── ocbc-mark.tsx
│   ├── lib/api.ts · lib/utils.ts
│   ├── tailwind.config.ts · next.config.mjs · package.json
│
├── schemas/                      # Bundled FSLDM deposit schemas (JSON)
├── sql_teradata/ · sql_dbt_gen/  # Generated SQL artifacts (*.gen.sql)
├── gx/ · soda/ · sql_bteq/       # Generated test artifacts (*.gen.*)
├── tests/                        # pytest suite (10 tests)
├── data/                         # SQLite runtime state (gitignored)
│
├── .claude/                      # Claude Code subagents · skills · hooks · settings
├── .mcp.json                     # MCP server config
├── CLAUDE.md                     # Project rules for AI assistants
├── docs/UAT_GUIDE.md             # UAT tester instructions
│
├── Dockerfile · Dockerfile.api   # Web + API container images
├── docker-compose.yml · render.yaml
├── pyproject.toml · Makefile · requirements-dev.txt
├── FSLDM_Deposit_Mapping_Spec_COMPLETE.xlsx   # Reference Excel spec
└── README.md
```

---

## Key features

| Feature | Detail |
|---|---|
| **Excel ingestion** | Drag-drop `.xlsx` mapping spec — parsed by openpyxl, routed through pipeline |
| **7 SQL dialects** | One source schema → Teradata · Snowflake · Redshift · BigQuery · Databricks · Postgres · DuckDB |
| **PII Guards** | Source-flagged PII columns redacted in logs, blocked at write-time via PreTool hook |
| **sqlglot Validation** | Every emitted SQL statement parses for declared dialect or fails the build |
| **Honest Open Questions** | Low-confidence mappings are flagged, not invented (heuristic-first design) |
| **HITL First** | AI never ships unreviewed lineage — approve / revise / reject before SQL emit |
| **Audit Trail** | Every run + decision + feedback persists in SQLite — searchable by `run_id` |
| **Animated UI** | Banking-grade Next.js + Tailwind + Framer Motion + Recharts + custom SVG flow |

---

## Deployment (production)

### Vercel (frontend)
```bash
cd web
vercel link --yes --scope=<your-team>
vercel env add API_URL production    # set to your Render URL
vercel deploy --prod
```

### Render (backend, free tier — sleeps after 15 min)
1. Render dashboard → **New +** → **Web Service** → connect GitHub repo
2. **Language:** Docker · **Dockerfile Path:** `./Dockerfile.api` · **Plan:** Free
3. Env vars: `LLM_PROVIDER=openrouter`, `OPENROUTER_API_KEY=...`, `OPENROUTER_MODEL=anthropic/claude-sonnet-4.6`
4. Deploy — wait ~3-4 min for first build

Total cost for one-month demo on free tiers: **$0** (excludes OpenRouter usage which is ~$0.01/run).

---

## Built by

**Ramesh V** — Assistant Vice President at <span style="color:#ED1C24"><b>OCBC Bank</b></span>, Singapore

Senior Software Analyst with deep experience in banking data warehousing. FSLDM (Teradata) ·
Informatica PowerCenter · Oracle PL/SQL · ETL design.

- LinkedIn: <https://www.linkedin.com/in/ramesh-v-361baa80/>
- Email: rameshbvds@gmail.com

Career: Tata Consultancy Services (2008–11) → Oracle India (2011–14) → Dell International
Services (2014–21) → OCBC Bank (2021–present).

---

## Tech stack

**Backend** Python 3.12 · FastAPI · LangGraph · openpyxl · sqlglot · structlog · Pydantic v2

**LLM** Claude Sonnet 4.6 (via OpenRouter) · Anthropic API · local Claude CLI

**Frontend** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v3 · shadcn/ui patterns
· Framer Motion · Recharts · Lucide icons

**Infra** Vercel · Render · Docker · GitHub · OpenRouter

**Quality** sqlglot validation · PII redaction hooks · pytest · structured audit log

---

## Roadmap (next 30 days)

- [ ] Search + filter on field-level lineage table
- [ ] SQL syntax highlighting via Shiki
- [ ] Mobile-responsive lineage cards
- [ ] Per-user auth (replace shared password with email magic link)
- [ ] Real LLM-driven lineage discovery (vs current heuristic-only)
- [ ] FK metadata inference for JOIN-key resolution
- [ ] dbt project bootstrap from generated artifacts
- [ ] OpenTelemetry export for observability

---

## License

MIT
