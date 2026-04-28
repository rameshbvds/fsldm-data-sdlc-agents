@echo off
REM FSLDM Data SDLC Agents - Windows Demo Setup
REM Run this script to setup and run the demo in 3 steps

echo ========================================
echo FSLDM Data SDLC Agents - Demo Setup
echo ========================================
echo.

REM Check Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install from python.org
    pause
    exit /b 1
)

echo [1/3] Checking virtual environment...
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
) else (
    echo Virtual environment exists
)

echo.
echo [2/3] Activating virtual environment...
call .venv\Scripts\activate.bat

echo.
echo Checking dependencies...
pip show langgraph >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies (this takes 2-3 minutes)...
    pip install -e .[dev] --quiet
) else (
    echo Dependencies installed
)

echo.
echo [3/3] Checking OCBC configuration...
if not exist ".env" (
    echo Creating .env from template...
    copy .env.template .env >nul
    echo.
    echo [ACTION REQUIRED] Edit .env and add your OCBC API key:
    echo     notepad .env
    echo.
    echo Press any key when ready...
    pause >nul
)

echo.
echo ========================================
echo Running Demo with OCBC LLM...
echo ========================================
echo.

set LLM_PROVIDER=ocbc
make run

echo.
echo ========================================
echo Demo Complete!
echo ========================================
echo.
echo Artifacts generated:
echo   - sql_teradata\*.gen.sql (Teradata SQL)
echo   - sql_dbt_gen\*.sql (dbt models)
echo   - gx\*.gen.json (Great Expectations tests)
echo.
echo Press any key to exit...
pause >nul
