@echo off
echo ===================================================
echo   LOVE Platform - Local Development Starter
echo ===================================================
echo.

REM Check for Frontend dependencies
if not exist "frontend\node_modules" (
    echo [Frontend] Installing dependencies...
    cd frontend
    call npm install
    cd ..
)

REM Check for Worker dependencies
if not exist "worker\node_modules" (
    echo [Worker] Installing dependencies...
    cd worker
    call npm install
    cd ..
)

echo.
echo [1/2] Starting Cloudflare Worker API...
start "LOVE Backend (Worker)" cmd /k "cd worker && npm run dev"

echo [2/2] Starting React Frontend...
start "LOVE Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   Development servers are starting!
echo.

echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8787

echo   Close the popped-up windows to stop the servers.
echo ===================================================
pause
