@echo off
setlocal EnableExtensions
cd /d "%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\windows\Stop-GeoModel.ps1"
set "GM_EXIT=%ERRORLEVEL%"
if not "%GM_EXIT%"=="0" pause
exit /b %GM_EXIT%
