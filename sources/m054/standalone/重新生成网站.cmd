@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 重新生成个人作品网站

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 Node.js 18 或更高版本。
  pause
  exit /b 1
)

echo 正在扫描“作品文件”并重新生成网站...
node build-site.mjs
if errorlevel 1 (
  echo.
  echo [错误] 生成失败，请根据上方提示检查作品文件。
  pause
  exit /b 1
)

echo.
echo 网站已更新。若网站正在运行，刷新浏览器即可查看最新内容。
pause
