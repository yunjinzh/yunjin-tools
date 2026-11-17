#!/usr/bin/env python3
"""Restore original module asset paths from the shared, content-addressed store."""
from pathlib import Path
import argparse,json,shutil,hashlib
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('module',help='Module ID such as m003, gis101, or all');args=parser.parse_args()
folders=list((ROOT/'sources').iterdir()) if args.module=='all' else [ROOT/'sources'/args.module]
count=0
for folder in folders:
    manifest=folder/'migration-assets.json'
    if not manifest.exists():continue
    for rel,target in json.loads(manifest.read_text()).items():
        source=ROOT/target;dest=folder/rel
        if not source.resolve().is_relative_to((ROOT/'assets').resolve()) or not dest.resolve().is_relative_to(folder.resolve()):raise ValueError('Invalid asset path')
        if not dest.exists():dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,dest);count+=1
print(f'Restored {count} files. Original project commands can now use their original asset paths.')
