$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$port = 3178
$nodeVersion = "22.19.0"
$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$runtime = Join-Path $root ".runtime"
$nodeFolder = "node-v$nodeVersion-win-x64"
$nodeHome = Join-Path $runtime $nodeFolder
$nodeZip = Join-Path $runtime "$nodeFolder.zip"
$nodeUrls = @(
  "https://nodejs.org/dist/v$nodeVersion/$nodeFolder.zip",
  "https://registry.npmmirror.com/-/binary/node/v$nodeVersion/$nodeFolder.zip"
)
$nodeExe = Join-Path $nodeHome "node.exe"
$npmCmd = Join-Path $nodeHome "npm.cmd"
$stamp = Join-Path $runtime "dependencies-v1.ok"
$viteScript = Join-Path $root "node_modules\vite\bin\vite.js"

function Test-LocalPort {
  param([int]$Number)
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $result = $client.BeginConnect("127.0.0.1", $Number, $null, $null)
    return $result.AsyncWaitHandle.WaitOne(300) -and $client.Connected
  } catch {
    return $false
  } finally {
    $client.Close()
  }
}

try {
  Set-Location $root
  Write-Host ""
  Write-Host "============================================================"
  Write-Host "  GeoScene OSM 3D Scene Builder"
  Write-Host "  Local URL: http://127.0.0.1:$port"
  Write-Host "============================================================"
  Write-Host ""

  if (Test-LocalPort $port) {
    Write-Host "GeoScene is already running. Opening the browser..."
    Start-Process "http://127.0.0.1:$port"
    exit 0
  }

  New-Item -ItemType Directory -Force -Path $runtime | Out-Null

  if (-not (Test-Path $nodeExe)) {
    Write-Host "[1/4] Downloading the portable Node.js runtime..."
    if (Test-Path $nodeZip) { Remove-Item -Force $nodeZip }
    $downloaded = $false
    foreach ($nodeUrl in $nodeUrls) {
      try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeZip -UseBasicParsing -TimeoutSec 300
        if ((Get-Item $nodeZip).Length -ge 10000000) {
          $downloaded = $true
          break
        }
      } catch {
        if (Test-Path $nodeZip) { Remove-Item -Force $nodeZip }
      }
    }
    if (-not $downloaded) { throw "Unable to download the portable Node.js runtime." }
    if ((Get-Item $nodeZip).Length -lt 10000000) {
      throw "The Node.js download is incomplete."
    }

    Write-Host "[2/4] Extracting the runtime..."
    Expand-Archive -LiteralPath $nodeZip -DestinationPath $runtime -Force
    Remove-Item -Force $nodeZip
  } else {
    Write-Host "[1/4] Portable Node.js runtime is ready."
    Write-Host "[2/4] Runtime extraction is not required."
  }

  $env:Path = "$nodeHome;$env:Path"
  $env:npm_config_cache = Join-Path $runtime "npm-cache"

  if (-not (Test-Path $stamp) -or -not (Test-Path $viteScript)) {
    Write-Host "[3/4] Installing GeoScene components. This can take a few minutes..."
    & $npmCmd ci --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed with exit code $LASTEXITCODE." }
    Set-Content -LiteralPath $stamp -Value "GeoScene dependencies installed." -Encoding ASCII
  } else {
    Write-Host "[3/4] GeoScene components are ready."
  }

  Write-Host "[4/4] Starting GeoScene..."
  $arguments = '"' + $viteScript + '" --host 127.0.0.1 --port ' + $port + ' --strictPort'
  $server = Start-Process -FilePath $nodeExe -ArgumentList $arguments -WorkingDirectory $root -NoNewWindow -PassThru

  for ($attempt = 0; $attempt -lt 40; $attempt++) {
    if ($server.HasExited) { throw "GeoScene stopped before the local page became available." }
    if (Test-LocalPort $port) { break }
    Start-Sleep -Milliseconds 250
  }

  if (-not (Test-LocalPort $port)) { throw "GeoScene did not open port $port in time." }
  Start-Process "http://127.0.0.1:$port"
  Write-Host ""
  Write-Host "GeoScene is running. Keep this window open."
  Write-Host "Press Ctrl+C or double-click Stop-GeoScene.cmd to stop it."
  Write-Host ""
  $server.WaitForExit()
  exit $server.ExitCode
} catch {
  Write-Host ""
  Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "See the Chinese README file in this folder for troubleshooting."
  Write-Host ""
  exit 1
}
