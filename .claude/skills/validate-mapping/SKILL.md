---
name: validate-mapping
description: Run sqlglot validation + schema diff against generated artifacts. Use before any commit that touches sql_*/ or schemas/.
allowed-tools: Bash(make:*), Bash(.venv/Scripts/python.exe:*), Bash(.venv/bin/python:*), Read, Grep
effort: low
---

Validate the current mapping + generated SQL.

1. `.venv/Scripts/python.exe -m agents.sql_validate --all` (validates every `sql_*/*.gen.sql` against its declared dialect).
2. `python -m agents.main show-schema | head -100` — sanity-check schemas parse.
3. Diff `schemas/deposit_target.json` against last commit; if columns added but no `*.gen.sql` regenerated, fail.

Report PASS / FAIL with file:line for any failure.
