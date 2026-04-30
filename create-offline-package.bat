@echo off
REM ============================================================
REM Create Offline Installation Package
REM Run this on an ONLINE machine to create a package
REM that can be installed on an OFFLINE banking laptop
REM ============================================================

setlocal enabledelayedexpansion

set PACKAGE_DIR=FSLDM_Offline_Package
set PACKAGES_DIR=%PACKAGE_DIR%\python_packages

cls
echo.
echo ============================================================
echo   Creating Offline Installation Package
echo ============================================================
echo.
echo This will create a folder with all dependencies
echo that can be transferred to a banking laptop.
echo.
pause

REM ============================================================
REM STEP 1: Create Package Directory
REM ============================================================
echo.
echo [1/5] Creating package directory...

if exist "%PACKAGE_DIR%" (
    echo [INFO] Removing existing package directory...
    rmdir /s /q "%PACKAGE_DIR%"
)

mkdir "%PACKAGE_DIR%"
mkdir "%PACKAGES_DIR%"
echo [OK] Package directory created: %PACKAGE_DIR%

REM ============================================================
REM STEP 2: Copy Project Files
REM ============================================================
echo.
echo [2/5] Copying project files...

xcopy /E /I /Y agents "%PACKAGE_DIR%\agents" >nul
xcopy /E /I /Y schemas "%PACKAGE_DIR%\schemas" >nul
xcopy /E /I /Y api "%PACKAGE_DIR%\api" >nul
xcopy /E /I /Y tests "%PACKAGE_DIR%\tests" >nul
xcopy /E /I /Y docs "%PACKAGE_DIR%\docs" >nul
xcopy /E /I /Y .claude "%PACKAGE_DIR%\.claude" >nul

REM Create output directories
mkdir "%PACKAGE_DIR%\sql_teradata" 2>nul
mkdir "%PACKAGE_DIR%\sql_dbt_gen" 2>nul
mkdir "%PACKAGE_DIR%\gx" 2>nul
mkdir "%PACKAGE_DIR%\soda" 2>nul
mkdir "%PACKAGE_DIR%\sql_bteq" 2>nul
mkdir "%PACKAGE_DIR%\data" 2>nul

REM Copy config files
copy /Y pyproject.toml "%PACKAGE_DIR%\" >nul
copy /Y requirements.txt "%PACKAGE_DIR%\" >nul
copy /Y requirements-dev.txt "%PACKAGE_DIR%\" >nul
copy /Y .env.example "%PACKAGE_DIR%\" >nul
copy /Y README.md "%PACKAGE_DIR%\" >nul
copy /Y CLAUDE.md "%PACKAGE_DIR%\" >nul
copy /Y setup.bat "%PACKAGE_DIR%\" >nul
copy /Y run-demo.bat "%PACKAGE_DIR%\" >nul
copy /Y verify-setup.bat "%PACKAGE_DIR%\" >nul
copy /Y BANKING_WINDOWS_SETUP.md "%PACKAGE_DIR%\" >nul
copy /Y QUICK_REFERENCE_WINDOWS.md "%PACKAGE_DIR%\" >nul

echo [OK] Project files copied

REM ============================================================
REM STEP 3: Download Python Packages
REM ============================================================
echo.
echo [3/5] Downloading Python packages...
echo This may take 5-10 minutes...
echo.

py -m pip download --only-binary=:all: -e .[dev] -d "%PACKAGES_DIR%"
if errorlevel 1 (
    echo [WARN] Some packages could not be downloaded as binaries
    echo [INFO] Retrying with source packages allowed...
    py -m pip download -e .[dev] -d "%PACKAGES_DIR%"
)

echo [OK] Python packages downloaded

REM ============================================================
REM STEP 4: Create Offline Setup Script
REM ============================================================
echo.
echo [4/5] Creating offline setup script...

(
    echo @echo off
    echo REM ============================================================
    echo REM Offline Installation Script
    echo REM Run this on the OFFLINE banking laptop
    echo REM ============================================================
    echo.
    echo setlocal enabledelayedexpansion
    echo.
    echo echo ============================================================
    echo echo   FSLDM Offline Installation
    echo echo ============================================================
    echo echo.
    echo.
    echo echo [1/4] Creating virtual environment...
    echo py -3.12 -m venv .venv
    echo if errorlevel 1 goto :error
    echo.
    echo echo [2/4] Activating virtual environment...
    echo call .venv\Scripts\activate.bat
    echo.
    echo echo [3/4] Installing packages from local folder...
    echo echo This may take a few minutes...
    echo pip install --no-index --find-links=python_packages -e .[dev]
    echo if errorlevel 1 goto :error
    echo.
    echo echo [4/4] Configuring environment...
    echo copy .env.example .env
    echo echo.
    echo echo ============================================================
    echo echo   Installation Complete!
    echo echo ============================================================
    echo echo.
    echo echo Next steps:
    echo echo   1. Edit .env file with your OCBC API key
    echo echo   2. Run: run-demo.bat
    echo echo.
    echo goto :end
    echo.
    echo :error
    echo echo.
    echo echo [ERROR] Installation failed!
    echo echo.
    echo pause
    echo exit /b 1
    echo.
    echo :end
    echo pause
) > "%PACKAGE_DIR%\install-offline.bat"

echo [OK] Offline setup script created

REM ============================================================
REM STEP 5: Create README
REM ============================================================
echo.
echo [5/5] Creating package README...

(
    echo # FSLDM Offline Installation Package
    echo.
    echo ## How to Install on Banking Laptop ^(No Internet^)
    echo.
    echo ### Step 1: Transfer Package
    echo.
    echo 1. Copy this entire folder to USB drive
    echo 2. Transfer to banking laptop
    echo 3. Extract to: C:\Users\%%USERNAME%%\FSLDM_Offline_Package
    echo.
    echo ### Step 2: Install
    echo.
    echo 1. Open PowerShell or Command Prompt
    echo 2. Navigate to package folder:
    echo    cd C:\Users\%%USERNAME%%\FSLDM_Offline_Package
    echo 3. Run offline installer:
    echo    install-offline.bat
    echo.
    echo ### Step 3: Configure
    echo.
    echo 1. Edit .env file:
    echo    notepad .env
    echo 2. Add your OCBC API key
    echo 3. Save and close
    echo.
    echo ### Step 4: Run Demo
    echo.
    echo run-demo.bat
    echo.
    echo ## Package Contents
    echo.
    echo - All Python packages ^(python_packages/^)
    echo - Project source code
    echo - Batch scripts for setup and demo
    echo - Documentation
    echo.
    echo ## Requirements
    echo.
    echo - Windows 10/11
    echo - Python 3.12+ ^(install from python.org^)
    echo - 500MB disk space
    echo.
    echo ## Troubleshooting
    echo.
    echo See BANKING_WINDOWS_SETUP.md for detailed help.
    echo.
    echo ---
    echo.
    echo Created: %DATE% %TIME%
) > "%PACKAGE_DIR%\README_OFFLINE.txt"

echo [OK] Package README created

REM ============================================================
REM SUMMARY
REM ============================================================
echo.
echo ============================================================
echo   PACKAGE CREATION COMPLETE
echo ============================================================
echo.
echo Package location: %PACKAGE_DIR%\
echo Package size:
for /f "tokens=3" %%s in ('dir "%PACKAGE_DIR%" /s ^| find "File(s)"') do set SIZE=%%s
echo   %SIZE% bytes
echo.
echo Contents:
echo   - Project files
echo   - Python packages: ^(dir /b "%PACKAGES_DIR%" ^| find /c /v ""^) packages
echo   - Setup scripts
echo   - Documentation
echo.
echo Next steps:
echo   1. Copy %PACKAGE_DIR% to USB drive
echo   2. Transfer to banking laptop
echo   3. Run install-offline.bat on banking laptop
echo.
pause
