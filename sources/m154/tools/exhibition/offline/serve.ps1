# Windows PowerShell 5.1 / PowerShell 7. Each worker serves one static GET or HEAD.
param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$root = (Get-Item -LiteralPath (Join-Path $PSScriptRoot 'dist')).FullName
$separator = [IO.Path]::DirectorySeparatorChar
$rootPrefix = $root.TrimEnd($separator) + $separator
$handler = {
    param($client, $rootPrefix)
    $ErrorActionPreference = 'Stop'
    try {
        $client.ReceiveTimeout = 5000
        $client.SendTimeout = 15000
        $stream = $client.GetStream()
        $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 8192, $true)
        $range = $null
        $line = $reader.ReadLine()
        if ($line -notmatch '^(GET|HEAD) (/[^ ]*) HTTP/1\.[01]$') { return }
        $method = $Matches[1]
        $relative = [Uri]::UnescapeDataString(($Matches[2] -split '\?',2)[0]).TrimStart('/')
        for ($i = 0; $i -lt 72; $i++) {
            $line = $reader.ReadLine()
            if ([string]::IsNullOrEmpty($line)) { break }
            if ($line -match '^Range:\s*bytes=(.+)$') { $range = $Matches[1].Trim() }
        }
        if (!$relative) { $relative = 'index.html' }
        $sep = [IO.Path]::DirectorySeparatorChar
        $status = '404 Not Found'
        $mime = 'text/plain; charset=utf-8'
        $extra = ''
        $length = 0L
        if ($relative -notmatch '[:\\\x00-\x1f]' -and ($relative.Split('/') -notcontains '..')) {
            $file = [IO.Path]::GetFullPath([IO.Path]::Combine($rootPrefix, $relative.Replace('/', $sep)))
            if ($file.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase) -and [IO.File]::Exists($file)) {
                $handle = [IO.File]::OpenRead($file)
                $full = $handle.Length
                $length = $full
                $status = '200 OK'
                $types = @{'.html'='text/html; charset=utf-8';'.css'='text/css; charset=utf-8';'.js'='text/javascript; charset=utf-8';'.json'='application/json';'.svg'='image/svg+xml';'.webp'='image/webp';'.jpg'='image/jpeg';'.jpeg'='image/jpeg';'.png'='image/png';'.mp4'='video/mp4';'.woff2'='font/woff2';'.txt'='text/plain; charset=utf-8'}
                $mime = $types[[IO.Path]::GetExtension($file)]
                if (!$mime) { $mime = 'application/octet-stream' }
                if ($range) {
                    $lo = 0L
                    $hi = $full - 1L
                    $valid = $range -match '^(\d{0,16})-(\d{0,16})$'
                    if ($valid) {
                        $left = $Matches[1]
                        $right = $Matches[2]
                        if ($left) {
                            $lo = [long]$left
                            if ($right) { $hi = [Math]::Min([long]$right,$hi) }
                        } elseif ($right) { $lo = [Math]::Max(0L,$full-[long]$right) }
                        else { $valid = $false }
                    }
                    if ($valid -and $lo -le $hi -and $lo -lt $full) {
                        $null = $handle.Seek($lo,[IO.SeekOrigin]::Begin)
                        $length = 1L + $hi - $lo
                        $extra = "Content-Range: bytes $lo-$hi/$full`r`n"
                        $status = '206 Partial Content'
                    } else {
                        $status = '416 Range Not Satisfiable'
                        $length = 0L
                        $extra = "Content-Range: bytes */$full`r`n"
                    }
                }
            }
        }
        $header = "HTTP/1.1 $status`r`nContent-Type: $mime`r`nContent-Length: $length`r`nAccept-Ranges: bytes`r`n${extra}Connection: close`r`n`r`n"
        $bytes = [Text.Encoding]::ASCII.GetBytes($header)
        $stream.Write($bytes,0,$bytes.Length)
        if ($method -eq 'GET' -and $length -gt 0) {
            $buffer = New-Object byte[] 65536
            while ($length -gt 0) {
                $read = $handle.Read($buffer,0,[int][Math]::Min([long]$buffer.Length,$length))
                if ($read -le 0) { break }
                $stream.Write($buffer,0,$read)
                $length -= $read
            }
        }
    } catch { } finally {
        if ($handle) { $handle.Dispose() }
        if ($reader) { $reader.Dispose() }
        $client.Dispose()
    }
}
$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,0)
$pool = [RunspaceFactory]::CreateRunspacePool(1,8)
$pending = [Collections.ArrayList]::new()
try {
    $pool.Open()
    $listener.Start()
    $url = "http://127.0.0.1:$($listener.LocalEndpoint.Port)/"
    Write-Host "京观 · 北京三维漫游  $url"
    Write-Host "保留此窗口即可浏览；关闭窗口或按 Ctrl+C 结束。"
    if (!$NoBrowser) { Start-Process ($url + 'explore.html') }
    while ($true) {
        foreach ($job in @($pending)) {
            if ($job.Task.IsCompleted) {
                try { $null = $job.Engine.EndInvoke($job.Task) } catch {}
                $job.Engine.Dispose()
                $pending.Remove($job)
            }
        }
        if (!$listener.Pending() -or $pending.Count -ge 24) { Start-Sleep -Milliseconds 20; continue }
        $client = $listener.AcceptTcpClient()
        $engine = [PowerShell]::Create()
        $engine.RunspacePool = $pool
        $null = $engine.AddScript($handler.ToString()).AddArgument($client).AddArgument($rootPrefix)
        $null = $pending.Add(@{Engine=$engine;Task=$engine.BeginInvoke()})
    }
} finally {
    $listener.Stop()
    foreach ($job in $pending) { $job.Engine.Dispose() }
    $pool.Dispose()
}
