@echo off
set PGPASSWORD=admin123
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d walletpay -f add-withdrawals-table.sql
pause
