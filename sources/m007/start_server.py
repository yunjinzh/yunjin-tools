#!/usr/bin/env python3
"""Start the static application locally; no third-party Python packages needed."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser

ROOT = Path(__file__).resolve().parent / "dist"
HOST = "127.0.0.1"
PORT = 8765

class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      ".js": "application/javascript", ".mjs": "application/javascript",
                      ".json": "application/json", ".svg": "image/svg+xml",
                      ".glb": "model/gltf-binary", ".bin": "application/octet-stream",
                      ".hdr": "application/octet-stream"}

if __name__ == "__main__":
    try:
        server = ThreadingHTTPServer((HOST, PORT), partial(Handler, directory=str(ROOT)))
    except OSError as error:
        print(f"Cannot start local preview on {HOST}:{PORT}: {error}")
        raise SystemExit(1)
    print(f"Embodied Studio is running at http://{HOST}:{PORT}/")
    print("Press Ctrl+C to stop.")
    webbrowser.open(f"http://{HOST}:{PORT}/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
