# Windows Quick Reference Card

## FSLDM Data SDLC Agents - Banking Laptop Setup

### ⚡ 3 Commands to Start

```powershell
# 1. Setup (one time)
setup.bat

# 2. Edit API key
notepad .env

# 3. Run demo
run-demo.bat
```

### 📋 Essential Commands

| Action | Command |
|--------|---------|
| Check Python | `py --version` |
| Create venv | `py -3.12 -m venv .venv` |
| Activate (PowerShell) | `.venv\Scripts\Activate.ps1` |
| Activate (CMD) | `.venv\Scripts\activate.bat` |
| Install deps | `pip install -e .[dev]` |
| Run demo | `.\run-demo.bat` |
| Run tests | `.venv\Scripts\python.exe -m pytest` |
| Check artifacts | `dir sql_teradata\*.gen.sql` |

### 🔑 .env File Template

```bash
LLM_PROVIDER=ocbc
OCBC_API_KEY=your_actual_key_here
OCBC_ENDPOINT=https://genaiplatform-appgw.dev.c2.ocbc.com/foundryeastus2/openai/v1/responses/
OCBC_MODEL=gpt-5.1-codex
LOG_LEVEL=INFO
```

### 🚨 Quick Fixes

| Error | Fix |
|-------|-----|
| "scripts disabled" | `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| "py not found" | Install Python 3.12 from python.org |
| ".env not found" | `copy .env.example .env` |
| "SSL errors" | `pip install -e .[dev] --trusted-host pypi.org --trusted-host files.pythonhosted.org` |
| "no agents module" | `pip install -e .` |

### 📁 Project Structure

```
fsldm-data-sdlc-agents/
├── agents/           # Python modules
├── schemas/          # JSON schemas
├── sql_teradata/     # Generated SQL
├── gx/               # Test files
├── .venv/            # Virtual env
├── .env              # API keys (create from .env.example)
├── setup.bat         # Setup script
└── run-demo.bat      # Demo runner
```

### ✅ Success Indicators

- 4 stages complete
- 3 tables mapped
- 7 SQL files generated
- 57 tests created
- Exit code 0

### 📞 Support

- Ramesh V: rameshbvds@gmail.com
- LinkedIn: https://www.linkedin.com/in/ramesh-v-361baa80/

### 🌐 Live Demo Backup

If local setup fails: https://fsldm.vercel.app
