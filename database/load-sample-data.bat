@echo off
REM Load Sample Data into PostgreSQL
REM Usage: load-sample-data.bat [username] [password]

SET DB_USER=%1
SET DB_PASS=%2

if "%DB_USER%"=="" SET DB_USER=postgres
if "%DB_PASS%"=="" SET DB_PASS=postgres

echo Loading sample data into database...
echo.

psql -U %DB_USER% -d taskmanager -f sample-data.sql -W %DB_PASS%

echo.
echo Sample data loaded successfully!
echo.
echo You can now login with:
echo   - Username: admin / Password: admin123
echo   - Username: john.manager / Password: password123
echo   - Username: sarah.lead / Password: password123
echo   - Username: mike.dev / Password: password123
echo   - Username: emily.tester / Password: password123
echo.

pause