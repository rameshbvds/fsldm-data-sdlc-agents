@echo off
REM ============================================================
REM FSLDM Demo Runner - Windows (No make required)
REM Updated for Banking Laptops - Enhanced Error Handling
REM ============================================================

setlocal enabledelayedexpansion

REM Set encoding
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1

REM Default values
if not defined LLM_PROVIDER set LLM_PROVIDER=ocbc
set DIALECT=teradata
set HITL_DECISION=approve

REM Colors for output
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "CYAN=[96m"
set "RESET=[0m"

cls
echo.
echo %CYAN%============================================================%RESET%
echo %CYAN%  FSLDM Deposit SDLC Agent - Demo Run%RESET%
echo %CYAN%============================================================%RESET%
echo.
echo %YELLOW%LLM Provider:%RESET% %LLM_PROVIDER%
echo %YELLOW%Dialect:%RESET% %DIALECT%
echo %YELLOW%HITL Decision:%RESET% %HITL_DECISION%
echo %CYAN%============================================================%RESET%
echo.

REM ============================================================
REM PRE-RUN CHECKS
REM ============================================================

REM Check if venv exists
if not exist ".venv" (
    echo %RED%[ERROR]%RESET% Virtual environment not found!
    echo.
    echo Please run setup.bat first to create the virtual environment.
    echo.
    pause
    exit /b 1
)
echo %GREEN%[OK]%RESET% Virtual environment found

REM Check if .env exists
if not exist ".env" (
    echo %RED%[ERROR]%RESET% .env file not found!
    echo.
    echo Please create .env file with your API credentials:
    echo   copy .env.example .env
    echo   notepad .env
    echo.
    pause
    exit /b 1
)
echo %GREEN%[OK]%RESET% .env file found

REM Check if Python is in venv
if not exist ".venv\Scripts\python.exe" (
    echo %RED%[ERROR]%RESET% Python executable not found in virtual environment
    echo.
    echo Please run setup.bat to reinstall dependencies.
    echo.
    pause
    exit /b 1
)
echo %GREEN%[OK]%RESET% Python executable found

REM Check if agents module is available
.venv\Scripts\python.exe -c "import agents" >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%[WARNING]%RESET% agents module not found. Installing...
    call .venv\Scripts\activate.bat
    pip install -e . --quiet
)

echo.
echo %CYAN%Starting Pipeline...%RESET%
echo.

REM ============================================================
REM RUN PIPELINE
REM ============================================================

call .venv\Scripts\activate.bat

REM Set environment variables for this run
set LLM_PROVIDER=%LLM_PROVIDER%
set LOG_LEVEL=INFO

REM Run the pipeline
.venv\Scripts\python.exe -m agents.main run --dialect %DIALECT% --hitl-decision %HITL_DECISION%

if errorlevel 1 (
    echo.
    echo %RED%============================================================%RESET%
    echo %RED%  Pipeline failed with error code: %errorlevel%%RESET%
    echo %RED%============================================================%RESET%
    echo.
    echo Troubleshooting:
    echo   1. Check .env file has correct OCBC_API_KEY
    echo   2. Check network connection to OCBC endpoint
    echo   3. Run: .venv\Scripts\python.exe -m agents.main run --dry-run
    echo.
    pause
    exit /b 1
)

echo.
echo %CYAN%============================================================%RESET%
echo %GREEN%  Demo Complete!%RESET%
echo %CYAN%============================================================%RESET%
echo.
echo %YELLOW%Artifacts generated:%RESET%
echo   - SQL: sql_teradata\*.gen.sql
echo   - Tests: gx\*.gen.json
echo   - dbt: sql_dbt_gen\*.sql
echo.

REM Show generated files
if exist "sql_teradata" (
    echo %YELLOW%SQL Files:%RESET%
    dir /b sql_teradata\*.gen.sql 2>nul
    echo.
)

if exist "gx" (
    echo %YELLOW%Test Files:%RESET%
    dir /b gx\*.gen.json 2>nul
    echo.
)

echo.
echo Press any key to exit...
pause >nul
