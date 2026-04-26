# FSLDM Deposit Data SDLC Agents — Project Rules

You are working in a multi-agent data warehouse pipeline that maps a banking ODS to the FSLDM
(Financial Services Logical Data Model) Teradata EDW, with portability to Snowflake / Redshift /
BigQuery / Databricks / Postgres / DuckDB via dbt.

## Non-Negotiables

1. **Never invent column lineage.** If a target column has no clear source, emit it as an
   `open_question` in the MappingSpec — never fabricate.
2. **PII discipline.** Columns flagged `pii: true` (PRTY_FULL_NM, DOB_DT, etc.) MUST NOT be logged,
   echoed in error messages, or written to console output. Mask with `***` when sampling.
3. **Dialect-aware SQL.** Always validate generated SQL with sqlglot before writing to disk.
   `agents.sql_validate.assert_dialect_valid(sql, dialect)`.
4. **Idempotent generation.** All generators must produce byte-identical output for the same
   input. No timestamps, no random IDs in artifacts.
5. **No live warehouse calls.** This repo *generates* SQL/checks; it does not execute them. Any
   subagent that needs to run SQL must do so via the `db-reader` MCP server, read-only.

## Architecture (one-line each)

- `agents/state.py` — Pydantic models (FieldMapping, TargetTable, MappingSpec, Artifact, TestReport)
- `agents/llm.py` — LLM factory; `LLM_PROVIDER=claude_code` (dev) | `anthropic` (prod)
- `agents/mapping_agent.py` — Stage 1: heuristic mapper + Claude review
- `agents/dev_agent.py` — Stage 3: emit Teradata SQL + dbt models
- `agents/testing_agent.py` — Stage 4: emit GX expectations, Soda checks, BTEQ
- `agents/graph.py` — LangGraph: Mapping → HITL → Dev → Testing
- `agents/main.py` — Typer CLI entry

## Standing Commands

- Run pipeline: `make run` (or `python -m agents.main run --dialect teradata --hitl-decision approve`)
- Tests: `make test` (`pytest -q`)
- Lint SQL: `make lint-sql`
- Type check: `make typecheck`

## Conventions

- **Naming:** target tables `FCT_*` / `DIM_*`, columns SCREAMING_SNAKE, IDs `*_ID`, dates `*_DT`,
  amounts `*_AMT`, indicators `*_IND` (Y/N), codes `*_CD`.
- **Test artifacts** live in `gx/`, `soda/`, `sql_bteq/`. Generated artifacts use `*.gen.*`
  suffix; hand-curated do not.
- **Open questions** are first-class — surface in the HITL stage table, never silently dropped.

## Memory Discipline

Subagents that touch mappings or SQL MUST update `MEMORY.md` with new patterns or recurring
issues observed. Keep `MEMORY.md` < 25KB. Prune entries older than two release cycles.

## When to use the LLM

- Free-text review and risk callouts → yes, via `agents.llm.get_llm()`
- Field mapping derivation → **no**, use deterministic heuristics first; LLM only for ambiguous cases
- SQL generation → templated; LLM only for transform notes
- Test expectation expansion → templated by column-name suffix conventions

This keeps cost predictable and outputs idempotent.
