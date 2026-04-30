@echo off
REM ============================================================
REM FSLDM Data SDLC Agents - Windows Setup Script
REM For Banking Laptops with Security Restrictions
REM ============================================================

setlocal enabledelayedexpansion
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1

cls
echo.
echo ============================================================
echo   FSLDM Data SDLC Agents - Windows Setup
echo   For Banking Laptops
echo ============================================================
echo.

REM ============================================================
REM STEP 1: Check Prerequisites
REM ============================================================
echo [1/6] Checking Prerequisites...
echo.

REM Check Python
py --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python 3.12+ not found!
    echo.
    echo Please install Python 3.12 from: https://python.org/ftp/python/3.12.0/python-3.12.0-amd64.exe
    echo.
    echo IMPORTANT: Check "Add Python to PATH" during installation
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('py --version 2^>^&1') do set PYTHON_VERSION=%%i
echo [OK] Python %PYTHON_VERSION% found

REM Check Git
git --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Git not found. Install from: https://github.com/git-for-windows/git/releases/latest
    echo          You can still run the demo, but won't be able to clone repos
    echo.
) else (
    for /f "tokens=3" %%i in ('git --version 2^>^&1') do set GIT_VERSION=%%i
    echo [OK] Git %GIT_VERSION% found
)

echo.
echo [1/6] Prerequisites check complete!
echo.
pause
cls

REM ============================================================
REM STEP 2: Fix PowerShell Execution Policy
REM ============================================================
echo [2/6] Configuring PowerShell...
echo.

powershell -Command "Get-ExecutionPolicy -Scope CurrentUser" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Setting PowerShell execution policy to RemoteSigned...
    powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
    echo [OK] PowerShell configured
) else (
    echo [OK] PowerShell already configured
)

echo.
echo [2/6] PowerShell configuration complete!
echo.
pause
cls

REM ============================================================
REM STEP 3: Create Virtual Environment
REM ============================================================
echo [3/6] Creating Python Virtual Environment...
echo.

if exist ".venv" (
    echo [INFO] Virtual environment already exists
    choice /C YN /M "Do you want to recreate it"
    if errorlevel 2 goto :skip_venv
    echo [INFO] Removing old virtual environment...
    rmdir /s /q .venv
)

echo [INFO] Creating virtual environment with Python 3.12...
py -3.12 -m venv .venv
if errorlevel 1 (
    echo [ERROR] Failed to create virtual environment
    pause
    exit /b 1
)

:skip_venv
echo [OK] Virtual environment ready
echo.
echo [3/6] Virtual environment complete!
echo.
pause
cls

REM ============================================================
REM STEP 4: Install Dependencies
REM ============================================================
echo [4/6] Installing Python Dependencies...
echo.
echo This may take 2-3 minutes...
echo.

call .venv\Scripts\activate.bat

echo [INFO] Upgrading pip...
python -m pip install --upgrade pip --quiet

echo [INFO] Installing core dependencies...
pip install -e .[dev] --quiet
if errorlevel 1 (
    echo.
    echo [WARNING] Some packages may have failed. Trying with trusted hosts...
    pip install -e .[dev] --trusted-host pypi.org --trusted-host files.pythonhosted.org
)

echo.
echo [INFO] Verifying key packages...
pip show langgraph >nul 2>&1 && echo [OK] langgraph installed
pip show langchain-anthropic >nul 2>&1 && echo [OK] langchain-anthropic installed
pip show sqlglot >nul 2>&1 && echo [OK] sqlglot installed
pip show openpyxl >nul 2>&1 && echo [OK] openpyxl installed
pip show requests >nul 2>&1 && echo [OK] requests installed
pip show python-dotenv >nul 2>&1 && echo [OK] python-dotenv installed

echo.
echo [4/6] Dependencies installed!
echo.
pause
cls

REM ============================================================
REM STEP 5: Configure Environment
REM ============================================================
echo [5/6] Configuring Environment...
echo.

if not exist ".env" (
    if exist ".env.example" (
        echo [INFO] Creating .env from .env.example...
        copy .env.example .env >nul
        echo [OK] .env file created
        echo.
        echo [IMPORTANT] Edit .env file and add your API key:
        echo            OCBC_API_KEY=your_actual_api_key_here
        echo.
        notepad .env
    ) else (
        echo [WARNING] .env.example not found
        echo [INFO] Creating default .env file...
        (
            echo # OCBC Bank LLM Configuration
            echo LLM_PROVIDER=ocbc
            echo OCBC_API_KEY=your_ocbc_api_key_here
            echo OCBC_ENDPOINT=https://genaiplatform-appgw.dev.c2.ocbc.com/foundryeastus2/openai/v1/responses/
            echo OCBC_MODEL=gpt-5.1-codex
            echo.
            echo # Logging
            echo LOG_LEVEL=INFO
            echo LOG_FORMAT=console
        ) > .env
        echo [OK] .env file created
        echo.
        echo [IMPORTANT] Edit .env file and add your API key!
        notepad .env
    )
) else (
    echo [OK] .env file already exists
)

echo.
echo [5/6] Environment configured!
echo.
pause
cls

REM ============================================================
REM STEP 6: Verification
REM ============================================================
echo [6/6] Verifying Setup...
echo.

echo [INFO] Checking installation...
python -c "import agents.graph; print('OK: agents module')" 2>nul
if errorlevel 1 (
    echo [ERROR] agents module not found correctly
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   SETUP COMPLETE!
echo ============================================================
echo.
echo Quick Start:
echo   1. Verify .env file has your OCBC_API_KEY
echo   2. Run: run-demo.bat
echo.
echo Or manually:
echo   1. Activate: .venv\Scripts\Activate.ps1
echo   2. Run: LLM_PROVIDER=ocbc python -m agents.main run --hitl-decision approve
echo.
echo For help: See WINDOWS_DEMO.md
echo.
pause
