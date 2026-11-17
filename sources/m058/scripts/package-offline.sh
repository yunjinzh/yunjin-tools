#!/usr/bin/env bash
set -euo pipefail

site_root="$(cd "$(dirname "$0")/.." && pwd)"
package_root="/workspace/scratch/GeoPBF-Windows"
archive_path="/workspace/scratch/GeoPBF-Windows-v1.0.0.zip"

if [[ ! -f "$site_root/offline-dist/index.html" ]]; then
  echo "offline-dist is missing; run npm run build:offline first" >&2
  exit 1
fi

mkdir -p "$package_root/app" "$package_root/runtime"
find "$package_root/app" -mindepth 1 -delete
find "$package_root/runtime" -mindepth 1 -delete
cp -R "$site_root/offline-dist/." "$package_root/app/"
cp "$site_root/offline/windows/runtime/serve.ps1" "$package_root/runtime/serve.ps1"
cp "$site_root/offline/windows/README.txt" "$package_root/README.txt"
cp "$site_root/offline/windows/THIRD_PARTY_NOTICES.txt" "$package_root/THIRD_PARTY_NOTICES.txt"
sed 's/$/\r/' "$site_root/offline/windows/GeoPBF.cmd" > "$package_root/GeoPBF.cmd"

python3 - "$archive_path" "$package_root" <<'PY'
import os
import sys
import zipfile

archive, package_root = sys.argv[1], sys.argv[2]
if os.path.exists(archive):
    os.unlink(archive)
with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as output:
    for current, _, files in os.walk(package_root):
        for name in sorted(files):
            path = os.path.join(current, name)
            relative = os.path.relpath(path, os.path.dirname(package_root))
            output.write(path, relative)
print(archive)
PY

python3 - "$archive_path" <<'PY'
import sys
import zipfile

archive = sys.argv[1]
required = {
    "GeoPBF-Windows/GeoPBF.cmd",
    "GeoPBF-Windows/runtime/serve.ps1",
    "GeoPBF-Windows/app/index.html",
    "GeoPBF-Windows/README.txt",
}
with zipfile.ZipFile(archive) as value:
    names = set(value.namelist())
    missing = required - names
    if missing:
        raise SystemExit(f"missing: {sorted(missing)}")
    if value.testzip() is not None:
        raise SystemExit("zip CRC validation failed")
    cmd = value.read("GeoPBF-Windows/GeoPBF.cmd")
    if b"\r\n" not in cmd or b"nodejs.org" in cmd:
        raise SystemExit("launcher encoding/content validation failed")
print("offline package validated")
PY
