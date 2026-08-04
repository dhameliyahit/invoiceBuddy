@echo off
echo ============================================
echo    Invoice Buddy - Starting Application
echo ============================================
echo.

echo [1/2] Starting Backend Server...
start "Invoice Buddy - Server" cmd /k "cd /d server && npm run dev"

echo [2/2] Starting Frontend Client...
start "Invoice Buddy - Client" cmd /k "cd /d client && npm run dev"

echo.
echo ============================================
echo    All services started!
echo    Server:  http://localhost:3000
echo    Client:  http://localhost:5173
echo ============================================
echo.
pause
