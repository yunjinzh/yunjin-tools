#!/usr/bin/env python3
"""Prepare m152 while retaining the exact original standalone HTML download."""
import argparse
import hashlib
import json
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
source = args.source.resolve()
output = args.output.resolve()
if output.exists() or output.is_relative_to(source):
    parser.error('Use a new output directory outside the original source snapshot')
original = (source / 'dist/index.html').read_bytes()
html = original.decode('utf-8')
old = r"""offline:()=>{const a=el('a');a.href=location.href.split(/[?#]/)[0].replace(/\/$/,'/index.html');a.download='仗剑入唐_离线版.html';document.body.append(a);a.click();a.remove()}"""
new = """offline:async()=>{const button=document.querySelector('[data-act="offline"]');button.disabled=true;button.textContent='正在准备离线版…';try{
 const response=await fetch('tang-youxia-offline.bin');if(!response.ok)throw Error('Offline download unavailable');
 const url=URL.createObjectURL(new Blob([await response.arrayBuffer()],{type:'text/html;charset=utf-8'}));
 const a=el('a');a.href=url;a.download='仗剑入唐_离线版.html';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
 button.textContent='已下载 · 再次下载';
}catch{button.textContent='下载失败，点击重试';}finally{button.disabled=false}}"""
if html.count(old) != 1:
    parser.error('The expected original download handler was not found exactly once')
output.mkdir(parents=True)
(output / 'index.html').write_text(html.replace(old, new))
# The shared builder keeps .bin payloads unchanged instead of injecting Pages scripts.
(output / 'tang-youxia-offline.bin').write_bytes(original)
print(json.dumps({'entry': str(output / 'index.html'), 'offline_bytes': len(original),
                  'offline_sha256': hashlib.sha256(original).hexdigest(),
                  'offline_filename': '仗剑入唐_离线版.html'}, ensure_ascii=False))
