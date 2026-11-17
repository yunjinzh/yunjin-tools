#!/usr/bin/env python3
"""Loopback-only relay for the downloadable paper visual digest tool."""

from __future__ import annotations

import json
import threading
import urllib.error
import urllib.request
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse


HOST = "127.0.0.1"
PORT = 8765
ROOT = Path(__file__).resolve().parent
HTML_NAME = "论文可视化解读生成器_本地版.html"
MAX_REQUEST_BYTES = 800_000
MAX_PROMPT_CHARACTERS = 600_000

PROVIDERS = {
    "openai": {
        "protocol": "openai",
        "endpoint": "https://api.openai.com/v1/chat/completions",
    },
    "anthropic": {
        "protocol": "anthropic",
        "endpoint": "https://api.anthropic.com/v1/messages",
    },
    "deepseek": {
        "protocol": "openai",
        "endpoint": "https://api.deepseek.com/chat/completions",
    },
    "qwen": {
        "protocol": "openai",
        "endpoint": "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    },
}


def clean_string(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def provider_error(status: int, payload: Any) -> str:
    if isinstance(payload, dict):
        error = payload.get("error")
        if isinstance(error, dict) and isinstance(error.get("message"), str):
            return error["message"][:600]
        if isinstance(payload.get("message"), str):
            return payload["message"][:600]
    if status in (401, 403):
        return "API Key 无效、权限不足，或当前 Key 无权使用所选模型。"
    if status == 404:
        return "模型或接口不存在，请核对模型名称。"
    if status == 429:
        return "请求过于频繁或账户额度不足，请稍后重试并检查余额。"
    if status >= 500:
        return "模型服务商暂时不可用，请稍后重试。"
    return f"模型服务商返回错误（{status}）。"


class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "PaperVisualDigestLocal/1.0"

    def log_message(self, _format: str, *args: Any) -> None:
        # Do not print request bodies, keys, or paper content.
        return

    def end_common_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "content-type")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")

    def send_json(self, payload: Any, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_common_headers()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self.send_header("Content-Length", "0")
        self.end_common_headers()
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        path = unquote(urlparse(self.path).path)
        if path == "/health":
            self.send_json({"ok": True})
            return
        if path == "/favicon.ico":
            self.send_response(204)
            self.send_header("Content-Length", "0")
            self.end_common_headers()
            self.end_headers()
            return
        if path in ("/", "/index.html", f"/{HTML_NAME}"):
            html_path = ROOT / HTML_NAME
            if not html_path.is_file():
                self.send_json({"error": {"message": f"缺少文件：{HTML_NAME}"}}, 500)
                return
            body = html_path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_common_headers()
            self.end_headers()
            self.wfile.write(body)
            return
        self.send_json({"error": {"message": "页面不存在。"}}, 404)

    def do_POST(self) -> None:  # noqa: N802
        if urlparse(self.path).path != "/api/model":
            self.send_json({"error": {"message": "接口不存在。"}}, 404)
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            content_length = 0
        if content_length <= 0 or content_length > MAX_REQUEST_BYTES:
            self.send_json({"error": {"message": "论文文本为空或过长，请缩短内容后重试。"}}, 413)
            return

        try:
            raw = self.rfile.read(content_length)
            if len(raw) > MAX_REQUEST_BYTES:
                raise ValueError("payload too large")
            payload = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError, ValueError):
            self.send_json({"error": {"message": "请求内容格式无效，请刷新页面后重试。"}}, 400)
            return

        provider = clean_string(payload.get("provider"))
        api_key = clean_string(payload.get("apiKey"))
        model = clean_string(payload.get("model"))
        system = clean_string(payload.get("system"))
        user = clean_string(payload.get("user"))
        config = PROVIDERS.get(provider)

        if not config:
            self.send_json({"error": {"message": "本机转发仅支持 OpenAI、Claude、DeepSeek 和通义千问。"}}, 400)
            return
        if not api_key or len(api_key) > 500:
            self.send_json({"error": {"message": "请填写有效的 API Key。"}}, 400)
            return
        if not model or len(model) > 160:
            self.send_json({"error": {"message": "请填写有效的模型名称。"}}, 400)
            return
        if not system or not user or len(system) + len(user) > MAX_PROMPT_CHARACTERS:
            self.send_json({"error": {"message": "论文文本为空或过长，请重新上传较短的 PDF。"}}, 400)
            return

        is_anthropic = config["protocol"] == "anthropic"
        if is_anthropic:
            upstream_payload = {
                "model": model,
                "max_tokens": 7000,
                "system": system,
                "messages": [{"role": "user", "content": user}],
            }
            headers = {
                "Content-Type": "application/json",
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "User-Agent": "PaperVisualDigestLocal/1.0",
            }
        else:
            upstream_payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                "stream": False,
            }
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
                "User-Agent": "PaperVisualDigestLocal/1.0",
            }

        request = urllib.request.Request(
            config["endpoint"],
            data=json.dumps(upstream_payload, ensure_ascii=False).encode("utf-8"),
            headers=headers,
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=150) as response:
                status = response.status
                response_body = response.read()
        except urllib.error.HTTPError as error:
            status = error.code
            response_body = error.read()
        except (urllib.error.URLError, TimeoutError):
            self.send_json({"error": {"message": "本机服务无法连接模型服务商，请检查网络后重试。"}}, 502)
            return

        try:
            result = json.loads(response_body.decode("utf-8")) if response_body else {}
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_json({"error": {"message": "模型服务商返回了无法识别的内容。"}}, 502)
            return

        if status < 200 or status >= 300:
            self.send_json({"error": {"message": provider_error(status, result)}}, status)
            return

        if is_anthropic:
            content = result.get("content") if isinstance(result, dict) else []
            text = "\n".join(
                item.get("text", "")
                for item in (content if isinstance(content, list) else [])
                if isinstance(item, dict) and item.get("type") == "text"
            )
        else:
            try:
                text = result["choices"][0]["message"]["content"]
            except (KeyError, IndexError, TypeError):
                text = ""

        if not isinstance(text, str) or not text:
            self.send_json({"error": {"message": "模型没有返回可用文本，请核对模型名称后重试。"}}, 502)
            return
        self.send_json({"text": text})


def open_browser() -> None:
    webbrowser.open(f"http://{HOST}:{PORT}/")


def main() -> None:
    try:
        server = ThreadingHTTPServer((HOST, PORT), Handler)
    except OSError:
        try:
            with urllib.request.urlopen(f"http://{HOST}:{PORT}/health", timeout=2):
                open_browser()
                print("工具已经在运行，已重新打开浏览器。")
                return
        except Exception as error:
            raise SystemExit(f"无法启动本机服务：端口 {PORT} 已被占用。\n{error}") from error

    print("论文可视化解读生成器已启动。")
    print(f"本机地址：http://{HOST}:{PORT}/")
    print("请保持此窗口打开；关闭窗口即可停止服务。")
    threading.Timer(0.6, open_browser).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
