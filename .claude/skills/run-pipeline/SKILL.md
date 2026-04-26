---
name: run-pipeline
description: Run the full FSLDM Deposit SDLC pipeline (Mapping → HITL → Dev → Testing) for a given dialect. Use when the user says "run the pipeline", "regenerate everything", or asks for a fresh build.
argument-hint: "[dialect=teradata|snowflake|redshift|bigquery|databricks|postgres|duckdb]"
allowed-tools: Bash(make:*), Bash(.venv/Scripts/python.exe:*), Bash(.venv/bin/python:*), Read
effort: medium
---

Run the FSLDM pipeline for `$ARGUMENTS` (default: `teradata`).

Steps:
1. Confirm `.venv` exists. If not, instruct: `make setup`.
2. Run: `PYTHONIOENCODING=utf-8 PYTHONUTF8=1 LLM_PROVIDER=claude_code .venv/Scripts/python.exe -m agents.main run --dialect $ARGUMENTS --hitl-decision approve`
   (use `.venv/bin/python` on macOS/Linux).
3. Tail the artifact summary table.
4. If any error appears, hand off to the `pipeline-debugger` subagent.
