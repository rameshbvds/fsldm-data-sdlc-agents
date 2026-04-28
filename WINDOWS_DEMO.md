# Windows Demo Setup - 3 Steps

## For the Other Developer Presenting

### Step 1: Clone and Setup (2 minutes)

```powershell
# Open PowerShell in Windows Terminal
git clone https://github.com/YOUR-ORG/fsldm-data-sdlc-agents.git
cd fsldm-data-sdlc-agents

# Create virtual environment
py -3.12 -m venv .venv

# Activate (PowerShell)
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -e .[dev]
```

### Step 2: Configure OCBC LLM (1 minute)

Create `.env` file in project root:

```bash
# OCBC Bank LLM Configuration
LLM_PROVIDER=ocbc
OCBC_API_KEY=your_ocbc_api_key_from_image
OCBC_ENDPOINT=https://genaiplatform-appgw.dev.c2.ocbc.com/foundryeastus2/openai/v1/responses/
OCBC_MODEL=gpt-5.1-codex

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=console
```

### Step 3: Run Demo (30 seconds)

```powershell
# Make sure virtual environment is activated
.venv\Scripts\Activate.ps1

# Run pipeline with OCBC LLM
LLM_PROVIDER=ocbc make run
```

**That's it!** Demo is ready.

---

## What You'll See

```
╭─────────────────────────────────────────────────────────────╮
│ FSLDM Deposit SDLC Agent                                    │
│ Dialect: teradata  |  Thread: deposit-001  |  HITL: approve │
╰─────────────────────────────────────────────────────────────╯

▶ Stage 1 — Mapping Agent
✓ Generated 3 table mappings (14 open questions)

⏸ Stage 2 — HITL Review Gate
✓ Auto-approved

▶ Stage 3 — Development Agent
✓ Generated 7 SQL files (Teradata + dbt)

▶ Stage 4 — Testing Agent
✓ Generated 57 Great Expectations tests

✓ Pipeline complete
```

---

## Demo Artifacts Generated

- **SQL:** `sql_teradata/fct_dpos_*.gen.sql` (3 Teradata files)
- **dbt:** `sql_dbt_gen/*.sql` (3 Snowflake models + schema.yml)
- **Tests:** `gx/deposit_expectations.gen.json` (57 tests)

---

## If Something Goes Wrong

### "py: command not found"
Install Python 3.12 from python.org

### "Activate.ps1 cannot be loaded"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "OCBC API key error"
Check `.env` file has your actual OCBC API key

### Pipeline errors
```powershell
make test
```

---

## Live Demo Backup

If local setup has issues, use:
**https://fsldm.vercel.app**

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `make setup` | Create venv + install deps |
| `make run` | Run full pipeline |
| `make test` | Run pytest |
| `make web` | Start Streamlit UI |

**Default dialect:** Teradata (use `make run DIALECT=snowflake` for others)

---

**Last Updated:** 2026-04-28
**Tested On:** Windows 11 + Python 3.12
