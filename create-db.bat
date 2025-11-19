@echo off
set PGPASSWORD=admin123
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE walletpay;"
if %ERRORLEVEL% EQU 0 (
    echo Database created successfully!
    "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d walletpay -f database\schema.sql
    if %ERRORLEVEL% EQU 0 (
        echo Schema loaded successfully!
    ) else (
        echo Error loading schema!
    )
) else (
    echo Error creating database - it may already exist
    echo Trying to load schema anyway...
    "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d walletpay -f database\schema.sql
)
set PGPASSWORD=
pause
