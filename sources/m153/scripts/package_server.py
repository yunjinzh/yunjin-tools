"""Rebuild the downloadable standalone server from this exact checkout."""
from pathlib import Path
from tempfile import NamedTemporaryFile
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
target = dist / 'assets' / 'motion-atelier-server.zip'
files = [root / name for name in ('README.md', 'Dockerfile')]
files.extend(p for p in (root / 'server').iterdir() if p.is_file())
files.extend(p for p in (root / 'tests').iterdir() if p.is_file())
files.extend(p for p in dist.iterdir() if p.is_file())
files.extend((dist / 'assets' / 'notices').glob('*'))
# The standalone build processes media on its server. The client still needs
# the multimedia reader, graphics library, and the example files.
files.extend(dist / 'assets' / name for name in (
    'demo-jumping-jacks.mp4', 'demo-white.mp4', 'demo-source.txt',
    'media.mjs', 'three.mjs', 'pose.task'
))
with NamedTemporaryFile(dir=target.parent, suffix='.tmp', delete=False) as temp:
    path = Path(temp.name)
try:
    with ZipFile(path, 'w', ZIP_DEFLATED, compresslevel=6) as bundle:
        for file in sorted(files):
            bundle.write(file, file.relative_to(root))
    with ZipFile(path) as bundle:
        if bundle.testzip() is not None:
            raise ValueError('Archive integrity check failed')
    path.chmod(0o644)
    path.replace(target)
finally:
    path.unlink(missing_ok=True)
