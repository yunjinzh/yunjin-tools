@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 start-server.py
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Please install Python 3, or deploy the dist folder to your web server.
  ) else (
    python start-server.py
  )
)
pause
