@echo off
echo ==========================================
echo   WalletPay - Database Setup
echo ==========================================
echo.
echo This script will create the walletpay database
echo and run the schema migration.
echo.
echo Make sure PostgreSQL is installed and running!
echo.
pause

echo.
echo Creating database...
psql -U postgres -c "CREATE DATABASE walletpay;"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Could not create database.
    echo.
    echo Common solutions:
    echo - Make sure PostgreSQL is installed
    echo - Add PostgreSQL bin folder to PATH
    echo - Run this script as Administrator
    echo.
    echo PostgreSQL bin folder is usually at:
    echo C:\Program Files\PostgreSQL\15\bin
    echo.
    pause
    exit /b 1
)

echo.
echo Running database schema...
psql -U postgres -d walletpay -f database\schema.sql

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Could not run schema migration.
    echo Check the error message above.
    echo.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   Database Setup Complete!
echo ==========================================
echo.
echo Database 'walletpay' created and configured.
echo.
echo You can verify with:
echo psql -U postgres -l
echo.
pause
