$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Add-Type -AssemblyName System.Net.Http

$hostAddress = "127.0.0.1"
$port = 8765
$prefix = "http://${hostAddress}:${port}/"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlName = "论文可视化解读生成器_本地版.html"
$htmlPath = Join-Path $scriptRoot $htmlName
$maxRequestBytes = 800000
$maxPromptCharacters = 600000

$providers = @{
    "openai" = @{ Protocol = "openai"; Endpoint = "https://api.openai.com/v1/chat/completions" }
    "anthropic" = @{ Protocol = "anthropic"; Endpoint = "https://api.anthropic.com/v1/messages" }
    "deepseek" = @{ Protocol = "openai"; Endpoint = "https://api.deepseek.com/chat/completions" }
    "qwen" = @{ Protocol = "openai"; Endpoint = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions" }
}

function Send-Bytes {
    param(
        [System.Net.HttpListenerContext]$Context,
        [int]$Status,
        [string]$ContentType,
        [byte[]]$Body
    )
    $response = $Context.Response
    $response.StatusCode = $Status
    $response.ContentType = $ContentType
    $response.ContentLength64 = $Body.Length
    $response.Headers["Access-Control-Allow-Origin"] = "*"
    $response.Headers["Access-Control-Allow-Headers"] = "content-type"
    $response.Headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    $response.Headers["Cache-Control"] = "no-store"
    $response.Headers["X-Content-Type-Options"] = "nosniff"
    if ($Body.Length -gt 0) {
        $response.OutputStream.Write($Body, 0, $Body.Length)
    }
    $response.OutputStream.Close()
}

function Send-Json {
    param(
        [System.Net.HttpListenerContext]$Context,
        [int]$Status,
        [object]$Payload
    )
    $json = $Payload | ConvertTo-Json -Depth 20 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($json)
    Send-Bytes -Context $Context -Status $Status -ContentType "application/json; charset=utf-8" -Body $bytes
}

function Get-ProviderError {
    param([int]$Status, [object]$Payload)
    if ($null -ne $Payload -and $null -ne $Payload.error -and $Payload.error.message) {
        return [string]$Payload.error.message
    }
    if ($null -ne $Payload -and $Payload.message) {
        return [string]$Payload.message
    }
    if ($Status -eq 401 -or $Status -eq 403) {
        return "API Key 无效、权限不足，或当前 Key 无权使用所选模型。"
    }
    if ($Status -eq 404) { return "模型或接口不存在，请核对模型名称。" }
    if ($Status -eq 429) { return "请求过于频繁或账户额度不足，请稍后重试并检查余额。" }
    if ($Status -ge 500) { return "模型服务商暂时不可用，请稍后重试。" }
    return "模型服务商返回错误（${Status}）。"
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
try {
    $listener.Start()
}
catch {
    try {
        Invoke-WebRequest -UseBasicParsing -Uri "${prefix}health" -TimeoutSec 2 | Out-Null
        Start-Process $prefix
        Write-Host "工具已经在运行，已重新打开浏览器。"
        exit 0
    }
    catch {
        Write-Host "无法启动本机服务。Windows 拒绝监听端口 ${port}。" -ForegroundColor Red
        Write-Host "建议安装 Python 3 后重新双击“启动工具.cmd”。"
        exit 1
    }
}

$httpClient = [System.Net.Http.HttpClient]::new()
$httpClient.Timeout = [TimeSpan]::FromSeconds(150)

Write-Host "论文可视化解读生成器已启动。" -ForegroundColor Green
Write-Host "本机地址：${prefix}"
Write-Host "请保持此窗口打开；关闭窗口即可停止服务。"
Start-Process $prefix

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        try {
            $method = $context.Request.HttpMethod.ToUpperInvariant()
            $path = $context.Request.Url.AbsolutePath

            if ($method -eq "OPTIONS") {
                Send-Bytes -Context $context -Status 204 -ContentType "text/plain" -Body ([byte[]]@())
                continue
            }

            if ($method -eq "GET") {
                if ($path -eq "/health") {
                    Send-Json -Context $context -Status 200 -Payload @{ ok = $true }
                    continue
                }
                if ($path -eq "/favicon.ico") {
                    Send-Bytes -Context $context -Status 204 -ContentType "image/x-icon" -Body ([byte[]]@())
                    continue
                }
                if ($path -eq "/" -or $path -eq "/index.html" -or $path -eq "/$htmlName") {
                    if (-not (Test-Path -LiteralPath $htmlPath -PathType Leaf)) {
                        Send-Json -Context $context -Status 500 -Payload @{ error = @{ message = "缺少文件：$htmlName" } }
                        continue
                    }
                    $bytes = [IO.File]::ReadAllBytes($htmlPath)
                    Send-Bytes -Context $context -Status 200 -ContentType "text/html; charset=utf-8" -Body $bytes
                    continue
                }
                Send-Json -Context $context -Status 404 -Payload @{ error = @{ message = "页面不存在。" } }
                continue
            }

            if ($method -ne "POST" -or $path -ne "/api/model") {
                Send-Json -Context $context -Status 404 -Payload @{ error = @{ message = "接口不存在。" } }
                continue
            }

            $contentLength = [int64]$context.Request.ContentLength64
            if ($contentLength -le 0 -or $contentLength -gt $maxRequestBytes) {
                Send-Json -Context $context -Status 413 -Payload @{ error = @{ message = "论文文本为空或过长，请缩短内容后重试。" } }
                continue
            }

            $reader = [IO.StreamReader]::new($context.Request.InputStream, [Text.Encoding]::UTF8)
            $raw = $reader.ReadToEnd()
            $reader.Close()
            try {
                $payload = $raw | ConvertFrom-Json
            }
            catch {
                Send-Json -Context $context -Status 400 -Payload @{ error = @{ message = "请求内容格式无效，请刷新页面后重试。" } }
                continue
            }

            $provider = [string]$payload.provider
            $apiKey = ([string]$payload.apiKey).Trim()
            $model = ([string]$payload.model).Trim()
            $systemPrompt = ([string]$payload.system).Trim()
            $userPrompt = ([string]$payload.user).Trim()
            $config = $providers[$provider]

            if ($null -eq $config) {
                Send-Json -Context $context -Status 400 -Payload @{ error = @{ message = "本机转发仅支持 OpenAI、Claude、DeepSeek 和通义千问。" } }
                continue
            }
            if ([string]::IsNullOrWhiteSpace($apiKey) -or $apiKey.Length -gt 500) {
                Send-Json -Context $context -Status 400 -Payload @{ error = @{ message = "请填写有效的 API Key。" } }
                continue
            }
            if ([string]::IsNullOrWhiteSpace($model) -or $model.Length -gt 160) {
                Send-Json -Context $context -Status 400 -Payload @{ error = @{ message = "请填写有效的模型名称。" } }
                continue
            }
            if ([string]::IsNullOrWhiteSpace($systemPrompt) -or [string]::IsNullOrWhiteSpace($userPrompt) -or ($systemPrompt.Length + $userPrompt.Length) -gt $maxPromptCharacters) {
                Send-Json -Context $context -Status 400 -Payload @{ error = @{ message = "论文文本为空或过长，请重新上传较短的 PDF。" } }
                continue
            }

            $isAnthropic = $config.Protocol -eq "anthropic"
            if ($isAnthropic) {
                $upstreamPayload = @{
                    model = $model
                    max_tokens = 7000
                    system = $systemPrompt
                    messages = @(@{ role = "user"; content = $userPrompt })
                }
            }
            else {
                $upstreamPayload = @{
                    model = $model
                    messages = @(
                        @{ role = "system"; content = $systemPrompt },
                        @{ role = "user"; content = $userPrompt }
                    )
                    stream = $false
                }
            }

            $requestMessage = [System.Net.Http.HttpRequestMessage]::new()
            $requestMessage.Method = [System.Net.Http.HttpMethod]::Post
            $requestMessage.RequestUri = [Uri]$config.Endpoint
            $upstreamJson = $upstreamPayload | ConvertTo-Json -Depth 20 -Compress
            $requestMessage.Content = [System.Net.Http.StringContent]::new($upstreamJson, [Text.Encoding]::UTF8, "application/json")
            if ($isAnthropic) {
                $requestMessage.Headers.TryAddWithoutValidation("x-api-key", $apiKey) | Out-Null
                $requestMessage.Headers.TryAddWithoutValidation("anthropic-version", "2023-06-01") | Out-Null
            }
            else {
                $requestMessage.Headers.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new("Bearer", $apiKey)
            }

            try {
                $upstreamResponse = $httpClient.SendAsync($requestMessage).GetAwaiter().GetResult()
                $status = [int]$upstreamResponse.StatusCode
                $upstreamText = $upstreamResponse.Content.ReadAsStringAsync().GetAwaiter().GetResult()
            }
            catch {
                Send-Json -Context $context -Status 502 -Payload @{ error = @{ message = "本机服务无法连接模型服务商，请检查网络后重试。" } }
                continue
            }
            finally {
                $requestMessage.Dispose()
            }

            try {
                $result = $upstreamText | ConvertFrom-Json
            }
            catch {
                Send-Json -Context $context -Status 502 -Payload @{ error = @{ message = "模型服务商返回了无法识别的内容。" } }
                continue
            }

            if ($status -lt 200 -or $status -ge 300) {
                $errorMessage = Get-ProviderError -Status $status -Payload $result
                Send-Json -Context $context -Status $status -Payload @{ error = @{ message = $errorMessage } }
                continue
            }

            $text = ""
            if ($isAnthropic) {
                $parts = @($result.content | Where-Object { $_.type -eq "text" } | ForEach-Object { [string]$_.text })
                $text = $parts -join "`n"
            }
            elseif ($null -ne $result.choices -and $result.choices.Count -gt 0) {
                $text = [string]$result.choices[0].message.content
            }

            if ([string]::IsNullOrWhiteSpace($text)) {
                Send-Json -Context $context -Status 502 -Payload @{ error = @{ message = "模型没有返回可用文本，请核对模型名称后重试。" } }
                continue
            }
            Send-Json -Context $context -Status 200 -Payload @{ text = $text }
        }
        catch {
            try {
                Send-Json -Context $context -Status 500 -Payload @{ error = @{ message = "本机服务处理请求失败，请重新启动工具。" } }
            }
            catch {
                try { $context.Response.Abort() } catch { }
            }
        }
    }
}
finally {
    $httpClient.Dispose()
    $listener.Stop()
    $listener.Close()
}
