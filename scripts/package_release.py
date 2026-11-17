#!/usr/bin/env python3
"""Restore and verify the complete Windows ZIP from versioned split parts."""
from pathlib import Path
import hashlib
import json
import shutil
import zipfile

root = Path(__file__).resolve().parents[1]
meta = json.loads((root / 'downloads/shiguang-package.json').read_text())
output = root / 'release-packages'
output.mkdir(exist_ok=True)
target = output / meta['filename']
with target.open('wb') as stream:
    for part in meta['parts']:
        source = root / 'downloads' / part['file']
        assert source.stat().st_size == part['bytes'], f"Wrong part size: {source}"
        assert hashlib.sha256(source.read_bytes()).hexdigest() == part['sha256'], f"Corrupt part: {source}"
        with source.open('rb') as fragment:
            shutil.copyfileobj(fragment, stream)
assert target.stat().st_size == meta['bytes']
assert hashlib.sha256(target.read_bytes()).hexdigest() == meta['sha256']
with zipfile.ZipFile(target) as archive:
    assert archive.testzip() is None, 'ZIP integrity check failed'
shutil.copy2(root / 'downloads/Jimeng-Music-Studio-v1.2.0.zip', output)
print(f'PASS: {target.name}; {meta["bytes"]} bytes; SHA-256 and ZIP CRC verified')
