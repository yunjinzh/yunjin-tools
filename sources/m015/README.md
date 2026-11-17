# 原作工坊

基于一篇 AI PPT 复盘文章已取得正文与目录的产品化实现。原文链接与阅读边界均在文章要点页面中标明。

## 使用

发布目录为 dist，dist/index.html 是自包含 HTML，可双击离线运行。默认在浏览器进行资料编排、逐页编辑、保存与导出。

- 导入 TXT、Markdown、DOCX 和 PPTX 的文字。
- 原生可编辑 PPTX（文字、基础图形、图片对象、讲稿备注）。
- HTML 演示、Markdown 讲稿、PNG 页面、JSON 项目备份、ZIP 交付包。
- 可选 Chat Completions 兼容 AI 接口；访问密钥仅在当前标签页内存；发送资料由用户显式触发。
- 资料编排不会伪装为调用大模型，也不保证事实、原创性或销售效果。

## 构建

node build.cjs

无需构建依赖安装。供应库为 PptxGenJS 和 JSZip，浏览器发行版保留在 dist/vendor；构建时内联进 HTML。

## 验证范围

对核心编排、导入归一化、输入转义、情景试算与独立 HTML 脚本完成检查。实际生成 PPTX 后检查 OpenXML 对象，并通过 LibreOffice 打开转换为 PDF 进行视觉核对。未执行浏览器端逐按钮测试；可用浏览器会话在读取来源文档时发生凭据状态异常，且本环境未提供 Sites 要求的 control-browser 技能。

AI 适配器未使用付费接口进行端到端调用。需由使用者配置 HTTPS 服务地址、模型和密钥，并确保服务允许浏览器跨域请求。
