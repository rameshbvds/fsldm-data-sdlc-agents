# Windows Developer Demo Checklist

## Before the Demo

### System Requirements
- [ ] Windows 10/11 installed
- [ ] Python 3.12 installed (python.org)
- [ ] Git installed (git-scm.com)
- [ ] PowerShell 5.1 or later
- [ ] OCBC API key (from provided image)

### Setup (10 minutes)

#### 1. Clone Repository
```powershell
git clone https://github.com/YOUR-ORG/fsldm-data-sdlc-agents.git
cd fsldm-data-sdlc-agents
```

#### 2. Create Virtual Environment
```powershell
py -3.12 -m venv .venv
```

#### 3. Activate Virtual Environment
```powershell
.venv\Scripts\Activate.ps1
```

**If you get "execution policies" error:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### 4. Install Dependencies
```powershell
pip install -e .[dev]
```

**This will take 2-3 minutes.** You should see:
```
Successfully installed langgraph-0.2.x
Successfully installed langchain-0.3.x
Successfully installed sqlglot-25.x.x
...
```

#### 5. Configure OCBC LLM
```powershell
# Copy template
cp .env.template .env

# Edit .env and replace:
# your_ocbc_api_key_here → your actual OCBC API key
```

**Using Notepad:**
```powershell
notepad .env
```

### Demo Readiness Check

```powershell
# Make sure venv is activated
.venv\Scripts\Activate.ps1

# Test the pipeline
LLM_PROVIDER=ocbc make run
```

**Expected output:**
```
╭─────────────────────────────────────────────────────────────╮
│ FSLDM Deposit SDLC Agent                                    │
│ Dialect: teradata  |  Thread: deposit-001  |  HITL: approve │
╰─────────────────────────────────────────────────────────────╯

▶ Stage 1 — Mapping Agent
✓ Generated 3 table mappings

▶ Stage 2 — HITL Review Gate
✓ Auto-approved

▶ Stage 3 — Development Agent
✓ Generated 7 SQL files

▶ Stage 4 — Testing Agent
✓ Generated 57 tests

✓ Pipeline complete
```

### Verify Artifacts Created

```powershell
dir sql_teradata\*.gen.sql
dir gx\*.gen.json
```

**You should see:**
- `fct_dpos_bal.gen.sql`
- `fct_dpos_evnt.gen.sql`
- `fct_intrs_accrl.gen.sql`
- `deposit_expectations.gen.json`

---

## During the Demo

### Opening Statement
"This is the FSLDM Data SDLC Agent - an AI-powered pipeline that automatically generates data warehouse migration code from Excel mapping specs. It uses OCBC Bank's internal LLM platform (gpt-5.1-codex) for intelligent field mapping."

### Demo Flow

**1. Show the Setup**
```powershell
# Show it's configured for OCBC
cat .env
```

**2. Run the Pipeline**
```powershell
LLM_PROVIDER=ocbc make run
```

**3. Explain the Output**
- "Stage 1: AI maps source to target fields"
- "Stage 2: Human-in-the-loop approval"
- "Stage 3: Generates Teradata + dbt SQL"
- "Stage 4: Creates data quality tests"

**4. Show Generated SQL**
```powershell
cat sql_teradata\fct_dpos_bal.gen.sql
```

**5. Show Tests**
```powershell
cat gx\deposit_expectations.gen.json
```

---

## Troubleshooting

### "py: command not found"
**Solution:** Install Python 3.12 from python.org

### "Activate.ps1 cannot be loaded"
**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "OCBC_API_KEY not found"
**Solution:** Check `.env` file exists and has your API key

### "pip install fails"
**Solution:**
```powershell
python -m pip install --upgrade pip
pip install -e .[dev] --trusted-host pypi.org --trusted-host files.pythonhosted.org
```

### "make: command not found"
**Solution:** Use `nmake` on Windows, or:
```powershell
go install github.com/mattn/go-msi@latest
```

Or run directly:
```powershell
.venv\Scripts\python.exe -m agents.main run --dialect teradata --hitl-decision approve
```

---

## Backup Plan

### Live Demo URL
If local setup fails: **https://fsldm.vercel.app**

### Pre-generated Artifacts
The repo already has generated artifacts:
- `sql_teradata/` - Teradata SQL
- `sql_dbt_gen/` - dbt models
- `gx/` - Great Expectations tests

You can show these files even without running the pipeline.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `.venv\Scripts\Activate.ps1` | Activate venv |
| `make run` | Run pipeline |
| `make test` | Run tests |
| `make web` | Start UI |

---

## Key Demo Points

1. **4-Stage Pipeline:** Mapping → HITL → Dev → Testing
2. **3 Target Tables:** FCT_DPOS_BAL, FCT_DPOS_EVNT, FCT_INTRS_ACCRL
3. **Multi-dialect:** Teradata, Snowflake, Redshift, BigQuery, etc.
4. **OCBC Integration:** Uses bank's gpt-5.1-codex model
5. **57 Auto-generated Tests:** Great Expectations + Soda + BTEQ
6. **Open Questions:** Flags ambiguity instead of inventing logic

---

## Success Criteria

- [ ] Pipeline runs without errors
- [ ] All 4 stages complete
- [ ] SQL files generated
- [ ] Test files generated
- [ ] Can explain the architecture

**Time to complete:** 10 minutes setup + 2 minutes demo

---

**Last Updated:** 2026-04-28
**Platform:** Windows 11 + Python 3.12
