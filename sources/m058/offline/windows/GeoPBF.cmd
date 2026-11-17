@echo off
setlocal
cd /d "%~dp0"
title GeoPBF Scene Builder
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0runtime\serve.ps1"
if errorlevel 1 (
  echo.
  echo GeoPBF could not start. See the message above.
  pause
)
endlocal
