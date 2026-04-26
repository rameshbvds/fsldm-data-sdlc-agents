# FSLDM Data SDLC Agents

Multi-agent SDLC pipeline for **FSLDM (Financial Services Logical Data Model)** Deposit data
warehousing — `Mapping → HITL Review → Development → Testing` powered by LangGraph, with
production-grade Claude Code orchestration (skills, subagents, hooks, CI).

Targets Teradata today; portable to Snowflake / Redshift / BigQuery / Databricks / Postgres /
DuckDB via dbt.

---

## Quick start

```bash
make setup                  # creates .venv (Python 3.12) and installs dev deps
make run                    # full pipeline, dialect=teradata, local Claude CLI for LLM
make run DIALECT=snowflake  # dbt/Snowflake output
make test                   # pytest
make lint-sql               # sqlglot validate every generated SQL
make dry                    # plan only, no LLM calls
```

For production with the API:
```bash
export ANTHROPIC_API_KEY=sk-ant-...
LLM_PROVIDER=anthropic make run
```

---

## Pipeline

```
Mapping Agent ─▶ HITL Gate ─▶ Dev Agent ─▶ Testing Agent
   │                              │              │
   └─ MappingSpec JSON             └─ SQL+dbt     └─ GX + Soda + BTEQ
```

| Stage | Module | Output |
|---|---|---|
| Mapping | `agents/mapping_agent.py` | `MappingSpec` (3 facts × ~80 fields) |
| HITL | `agents/graph.py` (interrupt_before) | approve / revise / reject |
| Dev | `agents/dev_agent.py` | `sql_teradata/*.gen.sql`, `sql_dbt_gen/*.sql`, `schema.gen.yml` |
| Testing | `agents/testing_agent.py` | `gx/*.gen.json`, `soda/*.gen.yml`, `sql_bteq/*.gen.sql` |

---

## Claude Code Orchestration (April 2026 stack)

This repo follows the principal-grade Claude Code playbook: skills, subagents, hooks, MCP, CI.

| Layer | Path | Purpose |
|---|---|---|
| **Project rules** | `CLAUDE.md` | Non-negotiables loaded into every session |
| **Settings** | `.claude/settings.json` | Permissions allowlist/denylist, sandbox, hooks, env |
| **Subagents** | `.claude/agents/*.md` | `mapping-architect`, `sql-developer`, `data-test-writer`, `data-reviewer`, `pipeline-debugger` |
| **Skills** | `.claude/skills/*/SKILL.md` | `/run-pipeline`, `/add-target-table`, `/validate-mapping`, `/regen-tests`, `/release-checklist` |
| **Hooks** | `.claude/hooks/*.sh` | `pii-scan`, `sqlglot-validate`, `prompt-injection-scan`, `pre-compact` |
| **MCP** | `.mcp.json` | github, postgres-readonly, context7 |
| **CI** | `.github/workflows/` | `ci.yml` (lint+type+test+sql), `claude-review.yml` (PR review) |

### Slash commands

```
/run-pipeline teradata      → run full pipeline, on failure hand off to pipeline-debugger
/add-target-table FCT_X X+Y → scaffold a new fact table, route to mapping-architect
/validate-mapping           → sqlglot lint every generated SQL
/regen-tests                → re-run testing agent only (fast)
/release-checklist          → pre-merge gate: typecheck + tests + sql + PII audit + reviewer
```

### Subagents

| Name | Model | Purpose |
|---|---|---|
| `mapping-architect` | opus | Field-level lineage; never invents a source |
| `sql-developer` | sonnet | Dialect-correct SQL via sqlglot |
| `data-test-writer` | sonnet | GX / Soda / BTEQ artifacts |
| `data-reviewer` | opus | Three-tier review (Critical/Warning/Suggestion) |
| `pipeline-debugger` | opus | Investigate failures, write regression tests |

Each writes patterns and recurring issues to `MEMORY.md` (≤ 25 KB, pruned).

### Hooks (deterministic gates)

- **PreToolUse Edit/Write** → `pii-scan.sh` blocks PII values being committed to source
- **PreToolUse Bash** → `prompt-injection-scan.sh` blocks suspicious egress / secret leaks
- **PostToolUse Edit/Write** → `sqlglot-validate.sh` re-validates any changed `*.gen.sql`
- **PreCompact** → `pre-compact.sh` snapshots commit log + artifact list

---

## Recommended Claude Code plugins (opt-in)

Install at user scope so they're available across projects without bloating `.claude/`:

```
/plugin marketplace add garrytan/gstack
/plugin install gstack@gstack
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

| Plugin | Why for this project |
|---|---|
| **gstack** | `/codex` cross-model SQL review, `/careful` + `/guard` destructive-op gates, `/freeze` edit lock |
| **ui-ux-pro-max** | Optional — only if a dashboards / data-viz frontend is added later |
| **gbrain** | NOT recommended for this repo — separate agent platform on Render/Railway, off-scope for a data-warehouse SDLC. See `scripts/install-claude-plugins.md` for context. |

The project ships a `cross-model-reviewer` subagent that wraps `/codex` for high-stakes lineage decisions. See `.claude/agents/cross-model-reviewer.md`.

---

## LLM provider

Configured in `agents/llm.py`. Choose via `LLM_PROVIDER` env var:

| Value | Backend | When |
|---|---|---|
| `claude_code` | Local `claude` CLI (no API key) | Dev / cost-free iteration |
| `anthropic` | `langchain-anthropic` (claude-opus-4-7) | Production / CI |
| `auto` (default) | API if `ANTHROPIC_API_KEY` set, else CLI | Mixed |

---

## Folder structure

```
fsldm-data-sdlc-agents/
├── agents/                       # LangGraph pipeline
│   ├── state.py                  # Pydantic models (MappingSpec, Artifact, TestReport)
│   ├── llm.py                    # LLM factory: claude_code | anthropic
│   ├── mapping_agent.py          # Stage 1
│   ├── dev_agent.py              # Stage 3
│   ├── testing_agent.py          # Stage 4
│   ├── graph.py                  # LangGraph state machine
│   ├── main.py                   # Typer CLI
│   ├── config.py                 # pydantic-settings
│   ├── logging_setup.py          # structlog + PII redaction
│   └── sql_validate.py           # sqlglot CLI
├── schemas/                      # source/target JSON
├── sql_teradata/ sql_dbt_gen/    # generated SQL
├── gx/ soda/ sql_bteq/           # generated test artifacts
├── tests/                        # pytest suite
├── .claude/                      # subagents, skills, hooks, settings
├── .github/workflows/            # CI + Claude review
├── pyproject.toml  Makefile  .mcp.json  CLAUDE.md  .env.example
```

---

## FSLDM conventions

- Tables: `FCT_*` / `DIM_*`
- Columns: SCREAMING_SNAKE; `*_ID` (key), `*_DT` (date), `*_AMT` (amount), `*_IND` (Y/N), `*_CD` (code)
- Generated artifacts use `*.gen.*` suffix; hand-curated do not
- PII columns are flagged in source schema (`pii: true`) and never echoed in logs

## Adding a new pipeline (e.g. Cards, Trade Finance)

1. Add `schemas/<domain>_source.json` and `schemas/<domain>_target.json`
2. Run `/add-target-table` skill (or invoke `mapping-architect` directly)
3. Approve via HITL prompt in `make run`
4. Review with `data-reviewer`, ship with `/release-checklist`

---

## Requirements

- Python 3.12
- `claude` CLI (for `LLM_PROVIDER=claude_code`) **or** `ANTHROPIC_API_KEY`
- Optional production extras: `pip install -e ".[prod]"` adds great-expectations, soda-core, dbt-core
