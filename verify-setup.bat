@echo off
REM ============================================================
REM FSLDM Setup Verification Script
REM Checks if the environment is correctly configured
REM ============================================================

setlocal enabledelayedexpansion
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1

set "PASS=[92m PASS[0m"
set "FAIL=[91m FAIL[0m"
set "WARN=[93m WARN[0m"
set "INFO=[96m INFO[0m"

cls
echo.
echo ============================================================
echo   FSLDM Setup Verification
echo ============================================================
echo.

set /a PASS_COUNT=0
set /a FAIL_COUNT=0
set /a WARN_COUNT=0

REM ============================================================
REM CHECK 1: Python Installation
REM ============================================================
echo [1/10] Checking Python installation...
py --version >nul 2>&1
if errorlevel 1 (
    echo %FAIL% Python 3.12+ not found
    set /a FAIL_COUNT+=1
) else (
    for /f "tokens=2" %%i in ('py --version 2^>^&1') do set PY_VER=%%i
    echo %PASS% Python %PY_VER% found
    set /a PASS_COUNT+=1
)
echo.

REM ============================================================
REM CHECK 2: Virtual Environment
REM ============================================================
echo [2/10] Checking virtual environment...
if not exist ".venv" (
    echo %FAIL% Virtual environment not found
    set /a FAIL_COUNT+=1
) else (
    echo %PASS% Virtual environment exists
    set /a PASS_COUNT+=1

    if not exist ".venv\Scripts\python.exe" (
        echo %FAIL% Python executable not in venv
        set /a FAIL_COUNT+=1
    ) else (
        echo %PASS% Python executable in venv
        set /a PASS_COUNT+=1
    )
)
echo.

REM ============================================================
REM CHECK 3: Environment File
REM ============================================================
echo [3/10] Checking .env file...
if not exist ".env" (
    echo %FAIL% .env file not found
    echo        Run: copy .env.example .env
    set /a FAIL_COUNT+=1
) else (
    echo %PASS% .env file exists

    findstr /C:"OCBC_API_KEY" .env >nul
    if errorlevel 1 (
        echo %WARN% OCBC_API_KEY not found in .env
        set /a WARN_COUNT+=1
    ) else (
        findstr /C:"your_ocbc_api_key_here" .env >nul
        if not errorlevel 1 (
            echo %WARN% OCBC_API_KEY not set (still placeholder)
            set /a WARN_COUNT+=1
        ) else (
            echo %PASS% OCBC_API_KEY appears to be set
            set /a PASS_COUNT+=1
        )
    )
)
echo.

REM ============================================================
REM CHECK 4: Core Python Modules
REM ============================================================
echo [4/10] Checking Python modules...

if exist ".venv\Scripts\python.exe" (
    REM Check each module
    for %%M in (langgraph langchain_core sqlglot openpyxl requests python_dotenv pydantic typer rich) do (
        .venv\Scripts\python.exe -c "import %%M" >nul 2>&1
        if errorlevel 1 (
            echo %FAIL% Module %%M not installed
            set /a FAIL_COUNT+=1
        ) else (
            echo %PASS% Module %%M installed
            set /a PASS_COUNT+=1
        )
    )
) else (
    echo %WARN% Skipping module checks (venv not found)
    set /a WARN_COUNT+=1
)
echo.

REM ============================================================
REM CHECK 5: Agents Module
REM ============================================================
echo [5/10] Checking agents module...
if exist ".venv\Scripts\python.exe" (
    .venv\Scripts\python.exe -c "import agents.graph" >nul 2>&1
    if errorlevel 1 (
        echo %FAIL% agents module not importable
        echo        Try: pip install -e .
        set /a FAIL_COUNT+=1
    ) else (
        echo %PASS% agents module can be imported
        set /a PASS_COUNT+=1
    )
) else (
    echo %WARN% Skipping (venv not found)
    set /a WARN_COUNT+=1
)
echo.

REM ============================================================
REM CHECK 6: Schema Files
REM ============================================================
echo [6/10] Checking schema files...
if not exist "schemas\deposit_source.json" (
    echo %FAIL% schemas\deposit_source.json not found
    set /a FAIL_COUNT+=1
) else (
    echo %PASS% deposit_source.json exists
    set /a PASS_COUNT+=1
)

if not exist "schemas\deposit_target.json" (
    echo %FAIL% schemas\deposit_target.json not found
    set /a FAIL_COUNT+=1
) else (
    echo %PASS% deposit_target.json exists
    set /a PASS_COUNT+=1
)
echo.

REM ============================================================
REM CHECK 7: Output Directories
REM ============================================================
echo [7/10] Checking output directories...
for %%D in (sql_teradata sql_dbt_gen gx soda sql_bteq) do (
    if not exist "%%D" (
        echo %WARN% Directory %%D not found (will be created)
        set /a WARN_COUNT+=1
    ) else (
        echo %PASS% Directory %%D exists
        set /a PASS_COUNT+=1
    )
)
echo.

REM ============================================================
REM CHECK 8: Batch Scripts
REM ============================================================
echo [8/10] Checking batch scripts...
for %%S in (setup.bat run-demo.bat verify-setup.bat) do (
    if not exist "%%S" (
        echo %WARN%%S not found
        set /a WARN_COUNT+=1
    ) else (
        echo %PASS%%S exists
        set /a PASS_COUNT+=1
    )
)
echo.

REM ============================================================
REM CHECK 9: PowerShell Execution Policy
REM ============================================================
echo [9/10] Checking PowerShell policy...
for /f "delims=" %%p in ('powershell -Command "Get-ExecutionPolicy -Scope CurrentUser" 2^>nul') do set POLICY=%%p
if defined POLICY (
    echo %INFO% Current policy: %POLICY%
    if "%POLICY%"=="Restricted" (
        echo %WARN% PowerShell policy is Restricted
        echo        Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
        set /a WARN_COUNT+=1
    ) else (
        echo %PASS% PowerShell policy allows scripts
        set /a PASS_COUNT+=1
    )
) else (
    echo %WARN% Could not determine PowerShell policy
    set /a WARN_COUNT+=1
)
echo.

REM ============================================================
REM CHECK 10: Dry Run Test
REM ============================================================
echo [10/10] Testing dry run...
if exist ".venv\Scripts\python.exe" (
    .venv\Scripts\python.exe -m agents.main run --dry-run >nul 2>&1
    if errorlevel 1 (
        echo %FAIL% Dry run test failed
        set /a FAIL_COUNT+=1
    ) else (
        echo %PASS% Dry run test passed
        set /a PASS_COUNT+=1
    )
) else (
    echo %WARN% Skipping (venv not found)
    set /a WARN_COUNT+=1
)
echo.

REM ============================================================
REM SUMMARY
REM ============================================================
echo ============================================================
echo   VERIFICATION SUMMARY
echo ============================================================
echo.
echo %PASS% Passed: %PASS_COUNT%
echo %FAIL% Failed: %FAIL_COUNT%
echo %WARN% Warnings: %WARN_COUNT%
echo.

if %FAIL_COUNT% GTR 0 (
    echo Setup has failures. Please fix the errors above.
    echo.
    echo Common fixes:
    echo   1. Run: setup.bat
    echo   2. Fix .env file: copy .env.example .env
    echo   3. Install deps: pip install -e .[dev]
) else (
    if %WARN_COUNT% GTR 0 (
        echo Setup is mostly complete with some warnings.
        echo You can proceed with caution.
    ) else (
        echo Setup is complete! You can run the demo.
        echo.
        echo Run: .\run-demo.bat
    )
)

echo.
pause
