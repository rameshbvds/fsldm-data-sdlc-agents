@echo off
REM FSLDM Demo Runner - Windows (No make required)
setlocal enabledelayedexpansion

REM Set encoding
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1

REM Default values
if not defined LLM_PROVIDER set LLM_PROVIDER=ocbc
set DIALECT=teradata
set HITL_DECISION=approve

REM Check if venv exists
if not exist ".venv" (
    echo [ERROR] Virtual environment not found. Run: py -3.12 -m venv .venv
    pause
    exit /b 1
)

REM Check if .env exists
if not exist ".env" (
    echo [ERROR] .env file not found. Run: copy .env.example .env
    echo Then edit .env and add your OCBC_API_KEY
    pause
    exit /b 1
)

echo ========================================
echo FSLDM Deposit SDLC Agent - Demo Run
echo ========================================
echo LLM Provider: %LLM_PROVIDER%
echo Dialect: %DIALECT%
echo ========================================
echo.

REM Activate venv and run
call .venv\Scripts\activate.bat
.venv\Scripts\python.exe -m agents.main run --dialect %DIALECT% --hitl-decision %HITL_DECISION%

echo.
echo ========================================
echo Demo Complete!
echo ========================================
echo.
echo Artifacts: sql_teradata\*.gen.sql, gx\*.gen.json
pause
