@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  start "" http://127.0.0.1:8787
  py -3 backend\server.py
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Python 3 is required. You can also open dist\index.html directly.
    pause
    exit /b 1
  )
  start "" http://127.0.0.1:8787
  python backend\server.py
)
pause
