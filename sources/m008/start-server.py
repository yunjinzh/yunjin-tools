#!/usr/bin/env python3
"""Local-only static server for the Field Lab prototype."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import mimetypes
import threading
import webbrowser

mimetypes.add_type('text/javascript', '.js')
mimetypes.add_type('application/json', '.json')
root = Path(__file__).resolve().parent / 'dist'
url = 'http://127.0.0.1:8088'
try:
    server = ThreadingHTTPServer(('127.0.0.1', 8088), partial(SimpleHTTPRequestHandler, directory=str(root)))
except OSError as exc:
    raise SystemExit(f'Cannot start local server on port 8088: {exc}')
print(f'Field Lab is available at {url}\nPress Ctrl+C to stop.')
threading.Timer(0.6, lambda: webbrowser.open(url)).start()
try:
    server.serve_forever()
except KeyboardInterrupt:
    server.server_close()
