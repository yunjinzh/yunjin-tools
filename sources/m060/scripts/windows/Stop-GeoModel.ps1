$ErrorActionPreference = "Stop"
Set-StrictMode -Version 2.0

$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$RuntimeRoot = Join-Path $AppRoot ".runtime"
$PidFile = Join-Path $RuntimeRoot "geomodel.pid"
$UrlFile = Join-Path $RuntimeRoot "geomodel.url"

try {
    if (-not (Test-Path $PidFile)) {
        Write-Host "[GeoModel] No running local viewer was found."
        exit 0
    }
    $pidText = (Get-Content $PidFile | Select-Object -First 1)
    $serverPid = 0
    if (-not [Int32]::TryParse($pidText, [ref] $serverPid)) {
        throw "The local PID file is invalid."
    }
    $process = Get-Process -Id $serverPid -ErrorAction SilentlyContinue
    if ($null -ne $process) {
        $details = Get-CimInstance Win32_Process -Filter "ProcessId = $serverPid" -ErrorAction SilentlyContinue
        if ($null -eq $details -or $details.Name -ne "node.exe" -or $details.CommandLine -notlike "*vite.js*") {
            throw "The saved process is not a GeoModel server, so it was not stopped."
        }
        Stop-Process -Id $serverPid -Force
        Write-Host "[GeoModel] Local viewer stopped."
    } else {
        Write-Host "[GeoModel] The viewer was already stopped."
    }
    Remove-Item -Force $PidFile -ErrorAction SilentlyContinue
    Remove-Item -Force $UrlFile -ErrorAction SilentlyContinue
    exit 0
} catch {
    Write-Host "[GeoModel] STOP FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
