"""Subset official Adobe Source Han Serif SC 2.003 for this static site.

Usage: python scripts/build-title-fonts.py /absolute/path/SourceHanSerifSC-VF.otf
Font outlines are preserved; derived names respect the OFL reserved name.
"""
from pathlib import Path
import copy
import json
import sys
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

root = Path(__file__).resolve().parents[1]
target = root / 'dist' / 'fonts'
target.mkdir(exist_ok=True)
text = ''.join((root / 'dist' / filename).read_text() for filename in
               ('index.html', 'styles.css', 'scene3d.css', 'data.js', 'engine.js',
                'game-core.js', 'scene3d.js', 'app.js'))
unicodes = set(map(ord, text)) | set(range(32, 127))
font = TTFont(sys.argv[1])
original_cmap = font.getBestCmap()
supported = unicodes & set(original_cmap)
missing_cjk = sorted(c for c in unicodes if 0x3400 <= c <= 0x9FFF and c not in original_cmap)
assert not missing_cjk, missing_cjk
options = subset.Options()
options.name_IDs = ['*']
options.name_languages = ['*']
options.layout_features = ['*']
options.recalc_bounds = True
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=supported)
subsetter.subset(font)
results = []
for weight, style in ((400, 'Regular'), (500, 'Medium'), (600, 'SemiBold')):
    instance = instantiateVariableFont(copy.deepcopy(font), {'wght': weight},
                                      inplace=True, downgradeCFF2=True)
    family = 'Stratagem Serif SC'
    full = family + ' ' + style
    postscript = 'StratagemSerifSC-' + style
    names = {1: family, 2: style, 3: full + '; Adobe2.003; SiteSubset',
             4: full, 6: postscript, 16: family, 17: style}
    for record in instance['name'].names:
        if record.nameID in names:
            record.string = names[record.nameID].encode(record.getEncoding(), errors='replace')
    for platform, encoding, language in ((3, 1, 0x409), (0, 4, 0)):
        for name_id, value in names.items():
            instance['name'].setName(value, name_id, platform, encoding, language)
    if 'CFF ' in instance:
        cff = instance['CFF '].cff
        cff.fontNames = [postscript]
        cff.topDictIndex[0].FullName = full
        cff.topDictIndex[0].FamilyName = family
    instance['OS/2'].usWeightClass = weight
    instance.flavor = 'woff'
    filename = target / f'stratagem-serif-sc-{weight}.woff'
    instance.save(filename)
    output = TTFont(filename)
    assert supported <= set(output.getBestCmap())
    assert output['OS/2'].usWeightClass == weight
    results.append({'weight': weight, 'file': filename.name,
                    'bytes': filename.stat().st_size, 'characters': len(supported)})
print(json.dumps({'fonts': results, 'missingCJK': missing_cjk}, ensure_ascii=False))
