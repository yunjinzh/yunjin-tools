# 科研资助洞察

四份附件对齐分析，40,716 条记录。全部数据、分析规则与开源字体内嵌到单文件页面，无运行时外部依赖。页面包含执行摘要、结构对比、主题矩阵、机构分析、筛选检索、方法说明，支持 CSV 与离线 HTML 下载。

## 重建

1. 使用安装有 openpyxl 的 Python 执行 `python analyze.py`，读取 `sources/` 四份原始附件生成 `data.json`。
2. 执行 `node verify.mjs` 核验数量、金额、关键词边界、六视图、组合筛选与导出。
3. 执行 `python build.py` 生成 `dist/index.html`。

## 分析边界

2026 国自然为部分收录样本，不计算国自然跨年增长。社科学科历史名称映射为分析便利，不保证学科范围完全等价。主题采用公开词表多标签匹配，非官方学科分类。未披露金额不补零。机构仅作机械名称标准化，不合并附属单位。

## 字体

Noto Sans CJK SC Regular / Bold，SIL OFL 1.1。`assets/` 内含子集 WOFF 与许可。子集覆盖当前页面及项目文字。若大幅更改内容、增量导入新字符，应重新从官方 Noto CJK 字体生成相应子集。

## 隐私与部署

新站默认仅所有者可见。HTML 下载会包含全部附件提取数据；下载在本地浏览器执行，不向外部接口传输数据。原始公告链接在新标签打开，需要联网。

## State architecture and agent interface

See [STATE_MACHINES.md](STATE_MACHINES.md) for the full state inventory, transition contract, persistence boundaries, and six optional browser-agent tools. `state.js` owns the pure model; `app.js` contains report views; `controller.js` owns browser effects; `exports.js` contains CSV projection. UI and agents share validated events. No new runtime packages are needed.
