#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
PORT="${PORT:-4173}" HOST="${HOST:-0.0.0.0}" node server.mjs
