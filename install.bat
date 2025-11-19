@echo off
echo ==========================================
echo   WalletPay - Installation
echo ==========================================
echo.
echo Installing dependencies...
echo.

echo [1/2] Installing frontend dependencies...
call npm install

echo.
echo [2/2] Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo ==========================================
echo   Installation Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Setup PostgreSQL database (see QUICKSTART.md)
echo 2. Run start-backend.bat
echo 3. Run start-frontend.bat
echo 4. Open http://localhost:5173
echo.
pause
