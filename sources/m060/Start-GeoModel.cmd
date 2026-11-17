@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title GeoModel 3D Viewer
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\windows\Start-GeoModel.ps1"
set "GM_EXIT=%ERRORLEVEL%"
if not "%GM_EXIT%"=="0" (
  echo.
  echo GeoModel could not start. Please review the message above.
  pause
)
exit /b %GM_EXIT%
