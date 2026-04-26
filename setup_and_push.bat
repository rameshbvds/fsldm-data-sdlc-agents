@echo off
REM ============================================================
REM FSLDM Data SDLC Agent — Folder Setup + GitHub Push
REM Run this from inside your fsldm-data-sdlc-agents folder
REM ============================================================

echo.
echo  Setting up folder structure...
echo.

mkdir agents 2>nul
mkdir schemas 2>nul
mkdir sql_teradata 2>nul
mkdir sql_dbt 2>nul
mkdir sql_bteq 2>nul
mkdir gx 2>nul
mkdir soda 2>nul

REM ── Python agent files ──────────────────────────────────────
move /Y graph.py          agents\ 2>nul
move /Y main.py           agents\ 2>nul
move /Y state.py          agents\ 2>nul
move /Y mapping_agent.py  agents\ 2>nul
move /Y dev_agent.py      agents\ 2>nul
move /Y testing_agent.py  agents\ 2>nul
echo [1] Agent .py files → agents\

REM ── Schema JSON files ────────────────────────────────────────
move /Y deposit_source.json  schemas\ 2>nul
move /Y deposit_target.json  schemas\ 2>nul
move /Y source.json          schemas\ 2>nul
move /Y target.json          schemas\ 2>nul
move /Y rules.json           schemas\ 2>nul
echo [2] Schema files → schemas\

REM ── Teradata SQL files ───────────────────────────────────────
move /Y fct_dpos_bal.sql      sql_teradata\ 2>nul
move /Y fct_dpos_evnt.sql     sql_teradata\ 2>nul
move /Y fct_intrs_accrl.sql   sql_teradata\ 2>nul
move /Y fct_loan_acct_bal.sql sql_teradata\ 2>nul
move /Y fct_acct_evnt.sql     sql_teradata\ 2>nul
echo [3] Teradata SQL → sql_teradata\

REM ── dbt files ────────────────────────────────────────────────
move /Y schema.yml  sql_dbt\ 2>nul
echo [4] dbt schema.yml → sql_dbt\

REM NOTE: dbt .sql files share the same names as Teradata ones.
REM If you downloaded them separately into subfolders (sql_dbt folder
REM from the download), move that folder's contents:
REM   move /Y sql_dbt_downloads\*.sql sql_dbt\

REM ── BTEQ validation ──────────────────────────────────────────
move /Y deposit_validate_all.sql  sql_bteq\ 2>nul
echo [5] BTEQ SQL → sql_bteq\

REM ── Test suites ──────────────────────────────────────────────
move /Y deposit_expectations.json  gx\   2>nul
move /Y deposit_checks.yml         soda\ 2>nul
echo [6] GX → gx\   Soda → soda\

REM ── Excel spec stays in root ─────────────────────────────────
echo [7] Excel mapping spec stays in root folder.

echo.
echo  Folder structure complete. Files:
echo.
dir /s /b
echo.

REM ── Git push ─────────────────────────────────────────────────
echo  Initialising git and pushing to GitHub...
echo  (Requires git installed: https://git-scm.com/download/win)
echo.

git init
git add .
git commit -m "Initial commit — FSLDM Deposit + Loan SDLC pipeline"
git branch -M main

REM === EDIT THESE TWO LINES BEFORE RUNNING ===
set GH_USER=YOUR_GITHUB_USERNAME
set GH_TOKEN=YOUR_NEW_PAT_TOKEN

git remote add origin https://%GH_TOKEN%@github.com/%GH_USER%/fsldm-data-sdlc-agents.git
git push -u origin main

echo.
echo  Done! View your repo at:
echo  https://github.com/%GH_USER%/fsldm-data-sdlc-agents
echo.
pause
