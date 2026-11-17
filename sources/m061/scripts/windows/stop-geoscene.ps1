$ErrorActionPreference = "SilentlyContinue"
$port = 3178
$connections = Get-NetTCPConnection -LocalPort $port -State Listen
$processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique

if (-not $processIds) {
  Write-Host "GeoScene is not running on port $port."
  exit 0
}

foreach ($processId in $processIds) {
  Stop-Process -Id $processId -Force
}
Write-Host "GeoScene has stopped."
Start-Sleep -Seconds 1
