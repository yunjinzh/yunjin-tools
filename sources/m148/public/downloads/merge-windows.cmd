@echo off
setlocal
set "MIAO_MERGE_SCRIPT=%~f0"
powershell.exe -NoLogo -NoProfile -Command "$ErrorActionPreference='Stop'; $s=[IO.File]::ReadAllText($env:MIAO_MERGE_SCRIPT,[Text.Encoding]::UTF8); $i=$s.LastIndexOf('::MIAO_PS_BEGIN::'); & ([ScriptBlock]::Create($s.Substring($i+17)))"
set "MIAO_CODE=%ERRORLEVEL%"
pause
exit /b %MIAO_CODE%
::MIAO_PS_BEGIN::
$ErrorActionPreference = 'Stop'
$folder = [IO.Path]::GetDirectoryName($env:MIAO_MERGE_SCRIPT)
$name = '苗苗汉字学习卡_全套1000张.zip'
$result = [IO.Path]::Combine($folder, '苗苗原图_合并结果')
$temp = [IO.Path]::Combine($result, '.merging.zip')
$final = [IO.Path]::Combine($result, $name)
$owned = $false
try {
  $seven = Get-Command 7z.exe -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty Source
  if (-not $seven -and $env:ProgramFiles) {
    $candidate = [IO.Path]::Combine($env:ProgramFiles, '7-Zip', '7z.exe')
    if ([IO.File]::Exists($candidate)) { $seven = $candidate }
  }
  $tar = [IO.Path]::Combine($env:SystemRoot, 'System32', 'tar.exe')
  if (-not $seven -and -not [IO.File]::Exists($tar)) {
    throw '找不到 Windows 自带的 tar 或 7-Zip。请安装 7-Zip 后重试。'
  }
  Write-Host '核对 25 个分卷的文件名与字节数……'
  foreach ($i in 1..25) {
    $n = '{0:D3}' -f $i
    $part = [IO.Path]::Combine($folder, "$name.$n")
    if (-not [IO.File]::Exists($part)) { throw "缺少 $name.$n，请从分卷文件夹补下载。" }
    $expected = if ($i -eq 25) { 87975966 } else { 100663296 }
    $info = Get-Item -LiteralPath $part
    if ($info.Length -ne $expected) { throw "$name.$n 的实际大小为 $($info.Length) 字节，清单为 $expected 字节。" }
  }
  if ([IO.Directory]::Exists($result) -or [IO.File]::Exists($result)) {
    throw '已有同名合并结果目录或文件。请先另行保存旧结果。'
  }
  New-Item -ItemType Directory -Path $result -ErrorAction Stop | Out-Null
  $owned = $true
  $dest = [IO.File]::Open($temp, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
  try {
    foreach ($i in 1..25) {
      $n = '{0:D3}' -f $i
      Write-Host "合并 $n / 025"
      $src = [IO.File]::OpenRead([IO.Path]::Combine($folder, "$name.$n"))
      try { $src.CopyTo($dest) } finally { $src.Dispose() }
    }
    if ($dest.Length -ne 2503895070L) { throw '合并后的字节数与清单不符。' }
  } finally { $dest.Dispose() }
  Write-Host '正在逐条测试压缩包，请保持窗口开启……'
  if ($seven) {
    & $seven t '-bso0' '-bsp0' '--' $temp
    if ($LASTEXITCODE -ne 0) { throw '7-Zip 完整性测试失败，请核对异常分卷。' }
  } else {
    # Windows 自带的 bsdtar 将内容写入空输出流，并在读取错误时返回非零状态。
    $psi = New-Object Diagnostics.ProcessStartInfo
    $psi.FileName = $tar
    $psi.Arguments = '-xOf "' + $temp + '"'
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $p = [Diagnostics.Process]::Start($psi)
    try {
      $p.StandardOutput.BaseStream.CopyTo([IO.Stream]::Null)
      $p.WaitForExit()
      if ($p.ExitCode -ne 0) { throw 'Windows tar 完整性测试失败，请核对异常分卷。' }
    } finally { $p.Dispose() }
  }
  if ((Get-FileHash -Algorithm SHA256 -LiteralPath $temp).Hash.ToLowerInvariant() -ne '36038b3a524d1737a1f6315c90cdc2b6f03d77490efe7e5980699be47d36c072') { throw '合并 ZIP 的 SHA-256 与基准不符。请在工作台逐卷比对。' }
  [IO.File]::Move($temp, $final)
  Write-Host "完整性测试通过。成品：$final"
  Write-Host '请在新建空目录中解压，随后登记卡片内容复核。'
  exit 0
} catch {
  [Console]::Error.WriteLine('停止：' + $_.Exception.Message)
  if ($owned) {
    if ([IO.File]::Exists($temp)) { [IO.File]::Delete($temp) }
    try { [IO.Directory]::Delete($result, $false) } catch { }
  }
  exit 1
}
