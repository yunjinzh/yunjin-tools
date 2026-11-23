$ErrorActionPreference = 'Stop'
$stateFile = Join-Path $PSScriptRoot 'launch-state.json'
if (-not (Test-Path -LiteralPath $stateFile)) { Write-Host 'No service was started by this launcher.'; exit }
$record = Get-Content -Raw -LiteralPath $stateFile | ConvertFrom-Json
$serverFile = Join-Path $PSScriptRoot 'server.mjs'
$process = Get-CimInstance Win32_Process -Filter "ProcessId = $($record.pid)" -ErrorAction SilentlyContinue
if ($process -and $process.CommandLine -and $process.CommandLine.Contains($serverFile)) {
  Stop-Process -Id $process.ProcessId
  Write-Host 'Beijing Nightline stopped.'
} else { Write-Host 'No matching Beijing Nightline process. Nothing was stopped.' }
