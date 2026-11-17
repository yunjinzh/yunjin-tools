#!/usr/bin/env python3
"""Create a portable source + static-runtime bundle without host identity."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

base = Path(__file__).resolve().parent
out = base / 'dist' / 'downloads' / 'fieldlab-local-v0.1.zip'
out.parent.mkdir(exist_ok=True)
files = [p for p in (base/'dist').rglob('*') if p.is_file() and 'downloads' not in p.relative_to(base/'dist').parts]
files += list((base/'tests').glob('*.mjs'))
files += [base / p for p in ['README.md','package.json','package-lock.json','start-server.py','start-windows.bat','build-delivery.py']]
with ZipFile(out, 'w', ZIP_DEFLATED) as bundle:
    for p in files:
        bundle.write(p, Path('fieldlab-v0.1') / p.relative_to(base))
with ZipFile(out) as bundle:
    assert bundle.testzip() is None
    assert not any('/.openai/' in n or '/node_modules/' in n or '/.git/' in n for n in bundle.namelist())
print(f'{out} ({out.stat().st_size} bytes, {len(files)} files)')
