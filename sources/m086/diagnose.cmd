@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title 拾光智能相册管理系统 - 启动诊断
(echo 拾光智能相册管理系统 诊断报告 & echo %date% %time% & ver) > "diagnostics.txt"
"runtime\python.exe" -X utf8 "server.py" --check >>"diagnostics.txt" 2>&1
type "diagnostics.txt"
echo.
echo Report saved: diagnostics.txt
pause
endlocal
