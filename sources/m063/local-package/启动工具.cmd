@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title 论文可视化解读生成器

py -3 --version >nul 2>&1
if not errorlevel 1 (
  py -3 local_proxy.py
  goto :done
)

python -c "import sys; sys.exit(0 if sys.version_info.major >= 3 else 1)" >nul 2>&1
if not errorlevel 1 (
  python local_proxy.py
  goto :done
)

echo 未检测到 Python 3，正在使用 Windows PowerShell 启动本机服务……
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0local_proxy.ps1"

:done
if errorlevel 1 (
  echo.
  echo 启动失败，请查看上方提示。
  pause
)
endlocal
