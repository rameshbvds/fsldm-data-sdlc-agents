# Windows Installation Checklist

## FSLDM Data SDLC Agents - Banking Laptop Setup

Use this checklist to verify your installation is complete.

### ✅ Pre-Installation

- [ ] Windows 10/11 installed
- [ ] Have admin rights for user (not required for system)
- [ ] At least 500MB free disk space
- [ ] OCBC API key obtained from GenAI Platform team
- [ ] Read BANKING_WINDOWS_SETUP.md

---

### ✅ Step 1: Python Installation

- [ ] Downloaded Python 3.12 from python.org
- [ ] Checked "Add Python to PATH" during installation
- [ ] Verified installation: `py --version` shows Python 3.12.x

---

### ✅ Step 2: Project Files

- [ ] Downloaded/extracted project to: `C:\Users\<username>\fsldm-data-sdlc-agents`
- [ ] Can see these files in folder:
  - [ ] setup.bat
  - [ ] run-demo.bat
  - [ ] verify-setup.bat
  - [ ] requirements.txt
  - [ ] pyproject.toml
  - [ ] .env.example

---

### ✅ Step 3: PowerShell Configuration

- [ ] Opened PowerShell as user (not admin)
- [ ] Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- [ ] No error messages

---

### ✅ Step 4: Virtual Environment

- [ ] Run: `py -3.12 -m venv .venv`
- [ ] Folder `.venv` created
- [ ] Can see `.venv\Scripts\python.exe` exists

---

### ✅ Step 5: Activate Virtual Environment

- [ ] Run: `.venv\Scripts\Activate.ps1`
- [ ] Prompt shows `(.venv)` prefix
- [ ] No error messages about execution policy

---

### ✅ Step 6: Install Dependencies

- [ ] Run: `pip install -e .[dev]`
- [ ] Wait 2-3 minutes for installation
- [ ] See "Successfully installed" messages
- [ ] Key packages installed:
  - [ ] langgraph
  - [ ] langchain-anthropic
  - [ ] sqlglot
  - [ ] openpyxl
  - [ ] requests
  - [ ] python-dotenv
  - [ ] typer
  - [ ] rich

---

### ✅ Step 7: Environment Configuration

- [ ] Run: `copy .env.example .env`
- [ ] File `.env` created
- [ ] Edited .env with notepad
- [ ] Added OCBC_API_KEY (not the placeholder)
- [ ] File contains these lines:
  ```bash
  LLM_PROVIDER=ocbc
  OCBC_API_KEY=your_actual_key_here
  OCBC_ENDPOINT=https://genaiplatform-appgw.dev.c2.ocbc.com/foundryeastus2/openai/v1/responses/
  OCBC_MODEL=gpt-5.1-codex
  ```

---

### ✅ Step 8: Verification

Run: `.\verify-setup.bat`

- [ ] All checks pass (green)
- [ ] No failures (red)
- [ ] Warnings are OK (yellow)

---

### ✅ Step 9: Test Run

- [ ] Run: `.\run-demo.bat`
- [ ] See 4 stages complete:
  - [ ] Stage 1 — Mapping Agent ✓
  - [ ] Stage 2 — HITL Review Gate ✓
  - [ ] Stage 3 — Development Agent ✓
  - [ ] Stage 4 — Testing Agent ✓
- [ ] See "Pipeline complete" message

---

### ✅ Step 10: Verify Artifacts

- [ ] Run: `dir sql_teradata\*.gen.sql`
- [ ] See these files:
  - [ ] fct_dpos_bal.gen.sql
  - [ ] fct_dpos_evnt.gen.sql
  - [ ] fct_intrs_accrl.gen.sql
- [ ] Run: `dir gx\*.gen.json`
- [ ] See test file created

---

## 🎉 Installation Complete!

If all items are checked, your installation is complete and ready to use.

### Next Steps

1. **Explore the schema:**
   ```powershell
   type schemas\deposit_source.json
   type schemas\deposit_target.json
   ```

2. **Try different SQL dialects:**
   Edit `run-demo.bat` and change `DIALECT=teradata` to:
   - `snowflake`
   - `redshift`
   - `bigquery`
   - `postgres`
   - `databricks`
   - `duckdb`

3. **Run tests:**
   ```powershell
   .venv\Scripts\python.exe -m pytest
   ```

4. **Read the docs:**
   - `BANKING_WINDOWS_SETUP.md` — Detailed setup guide
   - `QUICK_REFERENCE_WINDOWS.md` — Quick command reference
   - `README.md` — Project overview

---

## Need Help?

- **Ramesh V**: rameshbvds@gmail.com
- **LinkedIn**: https://www.linkedin.com/in/ramesh-v-361baa80/

---

## Common Issues Quick Reference

| Issue | Solution |
|-------|----------|
| "py: command not found" | Install Python 3.12 from python.org |
| "scripts disabled" | `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| ".env not found" | `copy .env.example .env` |
| "OCBC_API_KEY error" | Edit .env and add your actual API key |
| "SSL errors" | Expected - handled automatically |
| "No agents module" | `pip install -e .` |

---

**Last Updated:** 2025-04-30
**Status:** ✅ Verified for Windows 10/11
