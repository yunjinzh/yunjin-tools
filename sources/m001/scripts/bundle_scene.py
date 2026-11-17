"""Bundle the pinned Three.js module and the scene into a file://-compatible script."""
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
vendor = (root / 'vendor/three.module.js').read_text()
match = re.search(r'export\s*\{([^}]+)\};?\s*$', vendor)
if not match:
    raise RuntimeError('Three.js export list not found')
exports = []
for item in match.group(1).split(','):
    names = re.split(r'\s+as\s+', item.strip())
    exports.append(f'{names[-1]}: {names[0]}')
vendor = vendor[:match.start()]
scene = (root / 'src/scene.js').read_text()
scene = re.sub(r"^import \* as THREE from [^\n]+\n", '', scene)
bundle = '(function(){\nconst THREE=(function(){\n' + vendor + '\nreturn {' + ','.join(exports) + '};\n})();\n' + scene + '\n})();\n'
(root / 'dist/scene.bundle.js').write_text(bundle)
print('Bundled scene: pinned Three.js r170 + WebGL / software renderers')
