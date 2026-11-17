@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 云金个人作品网站

where node >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 Node.js。
  echo 请先安装 Node.js 18 或更高版本，然后重新双击本文件。
  echo 下载地址：https://nodejs.org/
  pause
  exit /b 1
)

set "PORT=4173"
echo 正在启动个人作品网站...
start "" /b powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Milliseconds 900; Start-Process 'http://127.0.0.1:4173'"
node server.mjs

if errorlevel 1 (
  echo.
  echo [错误] 网站未能正常启动，请检查 4173 端口是否被占用。
  pause
)
