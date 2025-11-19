@echo off
echo ================================================
echo   WalletPay Admin System Setup
echo ================================================
echo.

set PGPASSWORD=admin123

echo Creating admin system tables...
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d walletpay -f migrations\002_add_admin_system.sql

echo.
echo ================================================
echo   Setup Complete!
echo ================================================
echo.
echo Default Admin Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo Access admin panel at: http://localhost:5173/admin/login
echo.
pause
