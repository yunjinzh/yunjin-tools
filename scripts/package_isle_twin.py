#!/usr/bin/env python3
"""Prepare m150 from its preserved dist files without modifying the originals."""
import argparse
import hashlib
import json
import re
import shutil
import zipfile
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
source = args.source.resolve() / 'dist'
output = args.output.resolve()
if output.exists() or output.is_relative_to(args.source.resolve()):
    parser.error('Use a new output directory outside the original source snapshot')
shutil.copytree(source, output)

# Package the original page before the shared Pages runtime rewrites its URLs.
html = (source / 'index.html').read_text()
style = '<link rel="stylesheet" href="style.css">'
assert html.count(style) == 1
html = html.replace(style, '<style>' + (source / 'style.css').read_text() +
                    '</style><script>window.IS_OFFLINE=true;</script>')
scripts = re.findall(r'<script src="([^"]+)"></script>', html)
assert len(scripts) == 8
for name in scripts:
    code = re.sub(r'</script', r'<\\/script', (source / name).read_text(), flags=re.I)
    html = html.replace('<script src="' + name + '"></script>', '<script>' + code + '</script>')
archive = output / 'isle-twin-offline.zip'
entry = zipfile.ZipInfo('isle-twin-studio.html', (2026, 11, 22, 0, 0, 0))
entry.compress_type = zipfile.ZIP_DEFLATED
entry.external_attr = 0o644 << 16
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
    bundle.writestr(entry, html.encode())

app = (output / 'app.js').read_text()
start = app.index('async function downloadOffline(){')
end = app.index('\ndocument.addEventListener(\'contextmenu\'', start)
replacement = '''async function downloadOffline(){try{
 const response=await fetch('isle-twin-offline.zip');
 if(!response.ok)throw Error('无法读取离线文件');
 download(await response.blob(),'屿境数字孪生工作室-离线版.zip');
 toast('离线工作室已下载，解压后打开 HTML');
}catch(e){toast('未能下载离线工作室 · '+e.message);}}
'''
(output / 'app.js').write_text(app[:start] + replacement.rstrip() + app[end:])
print(json.dumps({'archive': str(archive), 'entry': entry.filename,
                  'bytes': archive.stat().st_size,
                  'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(),
                  'html_bytes': len(html.encode()),
                  'html_sha256': hashlib.sha256(html.encode()).hexdigest()}, ensure_ascii=False))
