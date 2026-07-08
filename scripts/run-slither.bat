@echo off
echo ====================================================
echo 🛡️  Bayanihan Smart Contracts - Slither Static Analysis
echo ====================================================
echo Running Slither via Docker Container...
echo Workspace path: %CD%
echo.

:: Verify Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker is not running or not in PATH.
    echo Please make sure Docker Desktop is started and try again.
    pause
    exit /b 1
)

:: Pull latest Slither image
echo 📥 Pulling crytic/slither:latest image...
docker pull crytic/slither:latest

:: Execute Slither on contracts folder
echo 🔍 Running static checks...
docker run --rm -v "%CD%:/share" crytic/slither:latest /share --config-file /share/slither.config.json

echo.
echo ====================================================
echo ✅ Static analysis run completed!
echo Results (if any) saved to: auditreport/slither-results.json
echo ====================================================
pause
