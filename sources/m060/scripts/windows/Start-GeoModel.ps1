$ErrorActionPreference = "Stop"
Set-StrictMode -Version 2.0

$AppRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$RuntimeRoot = Join-Path $AppRoot ".runtime"
$NodeVersion = "22.19.0"
$NodeFolderName = "node-v$NodeVersion-win-x64"
$BundledNodeRoot = Join-Path $RuntimeRoot $NodeFolderName
$PidFile = Join-Path $RuntimeRoot "geomodel.pid"
$UrlFile = Join-Path $RuntimeRoot "geomodel.url"
$OwnedServerPid = 0

function Write-Step([string] $Message) {
    Write-Host "[GeoModel] $Message" -ForegroundColor Cyan
}

function Get-UsableNode {
    $command = Get-Command "node.exe" -ErrorAction SilentlyContinue
    if ($null -eq $command) { return $null }
    try {
        $raw = (& $command.Source --version 2>$null).Trim().TrimStart("v")
        $version = [Version] $raw
        if ($version -ge [Version] "22.13.0") { return $command.Source }
    } catch {
        return $null
    }
    return $null
}

function Test-GeoModel([string] $Url) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
        return ($response.StatusCode -eq 200 -and $response.Content -match "GeoModel")
    } catch {
        return $false
    }
}

function Test-PortAvailable([int] $Port) {
    $listener = $null
    try {
        $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
        $listener.Start()
        return $true
    } catch {
        return $false
    } finally {
        if ($null -ne $listener) { $listener.Stop() }
    }
}

function Install-LocalNode {
    $nodeExe = Join-Path $BundledNodeRoot "node.exe"
    if (Test-Path $nodeExe) { return $nodeExe }

    Write-Step "Node.js was not found. Installing a private runtime..."
    New-Item -ItemType Directory -Force -Path $RuntimeRoot | Out-Null
    $downloadRoot = Join-Path $RuntimeRoot "downloads"
    New-Item -ItemType Directory -Force -Path $downloadRoot | Out-Null
    $zipPath = Join-Path $downloadRoot "$NodeFolderName.zip"
    $partialPath = "$zipPath.partial"
    if (Test-Path $partialPath) { Remove-Item -Force $partialPath }

    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    $urls = @(
        "https://nodejs.org/dist/v$NodeVersion/$NodeFolderName.zip",
        "https://npmmirror.com/mirrors/node/v$NodeVersion/$NodeFolderName.zip"
    )
    $downloaded = $false
    foreach ($url in $urls) {
        try {
            Write-Step "Downloading runtime from $url"
            Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $partialPath -TimeoutSec 300
            Move-Item -Force $partialPath $zipPath
            $downloaded = $true
            break
        } catch {
            Write-Host "  Download source failed. Trying the next source..." -ForegroundColor Yellow
            if (Test-Path $partialPath) { Remove-Item -Force $partialPath }
        }
    }
    if (-not $downloaded) {
        throw "Node.js download failed. Check the network connection, then run Start-GeoModel.cmd again."
    }

    Write-Step "Extracting the private runtime..."
    Expand-Archive -Path $zipPath -DestinationPath $RuntimeRoot -Force
    if (-not (Test-Path $nodeExe)) {
        throw "The Node.js runtime archive could not be extracted correctly."
    }
    return $nodeExe
}

try {
    Set-Location $AppRoot
    New-Item -ItemType Directory -Force -Path $RuntimeRoot | Out-Null

    if (Test-Path $UrlFile) {
        $existingUrl = (Get-Content $UrlFile -ErrorAction SilentlyContinue | Select-Object -First 1)
        if ($existingUrl -and (Test-GeoModel $existingUrl)) {
            Write-Step "GeoModel is already running at $existingUrl"
            Start-Process $existingUrl
            exit 0
        }
    }

    $nodeExe = Get-UsableNode
    if ($null -eq $nodeExe) { $nodeExe = Install-LocalNode }
    $nodeRoot = Split-Path -Parent $nodeExe
    $npmExe = Join-Path $nodeRoot "npm.cmd"
    if (-not (Test-Path $npmExe)) {
        $npmCommand = Get-Command "npm.cmd" -ErrorAction SilentlyContinue
        if ($null -eq $npmCommand) { throw "npm.cmd was not found beside Node.js." }
        $npmExe = $npmCommand.Source
    }

    $viteScript = Join-Path $AppRoot "node_modules\vite\bin\vite.js"
    $lockFile = Join-Path $AppRoot "package-lock.json"
    $stampFile = Join-Path $RuntimeRoot "install.sha256"
    $lockHash = (Get-FileHash -Algorithm SHA256 $lockFile).Hash
    $installedHash = if (Test-Path $stampFile) { (Get-Content $stampFile | Select-Object -First 1) } else { "" }
    if ((-not (Test-Path $viteScript)) -or $installedHash -ne $lockHash) {
        Write-Step "Installing application dependencies. The first run can take several minutes..."
        $env:NPM_CONFIG_CACHE = Join-Path $RuntimeRoot "npm-cache"
        $env:NPM_CONFIG_AUDIT = "false"
        $env:NPM_CONFIG_FUND = "false"
        & $npmExe ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed with exit code $LASTEXITCODE." }
        Set-Content -Encoding ASCII -Path $stampFile -Value $lockHash
    }

    $port = 3180
    while ($port -le 3190 -and -not (Test-PortAvailable $port)) { $port += 1 }
    if ($port -gt 3190) { throw "No free local port was found between 3180 and 3190." }
    $appUrl = "http://127.0.0.1:$port/"
    Set-Content -Encoding ASCII -Path $UrlFile -Value $appUrl

    Write-Step "Starting the viewer at $appUrl"
    $arguments = @("`"$viteScript`"", "--host", "127.0.0.1", "--port", "$port", "--strictPort")
    $server = Start-Process -FilePath $nodeExe -ArgumentList $arguments -WorkingDirectory $AppRoot -NoNewWindow -PassThru
    $OwnedServerPid = $server.Id
    Set-Content -Encoding ASCII -Path $PidFile -Value $server.Id

    $ready = $false
    for ($attempt = 0; $attempt -lt 120; $attempt += 1) {
        if ($server.HasExited) { throw "The local server stopped before it became ready." }
        if (Test-GeoModel $appUrl) { $ready = $true; break }
        Start-Sleep -Milliseconds 500
    }
    if (-not $ready) { throw "The local server did not become ready within 60 seconds." }

    Write-Step "Ready. Opening the default browser..."
    Write-Host "Close this window or run Stop-GeoModel.cmd to stop the viewer." -ForegroundColor DarkGray
    Start-Process $appUrl
    Wait-Process -Id $server.Id
    exit 0
} catch {
    Write-Host ""
    Write-Host "[GeoModel] STARTUP FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Tip: extract the ZIP to a writable local folder before starting." -ForegroundColor Yellow
    exit 1
} finally {
    if ($OwnedServerPid -gt 0) {
        $ownedProcess = Get-Process -Id $OwnedServerPid -ErrorAction SilentlyContinue
        if ($null -ne $ownedProcess) { Stop-Process -Id $OwnedServerPid -Force -ErrorAction SilentlyContinue }
        if (Test-Path $PidFile) { Remove-Item -Force $PidFile -ErrorAction SilentlyContinue }
    }
}
