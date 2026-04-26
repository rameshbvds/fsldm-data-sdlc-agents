# UAT Tester Guide — FSLDM Data SDLC Pipeline

## What you're testing

A multi-agent tool that auto-generates Teradata / dbt / Snowflake SQL + data-quality tests
from FSLDM source/target schemas. **Goal:** validate that the generated SQL and tests are
production-quality — and flag what isn't.

## Access

URL: `https://<your-uat-host>` (provided by your test lead)
Credentials: emailed separately

## Test flow (15 min per scenario)

### Scenario A — Happy path
1. Pick **dialect = teradata** in the dropdown.
2. Click **▶ Run Mapping Stage**. Wait ~5 sec.
3. Expand each target table (FCT_DPOS_BAL, FCT_DPOS_EVNT, FCT_INTRS_ACCRL).
4. **Look for:** any field mapping that's wrong, any open question that shouldn't be open, any column the tool failed to map.
5. Choose **approve** in the HITL form. Submit.
6. Download `fct_dpos_bal.gen.sql`. Run it against your Teradata sandbox (read-only DDL parse).
7. Report results in the feedback channel.

### Scenario B — Revise path
1. Same as A through step 3.
2. Pick a column whose lineage is wrong.
3. Choose **revise** + add specific feedback (e.g. "FCT_DPOS_BAL.RGN_CD should come from BRCH.RGN_CD via DPOS_AGMT.BRCH_ID, not direct").
4. Submit. The pipeline will halt — your feedback is recorded against the run_id.

### Scenario C — Dialect port
1. Pick **dialect = snowflake**.
2. Run mapping → approve → download dbt artifact.
3. Run via `dbt compile` in your dev environment. Confirm it parses.

## What to report

Use this template (paste into Teams / Jira / Slack):

```
RUN_ID: <12-char hex>
DIALECT: <teradata|snowflake|...>
SCENARIO: <A|B|C>

Field mappings reviewed: <count>
Errors found: <count>

Issue 1:
  Table: FCT_DPOS_BAL
  Column: <col>
  Generated lineage: <what tool produced>
  Correct lineage:   <what it should be>
  Severity: <critical|warning|nit>

Issue 2: ...

SQL execution:
  Parses on Teradata: yes/no
  Errors: <copy-paste>

Overall verdict: ship / revise / block
```

## Acceptance bar (MVP)

- ≥ 85% of column mappings correct (UAT-judged)
- 0 hallucinated lineage (any false-positive blocks ship)
- 100% of generated SQL parses on the target dialect
- HITL form usable without engineering help

## Help

- Stuck? Ping `#fsldm-uat` channel
- Bug in the app itself (not the SQL)? Click "📜 History" → copy the run_id → DM the test lead
