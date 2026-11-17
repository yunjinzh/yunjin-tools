$ErrorActionPreference = "Stop"

$appRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\app"))
if (-not (Test-Path (Join-Path $appRoot "index.html"))) {
    Write-Host "GeoPBF app files are missing." -ForegroundColor Red
    exit 2
}

$listener = $null
$port = 47831
while ($port -le 47930) {
    try {
        $candidate = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, $port)
        $candidate.Start()
        $listener = $candidate
        break
    } catch {
        if ($candidate) { $candidate.Stop() }
        $port++
    }
}

if (-not $listener) {
    Write-Host "No available local port was found." -ForegroundColor Red
    exit 3
}

$url = "http://127.0.0.1:$port/"
Write-Host "GeoPBF is running at $url" -ForegroundColor Green
Write-Host "Keep this window open. Press Ctrl+C to stop GeoPBF."
Start-Process $url

function Get-ContentType([string]$extension) {
    switch ($extension.ToLowerInvariant()) {
        ".html" { return "text/html; charset=utf-8" }
        ".js"   { return "text/javascript; charset=utf-8" }
        ".mjs"  { return "text/javascript; charset=utf-8" }
        ".css"  { return "text/css; charset=utf-8" }
        ".json" { return "application/json; charset=utf-8" }
        ".svg"  { return "image/svg+xml" }
        ".png"  { return "image/png" }
        ".jpg"  { return "image/jpeg" }
        ".jpeg" { return "image/jpeg" }
        ".webp" { return "image/webp" }
        ".wasm" { return "application/wasm" }
        ".map"  { return "application/json" }
        default  { return "application/octet-stream" }
    }
}

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $client.ReceiveTimeout = 10000
            $stream = $client.GetStream()
            $reader = New-Object IO.StreamReader($stream, [Text.Encoding]::ASCII, $false, 8192, $true)
            $requestLine = $reader.ReadLine()
            if (-not $requestLine) { continue }
            while ($true) {
                $headerLine = $reader.ReadLine()
                if ($null -eq $headerLine -or $headerLine.Length -eq 0) { break }
            }

            $parts = $requestLine.Split(" ")
            $requestPath = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
            $queryIndex = $requestPath.IndexOf("?")
            if ($queryIndex -ge 0) { $requestPath = $requestPath.Substring(0, $queryIndex) }
            $requestPath = [Uri]::UnescapeDataString($requestPath).TrimStart("/")
            if ([string]::IsNullOrWhiteSpace($requestPath)) { $requestPath = "index.html" }

            $relativePath = $requestPath.Replace("/", [IO.Path]::DirectorySeparatorChar)
            $filePath = [IO.Path]::GetFullPath((Join-Path $appRoot $relativePath))
            $status = "200 OK"
            if (-not $filePath.StartsWith($appRoot, [StringComparison]::OrdinalIgnoreCase)) {
                $status = "403 Forbidden"
                $bytes = [Text.Encoding]::UTF8.GetBytes("Forbidden")
                $contentType = "text/plain; charset=utf-8"
            } else {
                if (Test-Path $filePath -PathType Container) { $filePath = Join-Path $filePath "index.html" }
                if (-not (Test-Path $filePath -PathType Leaf)) { $filePath = Join-Path $appRoot "index.html" }
                $bytes = [IO.File]::ReadAllBytes($filePath)
                $contentType = Get-ContentType ([IO.Path]::GetExtension($filePath))
            }

            $headers = "HTTP/1.1 $status`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-cache`r`nConnection: close`r`n`r`n"
            $headerBytes = [Text.Encoding]::ASCII.GetBytes($headers)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
            $stream.Flush()
        } catch {
            Write-Host "Request error: $($_.Exception.Message)" -ForegroundColor Yellow
        } finally {
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
}
