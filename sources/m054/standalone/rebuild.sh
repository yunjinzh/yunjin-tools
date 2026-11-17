#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
node build-site.mjs
echo "网站已重新生成。"
