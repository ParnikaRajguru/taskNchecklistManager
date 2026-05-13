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
echo You can now test with any of these accounts:
echo.
echo ADMIN:
echo   admin / admin123
echo.
echo MANAGER:
echo   john.manager / password123
echo.
echo TEAM LEADS:
echo   sarah.lead / password123
echo   jenny.lead / password123
echo.
echo STAFF:
echo   mike.staff / password123
echo   emily.staff / password123
echo   alex.staff / password123
echo   lisa.staff / password123
echo   david.staff / password123
echo.

pause
