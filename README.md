# FSLDM AI · Data SDLC Console

[![Live](https://img.shields.io/badge/live-fsldm.vercel.app-c9a961)](https://fsldm.vercel.app)
[![API](https://img.shields.io/badge/api-render-10b981)](https://fsldm-data-sdlc-agents.onrender.com/api/health)
[![Stages](https://img.shields.io/badge/4%2F4_stages-verified-emerald)](#verified-end-to-end)
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
| **API health** | <https://fsldm-data-sdlc-agents.onrender.com/api/health> | Render · Free tier · sleeps after 15 min idle |
| **Source** | <https://github.com/rameshbvds/fsldm-data-sdlc-agents> | Private repo |

First request after idle takes ~30-50s (Render cold start). Subsequent runs are fast.

---

## Verified end-to-end

End-to-end smoke test against the live API (run `b1cc17a13453`):

```
STAGE 01 Mapping  ✓ PASS  · 3 facts · 80 fields · 14 open Qs · 226ms
STAGE 02 HITL     ✓ PASS  · approve persisted · feedback captured
STAGE 03 Develop  ✓ PASS  · 7 artifacts (Teradata SQL + dbt + schema.yml) · 241ms
STAGE 04 Testing  ✓ PASS  · 57 GX expectations · 16 Soda checks · 12 BTEQ stmts
```

---

## What it is / isn't

### Today — what it does
- Reads source ODS + target FSLDM JSON schemas, **or parses an `.xlsx` mapping spec**
- Auto-resolves direct column-name matches between source and target
- Flags ambiguous mappings as `open_question` with confidence scores (never invents lineage)
- Emits Teradata + dbt SQL skeletons (sqlglot-validated)
- Generates Great Expectations / Soda / BTEQ test stubs from FSLDM column-name conventions
- Persists every run + reviewer decision to a SQLite audit trail

### Today — what it doesn't
- Doesn't produce runnable SQL — JOIN keys are `/* TODO */` placeholders
- Doesn't solve open questions — judgment stays human
- Doesn't run against a real warehouse — generation only
- Test stubs are templates, not domain-specific business rules

---

## Two input paths

### A) Bundled FSLDM Demo (zero setup)
Click the **"Bundled FSLDM Demo"** tile on `/pipeline`. Uses pre-loaded `schemas/deposit_source.json` (13 ODS tables) and `schemas/deposit_target.json` (3 FSLDM facts).

### B) Upload your Excel mapping spec
Click **"Upload Excel Mapping Spec"** → drag-drop an `.xlsx` file. Parser expects sheets named `FCT_*` or `DIM_*` with this header row:

| `Target Column` | `Type` | `Null` | `Transform` | `Source Table(s)` | `Source Expression` | `Products` | `Notes` |

The bundled `FSLDM_Deposit_Mapping_Spec_COMPLETE.xlsx` is a working reference that produces 3 facts × 80 fields with full lineage and 0 open questions.

---

## Architecture

```
┌─────────────────────────┐    HTTPS    ┌──────────────────────────┐
│ Vercel  (Next.js 16)    │ ──────────▶ │ Render  (FastAPI uvicorn)│
│ fsldm.vercel.app        │             │ fsldm-data-sdlc-agents...│
│ App Router · Tailwind   │             │ openpyxl · sqlglot · …   │
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

## Frontend — tier-1-bank-grade UX

### Pages

| Route | Purpose |
|---|---|
| `/` | Dashboard — hero, problem/solution, animated pipeline flow, stage deep-dives, features grid, tech marquee |
| `/pipeline` | Run pipeline — Excel upload + bundled preset, dialect picker, mapping overview, field-level lineage, HITL form, artifact downloads |
| `/about` | Architecture overview + animated flow diagram + stage deep-dives + Built-by-Ramesh-V card + 7 dialects grid |
| `/built-by/ramesh` | Architect deep dive — verified bio, career, certifications |
| `/history` | Audit trail (run history, filterable by run ID) |
| `/contact` | Contact form (persists to `data/contacts.db`) |

### Mapping Overview — visual
- 4 animated stat cards (Total · High Confidence · Open Qs · Avg Confidence)
- Per-Table Coverage chart (Recharts grouped bars · gold for fields, red for open)
- Confidence Tiers card (animated horizontal progress bars)

### Field-Level Lineage — tier-1-bank-grade
- **Search box** — filter by target column, source expr, or transform note
- **Filter chips** — `All · High · Mid · Low · Open Q` with live counts
- **Color-coded left border** per row (emerald · amber · red · OCBC red)
- **SQL syntax highlighting** in `source_expr` (custom inline tokenizer, zero deps)
- **Copy button** appears on hover · clipboard write · checkmark feedback
- **Sticky table header** when scrolling (max-height 600px)
- **Smooth Framer Motion** expand/collapse instead of native `<details>`
- **One-table-at-a-time** toggle for less visual noise
- **Mobile fallback** — auto-switches to stacked card layout below 768px

### Open Questions — separate card grid
- Standalone block under field-level lineage
- 3-column grid (1 on mobile)
- Each card: table name pill (OCBC red) · question number · text
- Empty state: green "No open questions ✓" badge

### Animations across the app
- `<GradientOrbs />` — 3 floating colored orbs (gold, blue, emerald) with 22-28s loop
- `<ScrollReveal />` — fade-up on scroll-into-view (cubic-bezier easing)
- `<CountUp />` — numbers tick from 0 to target
- `<Marquee />` — infinite-scroll tech badges with edge-fade mask
- `<PipelineFlow />` — animated SVG diagram with flowing particles (Inputs → Agents → Outputs)
- `<StageDetail />` — alternating left/right deep-dive cards with Before/After SQL samples

### Available but not wired (one push away)
- `<CoverageBars />` — segmented stacked bars per table (high/mid/low/open colors, animated fill)
- `<ConfidenceDonut />` — SVG radial donut with hover slices + center stat
Files exist in `web/components/`. Swap into `pipeline/page.tsx` to upgrade beyond Recharts defaults.

---

## LLM provider (factory pattern)

Configured in `agents/llm.py`. Choose via `LLM_PROVIDER` env var:

| Value | Backend | When |
|---|---|---|
| `openrouter` | OpenAI-compatible OpenRouter API | Demos / one-month deploys |
| `anthropic` | `langchain-anthropic` direct | Production, native Claude API |
| `claude_code` | Local `claude` CLI | Free dev mode |
| `auto` *(default)* | OpenRouter > Anthropic > local CLI based on env vars | Mixed |

**OpenRouter setup (currently live):**
```bash
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=anthropic/claude-sonnet-4.6
```

---

## Quick start (local)

### Prereqs
- Python 3.12
- Node 20+
- `claude` CLI (free dev mode) **or** `OPENROUTER_API_KEY` **or** `ANTHROPIC_API_KEY`

### Backend
```bash
cd fsldm-data-sdlc-agents
make setup                      # creates .venv, installs deps
cp .env.example .env            # add OPENROUTER_API_KEY etc.
.venv/Scripts/python.exe -m uvicorn api.server:app --port 8000  # FastAPI
```

### Frontend
```bash
cd web
npm install --legacy-peer-deps
npm run dev                     # http://localhost:3000
```

### Full stack via Docker
```bash
docker compose up --build
# api  → http://localhost:8000
# web  → http://localhost:3000
```

---

## Deployment (production)

### Frontend → Vercel
```bash
cd web
vercel link --yes --scope=<your-team>
vercel env add API_URL production    # set to your Render URL
vercel deploy --prod
```

### Backend → Render (free tier · sleeps after 15 min)
1. Render dashboard → **New +** → **Web Service** → connect GitHub repo
2. **Language:** Docker · **Dockerfile Path:** `./Dockerfile.api` · **Plan:** Free
3. Env vars:
   - `LLM_PROVIDER=openrouter`
   - `OPENROUTER_API_KEY=...`
   - `OPENROUTER_MODEL=anthropic/claude-sonnet-4.6`
4. Deploy — wait ~3-4 min for first build

**Total cost for one-month demo:** $0 (excludes OpenRouter usage at ~$0.01/run)

---

## Folder structure

```
fsldm-data-sdlc-agents/
├── agents/                       # LangGraph pipeline
│   ├── state.py                  # Pydantic models (MappingSpec, Artifact, TestReport)
│   ├── llm.py                    # LLM factory: openrouter | anthropic | claude_code
│   ├── excel_loader.py           # Excel mapping-spec parser (openpyxl)
│   ├── mapping_agent.py          # Stage 1 — heuristic + LLM review
│   ├── dev_agent.py              # Stage 3 — SQL + dbt emit, sqlglot-validated
│   ├── testing_agent.py          # Stage 4 — GX + Soda + BTEQ stubs
│   ├── graph.py                  # LangGraph state machine
│   ├── main.py                   # Typer CLI entry
│   ├── runs.py                   # SQLite persistence (audit trail)
│   ├── contacts.py               # Contact form submissions
│   ├── config.py                 # pydantic-settings
│   ├── logging_setup.py          # structlog + PII redaction
│   └── sql_validate.py           # sqlglot CLI
│
├── api/
│   └── server.py                 # FastAPI: /api/runs, /api/runs/from-excel, /api/contact, /api/health
│
├── web/                          # Next.js 16 frontend
│   ├── app/
│   │   ├── page.tsx              # Dashboard
│   │   ├── pipeline/page.tsx     # Run pipeline (Excel upload + dialect)
│   │   ├── about/page.tsx        # Architecture + Built-by-Ramesh-V
│   │   ├── built-by/ramesh/page.tsx   # Architect deep dive
│   │   ├── history/page.tsx      # Audit trail
│   │   ├── contact/page.tsx      # Contact form
│   │   ├── layout.tsx · globals.css
│   ├── components/
│   │   ├── ui/                   # shadcn-style primitives (Button, Card, Badge)
│   │   ├── nav.tsx · footer.tsx · hero.tsx
│   │   ├── pipeline-flow.tsx     # Animated SVG flow diagram
│   │   ├── stage-detail.tsx      # Before/After SQL samples per stage
│   │   ├── stage-timeline.tsx    # 4-stage progress strip
│   │   ├── mapping-table.tsx     # Search · filters · SQL highlight · copy · cards
│   │   ├── open-questions-grid.tsx    # Card grid grouped by table
│   │   ├── coverage-bars.tsx     # (Available — segmented stacked bars)
│   │   ├── confidence-donut.tsx  # (Available — SVG radial donut)
│   │   ├── stat-card.tsx · count-up.tsx · scroll-reveal.tsx
│   │   ├── gradient-orbs.tsx · marquee.tsx · ocbc-mark.tsx
│   ├── lib/api.ts · lib/utils.ts · lib/sql-highlight.tsx
│   ├── tailwind.config.ts · next.config.mjs · package.json · Dockerfile
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
| **AI-powered** | Claude Sonnet 4.6 via OpenRouter for review notes; heuristic-first lineage |
| **Excel ingestion** | Drag-drop `.xlsx` mapping spec — parsed by openpyxl |
| **7 SQL dialects** | One source schema → Teradata · Snowflake · Redshift · BigQuery · Databricks · Postgres · DuckDB |
| **PII Guards** | Source-flagged PII columns redacted in logs, blocked at write-time via PreTool hook |
| **sqlglot Validation** | Every emitted SQL parses for declared dialect or fails the build |
| **Honest Open Questions** | Low-confidence mappings flagged, not invented |
| **HITL First** | AI never ships unreviewed lineage — approve / revise / reject before SQL emit |
| **Audit Trail** | Every run + decision + feedback persists in SQLite — searchable by `run_id` |
| **Tier-1 UI** | Search · 5 filter chips · SQL syntax highlight · row tints · copy buttons · sticky headers · mobile cards |
| **OCBC-accent design** | Banking navy + gold premium palette; OCBC red used sparingly on open questions and architect mark |
| **Animated** | Framer Motion · gradient orbs · count-up · scroll-reveal · marquee · custom SVG pipeline flow |

---

## Built by

**Ramesh V** — Assistant Vice President at **OCBC Bank**, Singapore

Senior Software Analyst with deep experience in banking data warehousing.
FSLDM (Teradata) · Informatica PowerCenter · Oracle PL/SQL · ETL design.

- LinkedIn: <https://www.linkedin.com/in/ramesh-v-361baa80/>
- Email: rameshbvds@gmail.com

Career: Tata Consultancy Services (2008–11) → Oracle India (2011–14) → Dell International
Services (2014–21) → OCBC Bank (2021–present).

Certifications: Teradata 12 Basic · Informatica 9.x Developer Specialist.

---

## Tech stack

**Backend** Python 3.12 · FastAPI · LangGraph · openpyxl · sqlglot · structlog · Pydantic v2 · python-multipart

**LLM** Claude Sonnet 4.6 (via OpenRouter) · Anthropic API · local Claude CLI

**Frontend** Next.js 16 (App Router) · React 19 · TypeScript 5.7 · Tailwind v3 · shadcn/ui patterns · Framer Motion 11 · Recharts 2 · Lucide icons

**Infra** Vercel · Render · Docker · GitHub · OpenRouter

**Quality** sqlglot validation · PII redaction hooks · pytest (10 tests) · structured audit log

---

## Roadmap (next 30 days)

- [ ] Wire `<CoverageBars />` and `<ConfidenceDonut />` into pipeline page (replace Recharts defaults)
- [ ] Per-user auth (replace shared password with email magic-link)
- [ ] Real LLM-driven lineage discovery (vs current heuristic-only)
- [ ] FK metadata inference for JOIN-key resolution
- [ ] dbt project bootstrap from generated artifacts
- [ ] OpenTelemetry export for observability
- [ ] PDF audit report export per run

---

## License

MIT
