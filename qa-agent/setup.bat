@echo off
REM QA Agent Setup Script for Windows
REM This script helps you get QA Agent up and running

echo.
echo 🚀 QA Agent Setup
echo =================
echo.

REM Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION%

REM Install dependencies
echo.
echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)
echo ✓ Dependencies installed

REM Build the project
echo.
echo Building project...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to build project
    exit /b 1
)
echo ✓ Project built

REM Copy example files
echo.
echo Setting up configuration...

if not exist "qa-agent.config.json" (
    copy qa-agent.config.example.json qa-agent.config.json
    echo ✓ Created qa-agent.config.json (from example)
    echo   Please edit this file with your Azure DevOps details
) else (
    echo ✓ qa-agent.config.json already exists
)

if not exist ".env" (
    copy .env.example .env
    echo ✓ Created .env (from example)
    echo   Please edit this file with your credentials
) else (
    echo ✓ .env already exists
)

REM Create output directories
if not exist "scenarios" mkdir scenarios
if not exist "tests" mkdir tests
if not exist "screenshots" mkdir screenshots
echo ✓ Created output directories

REM Final instructions
echo.
echo =================
echo ✨ Setup Complete!
echo =================
echo.
echo Next steps:
echo.
echo 1. Edit your configuration:
echo    qa-agent config
echo.
echo 2. Or manually edit:
echo    qa-agent.config.json
echo    or
echo    .env
echo.
echo 3. Run your first sync:
echo    qa-agent sync
echo.
echo For more information, see:
echo   - GETTING_STARTED.md (5-minute guide)
echo   - INSTALLATION.md (detailed setup)
echo   - README.md (complete documentation)
echo.
echo Happy testing! 🎭
echo.
pause
