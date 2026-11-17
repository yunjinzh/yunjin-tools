from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
dist = root / 'dist'
output = dist / 'portal-offline.zip'
readme = '''数字孪生应用技术员 · 职业能力门户

使用：解压本文件夹后，双击 index.html，在 Chrome / Edge 等现代浏览器打开。
三维场景、能力图谱、学习、自测与实验均可本地使用；外部官网资源链接需联网。
实验数据为教学模拟。学习记录保存在当前浏览器；请使用“我的学习”导出档案。
依据：中华人民共和国人力资源和社会保障部、中华人民共和国工业和信息化部
《数字孪生应用技术员国家职业标准（2024年版）》。
企业资料与案例配图来源：北京飞渡科技股份有限公司官方网站，2026-10-26核验。
云金 + OpenAI
'''
with ZipFile(output, 'w', ZIP_DEFLATED, compresslevel=8) as z:
    for file in sorted(dist.rglob('*')):
        if file.is_file() and file != output and not file.name.startswith('qa-') and file.name != 'portal-preview.webp':
            z.write(file, file.relative_to(dist))
    z.writestr('使用说明.txt', readme)
print(f'Offline package: {output.stat().st_size} bytes')
