# Message to Ramesh - Demo Setup Instructions

---

Hi Ramesh,

Please set up the FSLDM demo on your Windows laptop for the office presentation. Follow these steps:

## PREREQUISITES (5 minutes)
1. Install Python 3.12: https://python.org/downloads/
2. Install Git: https://git-scm.com/download/win
3. Get OCBC API key from the shared image

## SETUP (10 minutes)

Open PowerShell and run:

```powershell
# Clone repository
git clone https://github.com/rameshbvds/fsldm-data-sdlc-agents.git
cd fsldm-data-sdlc-agents

# Create virtual environment
py -3.12 -m venv .venv

# Activate (if you get execution policy error, run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser)
.venv\Scripts\Activate.ps1

# Install dependencies
pip install -e .[dev]

# Configure OCBC LLM
copy .env.example .env
notepad .env
```

In notepad, replace `your_ocbc_api_key_here` with your actual OCBC API key from the image.

## RUN DEMO (30 seconds)

```powershell
# Make sure venv is activated
.venv\Scripts\Activate.ps1

# Run pipeline
LLM_PROVIDER=ocbc make run
```

## WHAT YOU'LL SEE

Demo will show:
- ✅ Stage 1: AI maps 3 tables (FCT_DPOS_BAL, FCT_DPOS_EVNT, FCT_INTRS_ACCRL)
- ✅ Stage 2: Auto-approves mappings
- ✅ Stage 3: Generates Teradata + dbt SQL
- ✅ Stage 4: Creates 57 Great Expectations tests

Generated files:
- `sql_teradata\*.gen.sql` - Teradata SQL
- `sql_dbt_gen\*.sql` - dbt models
- `gx\*.gen.json` - Test suites

## BACKUP PLAN

If anything fails, use live demo: https://fsldm.vercel.app

## TROUBLESHOOTING

**"py: command not found"** → Install Python 3.12
**"Activate.ps1 cannot be loaded"** → `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
**"OCBC_API_KEY error"** → Check .env file has your API key
**"pip install fails"** → Run: `pip install -e .[dev] --trusted-host pypi.org --trusted-host files.pythonhosted.org`

## KEY DEMO POINTS

1. **4-Stage Pipeline**: Mapping → HITL → Dev → Testing
2. **OCBC Integration**: Uses bank's gpt-5.1-codex model
3. **3 Target Tables**: Deposit fact tables with 80 fields
4. **57 Auto-generated Tests**: Great Expectations + Soda
5. **Multi-dialect**: Teradata, Snowflake, Redshift, BigQuery, etc.

Total setup time: 15 minutes
Demo time: 2 minutes

Let me know if you face any issues!

---

**Repository:** https://github.com/rameshbvds/fsldm-data-sdlc-agents
**Commit:** 548b0fc (latest)
**Documentation:** Check WINDOWS_DEMO.md and WINDOWS_CHECKLIST.md in repo
