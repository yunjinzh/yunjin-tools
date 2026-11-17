@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title 拾光智能相册管理系统
if not exist "runtime\python.exe" (
  echo Please extract the entire ZIP before running start.cmd.
  echo Missing: runtime\python.exe
  pause
  exit /b 1
)
"runtime\python.exe" -X utf8 "server.py" 2>"startup-error.log"
if errorlevel 1 (
  echo.
  echo Startup failed. Details are in startup-error.log.
  type "startup-error.log"
  echo Run diagnose.cmd to create a diagnostic report.
  pause
)
endlocal
