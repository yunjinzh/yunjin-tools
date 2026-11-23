$ErrorActionPreference = 'Stop'
$projectDir = $PSScriptRoot
$serverFile = Join-Path $projectDir 'server.mjs'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodeExe = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
if (-not (Test-Path -LiteralPath $nodeExe)) { throw 'Node.js was not found. Install Node.js LTS and run this launcher again.' }
$stateFile = Join-Path $projectDir 'launch-state.json'
$existing = $null
if (Test-Path -LiteralPath $stateFile) {
  try { $existing = Get-Content -Raw -LiteralPath $stateFile | ConvertFrom-Json } catch {}
}
if ($existing) {
  $existingProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $($existing.pid)" -ErrorAction SilentlyContinue
  if ($existingProcess -and $existingProcess.CommandLine.Contains($serverFile)) {
    Start-Process "http://127.0.0.1:$($existing.port)"
    exit
  }
}
$selectedPort = 4205
for ($candidate = 4205; $candidate -le 4215; $candidate++) {
  $probe = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,$candidate)
  try { $probe.Start(); $selectedPort = $candidate; break } catch { if ($candidate -eq 4215) { throw 'No available local port in 4205-4215.' } } finally { $probe.Stop() }
}
$env:PORT = [string]$selectedPort
$process = Start-Process -FilePath $nodeExe -ArgumentList ('"' + $serverFile + '"') -WorkingDirectory $projectDir -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $projectDir 'server.log') -RedirectStandardError (Join-Path $projectDir 'server-error.log')
@{pid=$process.Id;port=$selectedPort;server=$serverFile} | ConvertTo-Json | Set-Content -LiteralPath $stateFile -Encoding UTF8
Start-Sleep -Milliseconds 500
if ($process.HasExited) { throw 'The local service did not start. See server-error.log.' }
Start-Process "http://127.0.0.1:$selectedPort"
