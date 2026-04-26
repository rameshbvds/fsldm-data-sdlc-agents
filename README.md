# FSLDM Data SDLC Agents

An AI-powered, end-to-end Data Warehouse SDLC pipeline for **FSLDM (Financial Services Logical Data Model)** compliant ETL development. Covers **Mapping → HITL Review → Development → Testing** using LangGraph agents, with Teradata SQL output today and dbt/Snowflake for AWS migration.

---

## Pipelines included

| Pipeline | Source tables | Target facts | Products |
|---|---|---|---|
| **Loan** | PRTY, AGMT, ACCT_EVNT, ACCT_EVNT_ARCV, PROD | FCT_LOAN_ACCT_BAL, FCT_ACCT_EVNT | Loan, Mortgage, Overdraft |
| **Deposit** | PRTY, DPOS_AGMT, DPOS_BAL, DPOS_INTRS_ACCRL, DPOS_EVNT, DPOS_EVNT_ARCV, TD_SCHD, RD_INSTL_SCHD, ISLM_AGMT, PROD, BRCH | FCT_DPOS_BAL, FCT_DPOS_EVNT, FCT_INTRS_ACCRL | CASA Current, CASA Savings, Fixed Deposit, Recurring Deposit, Notice Deposit, Call Deposit, Structured Deposit, Islamic Murabaha, Islamic Wakala |

---

## Folder structure

```
fsldm-data-sdlc-agents/
│
├── agents/                        # LangGraph pipeline agents
│   ├── state.py                   # Pydantic state model (multi-target, multi-source)
│   ├── mapping_agent.py           # Mapping agent (LLM-powered)
│   ├── dev_agent.py               # Development agent (Teradata + dbt dual output)
│   ├── testing_agent.py           # Testing agent (GX + Soda + BTEQ)
│   ├── graph.py                   # LangGraph state machine
│   └── main.py                    # CLI entry point (Typer)
│
├── schemas/                       # Source + target JSON schemas
│   ├── deposit_source.json        # 13 ODS source tables (deposit)
│   ├── deposit_target.json        # 3 FSLDM fact tables (deposit)
│   ├── source.json                # Loan ODS source tables
│   ├── target.json                # Loan target tables
│   └── rules.json                 # Business rules
│
├── sql_teradata/                  # Production Teradata SQL
│   ├── fct_dpos_bal.sql           # Daily deposit balance (6 CTEs, 8 JOINs)
│   ├── fct_dpos_evnt.sql          # Deposit event fact (UNION ALL)
│   ├── fct_intrs_accrl.sql        # Interest accrual (window functions)
│   ├── fct_loan_acct_bal.sql      # Loan balance fact
│   └── fct_acct_evnt.sql          # Loan event fact
│
├── sql_dbt/                       # dbt models (Snowflake / AWS migration)
│   ├── fct_dpos_bal.sql
│   ├── fct_dpos_evnt.sql
│   ├── fct_intrs_accrl.sql
│   └── schema.yml                 # Column tests (not_null, accepted_values, unique)
│
├── sql_bteq/                      # Teradata BTEQ validation SQL
│   └── deposit_validate_all.sql   # 22 violation-style checks
│
├── gx/                            # Great Expectations v1 suites
│   └── deposit_expectations.json  # 90 expectations across 3 targets
│
├── soda/                          # Soda Core checks
│   └── deposit_checks.yml         # 38 checks (freshness, nulls, dupes, range)
│
├── FSLDM_Deposit_Mapping_Spec_COMPLETE.xlsx   # 8-sheet mapping spec
├── FSLDM_Mapping_Spec_LOAN_PIPELINE.xlsx      # Loan mapping spec
├── requirements.txt
└── README.md
```

---

## How the pipeline works

```
┌─────────────┐     ┌──────────┐     ┌───────────┐     ┌─────────────┐
│  Mapping    │────▶│   HITL   │────▶│    Dev    │────▶│   Testing   │
│   Agent     │     │  Review  │     │   Agent   │     │    Agent    │
│             │     │  (gate)  │     │           │     │             │
│ • Reads     │     │ • Human  │     │ • Teradata│     │ • GX suites │
│   schemas   │     │   approval    │   SQL     │     │ • Soda YAML │
│ • Maps all  │     │ • Flags  │     │ • dbt/SF  │     │ • BTEQ SQL  │
│   columns   │     │   low    │     │ • SQLGlot │     │             │
│ • Flags     │     │   conf.  │     │   validate│     │             │
│   open Qs   │     │          │     │           │     │             │
└─────────────┘     └──────────┘     └───────────┘     └─────────────┘
```

---

## Quick start

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Set your Anthropic API key

```bash
export ANTHROPIC_API_KEY=your_key_here
```

### 3. Run the deposit pipeline

```bash
# Full interactive run (pauses at HITL for your review)
python agents/main.py run --dialect teradata

# Auto-approve HITL (for CI/CD)
python agents/main.py run --dialect teradata --hitl-decision approve

# dbt/Snowflake output (AWS migration)
python agents/main.py run --dialect snowflake --hitl-decision approve

# Dry run — print plan only
python agents/main.py run --dry-run
```

### 4. View schemas

```bash
python agents/main.py show-schema
```

---

## Key design decisions

| Decision | Why |
|---|---|
| **Multi-target MappingSpec** | Real DWH pipelines populate multiple fact tables from one source run |
| **UNION ALL model** | DPOS_EVNT + DPOS_EVNT_ARCV split for Teradata archive pattern — common in banking |
| **Dual SQL output** | Teradata now, dbt/Snowflake for AWS migration — same business logic, different dialect |
| **SQLGlot validation** | All generated SQL is parsed before emit — catches syntax errors before dev sees them |
| **HITL interrupt** | LangGraph `interrupt_before` on HITL node — human signs off before expensive dev stage |
| **QUALIFY ROW_NUMBER()** | Teradata-native deduplication for SCD2 and latest-row patterns |
| **ZEROIFNULL** | Teradata-native NULL-to-zero — replaced by COALESCE in dbt/Snowflake |

---

## Supported dialects

| Dialect | Status | Use case |
|---|---|---|
| `teradata` | Production | Current DWH |
| `snowflake` | Ready | AWS migration target (via dbt) |
| `redshift` | Ready | AWS alternative |
| `bigquery` | Ready | GCP |
| `databricks` | Ready | Lakehouse |
| `duckdb` | Ready | Local testing |
| `postgres` | Ready | OSS baseline |

---

## FSLDM naming conventions

| FSLDM entity | Physical table prefix | Example |
|---|---|---|
| PARTY | PRTY | PRTY_ID, PRTY_TYP_CD |
| AGREEMENT | AGMT / DPOS_AGMT | AGMT_ID, DPOS_AGMT_ID |
| EVENT | EVNT / ACCT_EVNT | EVNT_ID, EVNT_TYP_CD |
| PRODUCT | PROD | PROD_ID, PROD_CATG_CD |
| BRANCH | BRCH | BRCH_ID, BRCH_CD |

---

## Extending to new pipelines

To add a new pipeline (e.g. Cards, Trade Finance):

1. Add source schema JSON to `schemas/`
2. Add target schema JSON to `schemas/`
3. Add business rules to `schemas/rules.json`
4. Run `python agents/main.py run --dialect teradata`
5. Review the HITL output and approve

The agents handle all mapping, SQL generation, and test generation automatically.

---

## Requirements

- Python 3.11+
- Anthropic API key (Claude claude-opus-4-5 / claude-sonnet-4-5)
- Teradata SQL Assistant or BTEQ (for validation SQL execution)
- dbt-core + dbt-snowflake (for AWS migration path)
