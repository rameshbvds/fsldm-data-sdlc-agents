---
name: add-target-table
description: Scaffold a new FSLDM target fact/dim table — add to schemas/deposit_target.json, generate mapping draft, and queue for HITL review.
argument-hint: "[table_name] [grain]"
allowed-tools: Read, Edit, Write, Bash
agent: mapping-architect
context: fork
effort: high
---

Add a new target table named `$1` with grain `$2` to the FSLDM deposit warehouse.

1. Read `schemas/deposit_target.json` to understand existing table shape.
2. Append the new table block (columns, types, nullability, PK).
3. Re-run `python -m agents.main run --dry-run` to confirm parsing.
4. Re-run mapping stage to produce a draft for the new table:
   `python -m agents.main run --dialect teradata --hitl-decision revise` (so HITL prompts).
5. Show the draft mapping table to the user, ask for the missing source lineage rules.

Defer to subagent `mapping-architect` for the field-level lineage decisions.
