"""Local static app + fixed-upstream Chat Completions proxy. Python 3.9+, stdlib only.
No LLM-supplied code is executed. Optional AI key lives in the server environment.
"""
import json, os, pathlib, urllib.request, urllib.error, urllib.parse
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = pathlib.Path(__file__).resolve().parents[1] / 'dist'
UPSTREAM = os.getenv('AI_CHAT_URL', '')
API_KEY = os.getenv('AI_API_KEY', '')
PORT = int(os.getenv('PORT', '8787'))
ALLOWED = set(filter(None, os.getenv('ALLOWED_ORIGINS', '').split(',')))
ALLOWED.update({f'http://127.0.0.1:{PORT}', f'http://localhost:{PORT}'})

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # Never forward an Authorization header across a redirect.

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def permitted(self):
        return self.headers.get('Origin') in ALLOWED

    def end_headers(self):
        origin = self.headers.get('Origin')
        if origin in ALLOWED:
            self.send_header('Access-Control-Allow-Origin', origin)
            self.send_header('Vary', 'Origin')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        super().end_headers()

    def do_OPTIONS(self):
        if not self.permitted():
            return self.reply(403, {'error': 'Origin not allowed'})
        self.send_response(204)
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def reply(self, code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != '/v1/chat/completions':
            return self.reply(404, {'error': 'Not found'})
        if not self.permitted():
            return self.reply(403, {'error': 'Origin not allowed'})
        parsed = urllib.parse.urlsplit(UPSTREAM)
        if parsed.scheme != 'https' and not (parsed.scheme == 'http' and parsed.hostname in ('localhost', '127.0.0.1')):
            return self.reply(503, {'error': 'Set AI_CHAT_URL to your complete Chat Completions endpoint'})
        if parsed.username or parsed.password or parsed.query or parsed.fragment:
            return self.reply(503, {'error': 'Invalid upstream URL configuration'})
        try:
            size = int(self.headers.get('Content-Length', '0'))
            if not 0 < size <= 100_000:
                return self.reply(413, {'error': 'Request size limit'})
            data = json.loads(self.rfile.read(size))
            if not isinstance(data.get('messages'), list) or not isinstance(data.get('model'), str):
                return self.reply(400, {'error': 'Invalid request'})
            # Whitelist payload fields, never proxy arbitrary paths or URLs.
            payload = json.dumps({'model': data['model'], 'messages': data['messages'], 'stream': False}).encode()
            auth = ('Bearer ' + API_KEY) if API_KEY else self.headers.get('Authorization', '')
            headers = {'Content-Type': 'application/json'}
            if auth:
                headers['Authorization'] = auth
            req = urllib.request.Request(UPSTREAM, data=payload, headers=headers, method='POST')
            with urllib.request.build_opener(NoRedirect).open(req, timeout=115) as response:
                raw = response.read(1_500_001)
                if len(raw) > 1_500_000:
                    return self.reply(502, {'error': 'Response size limit'})
                result = json.loads(raw)
            self.reply(200, result)
        except urllib.error.HTTPError as exc:
            self.reply(exc.code, {'error': 'Upstream HTTP error', 'status': exc.code})
        except (json.JSONDecodeError, ValueError):
            self.reply(400, {'error': 'Invalid JSON'})
        except Exception:
            self.reply(502, {'error': 'AI service unavailable or timed out'})

    def log_message(self, fmt, *args):
        # Never log headers, prompts, response bodies or credentials.
        print('%s %s' % (self.command, self.path.split('?')[0]))

if __name__ == '__main__':
    if not ROOT.is_dir():
        raise SystemExit('Missing dist folder. Build with npm install && npm run build.')
    server = ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
    print(f'Open http://127.0.0.1:{PORT}  |  Ctrl+C to stop')
    print('AI proxy ' + ('configured' if UPSTREAM else 'not configured; parameter mode works offline'))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
