# Banking Laptop Windows Setup Guide

## Complete Guide for Installing FSLDM Data SDLC Agents on Secure Banking Laptops

**Last Updated:** 2025-04-30
**Status:** ✅ Verified for Windows 10/11 on Banking Laptops
**Security:** Offline-first, air-gapped capable

---

## Table of Contents

1. [Overview](#overview)
2. [Pre-Setup Checklist](#pre-setup-checklist)
3. [Quick Setup (15 minutes)](#quick-setup-15-minutes)
4. [Manual Step-by-Step](#manual-step-by-step)
5. [Offline Installation](#offline-installation)
6. [Troubleshooting](#troubleshooting)
7. [Demo Script](#demo-script)
8. [Security Considerations](#security-considerations)

---

## Overview

This guide helps you install the FSLDM Data SDLC Agents on a banking laptop with:
- Windows 10/11 with security restrictions
- Limited internet access
- No administrator privileges
- Corporate firewall/proxy

**What you get:**
- AI-powered FSLDM data warehouse mapping tool
- SQL generation for Teradata, Snowflake, Redshift, BigQuery
- OCBC Bank LLM integration
- Complete demo with deposit product schemas

---

## Pre-Setup Checklist

### ✅ What You Need

| Item | Required? | Where to Get |
|------|-----------|--------------|
| Windows 10/11 | ✅ Yes | Already installed |
| Python 3.12+ | ✅ Yes | https://python.org/ftp/python/3.12.0/python-3.12.0-amd64.exe |
| Git (optional) | ⚠️ Recommended | https://github.com/git-for-windows/git/releases/latest |
| OCBC API Key | ✅ Yes | From OCBC GenAI Platform team |
| 500MB disk space | ✅ Yes | Local drive |

### ✅ What You DON'T Need

- ❌ Administrator privileges
- ❌ Docker
- ❌ Visual Studio/C++ compiler
- ❌ Node.js (for backend demo only)
- ❌ Internet connection (after initial setup)

---

## Quick Setup (15 minutes)

### Method 1: Automated Setup (RECOMMENDED)

1. **Download the repository** as a ZIP file from GitHub
   - Go to: https://github.com/rameshbvds/fsldm-data-sdlc-agents
   - Click "Code" → "Download ZIP"
   - Extract to: `C:\Users\%USERNAME%\fsldm-data-sdlc-agents`

2. **Open PowerShell or Command Prompt**

3. **Navigate to project folder**
   ```powershell
   cd C:\Users\%USERNAME%\fsldm-data-sdlc-agents
   ```

4. **Run automated setup**
   ```powershell
   setup.bat
   ```
   This will:
   - Check prerequisites
   - Create virtual environment
   - Install all dependencies
   - Configure environment files

5. **Edit .env file with your API key**
   ```powershell
   notepad .env
   ```
   Replace `your_ocbc_api_key_here` with your actual OCBC API key

6. **Run demo**
   ```powershell
   run-demo.bat
   ```

### Method 2: Manual Setup

If automated setup fails, use the manual steps below.

---

## Manual Step-by-Step

### STEP 1: Install Python 3.12

1. **Download Python installer**
   - URL: https://python.org/ftp/python/3.12.0/python-3.12.0-amd64.exe
   - Save to Downloads folder

2. **Run installer**
   - Double-click `python-3.12.0-amd64.exe`
   - ✅ **IMPORTANT:** Check "Add Python to PATH"
   - Click "Install Now"

3. **Verify installation**
   ```powershell
   py --version
   # Expected output: Python 3.12.0
   ```

### STEP 2: Fix PowerShell Execution Policy

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

If you see an error, run PowerShell as Administrator and try again.

### STEP 3: Extract Project Files

1. **If you have a ZIP file:**
   - Right-click → "Extract All..."
   - Extract to: `C:\Users\%USERNAME%\fsldm-data-sdlc-agents`

2. **If using Git:**
   ```powershell
   cd C:\Users\%USERNAME%
   git clone https://github.com/rameshbvds/fsldm-data-sdlc-agents.git
   cd fsldm-data-sdlc-agents
   ```

### STEP 4: Create Virtual Environment

```powershell
cd C:\Users\%USERNAME%\fsldm-data-sdlc-agents
py -3.12 -m venv .venv
```

**Expected output:** (nothing - just returns to prompt)

**If you see an error:**
- Make sure Python 3.12 is installed: `py --version`
- Try: `python -m venv .venv` (without version number)

### STEP 5: Activate Virtual Environment

**PowerShell:**
```powershell
.venv\Scripts\Activate.ps1
```

**Command Prompt:**
```cmd
.venv\Scripts\activate.bat
```

**If you see "running scripts is disabled":**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### STEP 6: Install Dependencies

```powershell
pip install -e .[dev]
```

**Expected time:** 2-3 minutes

**If you see SSL errors:**
```powershell
pip install -e .[dev] --trusted-host pypi.org --trusted-host files.pythonhosted.org
```

### STEP 7: Configure Environment

1. **Create .env file**
   ```powershell
   copy .env.example .env
   ```

2. **Edit .env file**
   ```powershell
   notepad .env
   ```

3. **Add your OCBC API key**
   ```bash
   # OCBC Bank LLM Configuration
   LLM_PROVIDER=ocbc
   OCBC_API_KEY=your_actual_ocbc_api_key_here
   OCBC_ENDPOINT=https://genaiplatform-appgw.dev.c2.ocbc.com/foundryeastus2/openai/v1/responses/
   OCBC_MODEL=gpt-5.1-codex

   # Logging
   LOG_LEVEL=INFO
   LOG_FORMAT=console
   ```

4. **Save and close notepad**

### STEP 8: Verify Installation

```powershell
.venv\Scripts\python.exe -c "import agents; print('OK')"
```

**Expected output:** `OK`

### STEP 9: Run Demo

```powershell
.\run-demo.bat
```

Or manually:

```powershell
LLM_PROVIDER=ocbc .venv\Scripts\python.exe -m agents.main run --dialect teradata --hitl-decision approve
```

---

## Offline Installation

For air-gapped environments without internet:

### 1. Download Dependencies on Online Machine

```bash
# On a machine with internet
pip download -e .[dev] -d packages/
```

This downloads all required packages to a `packages/` folder.

### 2. Transfer to Banking Laptop

1. Copy the entire project folder + `packages/` to USB drive
2. Transfer to banking laptop

### 3. Install Offline

```powershell
# On banking laptop (offline)
pip install --no-index --find-links=packages -e .[dev]
```

---

## Troubleshooting

### Error: "py: command not found"

**Cause:** Python not installed or not in PATH

**Fix:**
1. Install Python 3.12 from python.org
2. Make sure "Add Python to PATH" is checked
3. Restart terminal

### Error: "Activate.ps1 cannot be loaded"

**Cause:** PowerShell execution policy

**Fix:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "OCBC_API_KEY not found"

**Cause:** .env file missing or API key not set

**Fix:**
```powershell
# Check .env exists
dir .env

# Check content
type .env

# If missing, recreate
copy .env.example .env
notepad .env
```

### Error: "SSL certificate verification failed"

**Cause:** OCBC internal endpoint uses self-signed certs

**Fix:** This is expected! The code handles it automatically by disabling SSL verification for the OCBC endpoint only.

### Error: "pip install fails"

**Cause:** Corporate firewall or proxy

**Fix:**
```powershell
pip install -e .[dev] --trusted-host pypi.org --trusted-host files.pythonhosted.org
```

Or set proxy:
```powershell
set HTTP_PROXY=http://proxy.company.com:8080
set HTTPS_PROXY=http://proxy.company.com:8080
pip install -e .[dev]
```

### Error: "No module named 'agents'"

**Cause:** Package not installed correctly

**Fix:**
```powershell
.venv\Scripts\Activate.ps1
pip install -e .
```

---

## Demo Script

### 2.5-Minute Demo Presentation

**Introduction (30 seconds)**
```
"This is the FSLDM AI-powered Data SDLC pipeline.
It automates mapping, SQL generation, and testing for
FSLDM data warehouse migrations using OCBC Bank's LLM."
```

**Show Configuration (15 seconds)**
```powershell
type .env
```
"Using OCBC Bank's gpt-5.1-codex model"

**Run Pipeline (30 seconds)**
```powershell
.\run-demo.bat
```

**Explain Output (45 seconds)**
- Stage 1: AI maps 3 tables (80 fields)
- Stage 2: Auto-approves mappings
- Stage 3: Generates SQL (Teradata + dbt)
- Stage 4: Creates tests (57 expectations)

**Show Artifacts (30 seconds)**
```powershell
type sql_teradata\fct_dpos_bal.gen.sql
dir gx\*.gen.json
```

---

## Security Considerations

### ✅ What This Setup Does

- Creates isolated virtual environment
- Stores API key locally in .env file
- Makes no external connections except OCBC endpoint
- Generates SQL locally (no warehouse connection)
- Logs PII-redacted output

### ✅ What This Setup Does NOT Do

- Does NOT require administrator privileges
- Does NOT modify system files
- Does NOT connect to production databases
- Does NOT send data outside OCBC network
- Does NOT install global packages

### 🔒 .env File Security

The .env file contains your OCBC API key. Keep it safe:
- Never commit .env to git
- Delete .env before sharing project folder
- Use different API keys for dev/prod

---

## Verification Checklist

After setup, verify:

- [ ] Python 3.12 installed (`py --version`)
- [ ] Virtual environment created (`dir .venv`)
- [ ] Dependencies installed (`pip list | findstr langgraph`)
- [ ] .env file created (`dir .env`)
- [ ] OCBC_API_KEY set (`type .env`)
- [ ] Can import agents (`python -c "import agents"`)
- [ ] Demo runs successfully (`.\run-demo.bat`)

---

## Next Steps

1. **Explore schemas:** `type schemas\deposit_source.json`
2. **Try different dialects:** `.\run-demo.bat` (edit DIALECT=)
3. **Review generated SQL:** `dir sql_teradata\*.gen.sql`
4. **Run tests:** `.venv\Scripts\python.exe -m pytest`

---

## Support

For issues or questions:
- Email: rameshbvds@gmail.com
- LinkedIn: https://www.linkedin.com/in/ramesh-v-361baa80/

---

## Success Criteria

You know setup is complete when:
- ✅ All 4 stages complete
- ✅ 3 tables mapped (80 fields)
- ✅ 7 SQL artifacts generated
- ✅ 57 tests created
- ✅ No errors in output

**Setup time:** 15 minutes
**Demo time:** 2.5 minutes
**Confidence:** 100%

---

**Built by Ramesh V**
Assistant Vice President, OCBC Bank
Senior Software Analyst - Banking Data Warehousing
