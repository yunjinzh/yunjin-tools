# 云金阅读

手机优先的 PDF 阅读器 MVP。支持浏览器与 PWA，书籍和阅读进度保存在本机，无需登录。

## 已实现

- 本地 PDF 导入：单本最大 50 MB，支持多选、内容去重、封面生成、文件异常提示。
- 本地书架：封面、书名、页数、阅读进度、最近阅读排序、删除。
- PDF 阅读：连续上下滚动、文字选择、内置目录、页码跳转、上一页/下一页、缩放、适应宽度/整页。
- 自动续读：保存页码及页面内位置，刷新、重新打开后恢复。
- 明亮、暖纸、夜间主题；PDF 保留原书排版，夜间使用显示滤镜。
- 离线启动与阅读：应用、PDF.js worker、中文字体资源均在本地缓存；可添加到主屏幕。
- 原创三页中文示例书，可直接体验。

## 本地运行

使用 Node.js 22.12+（已在 Node.js 24 验证）：

```powershell
cd reader
npm install
npm run dev
```

开发服务器地址以终端输出为准。Service Worker 仅在生产构建中启用，避免开发时受到旧缓存影响。

```powershell
npm test
npm run build
npm run preview -- --port 4173
npm run test:e2e
```

端到端测试优先使用系统 Chrome/Edge；其他环境可设置 `CHROME_PATH`，或自行安装 Playwright Chromium。测试自动启动生产预览，默认端口 4173。

## 使用与限制

1. 在书架选择“导入 PDF”，或点击“体验示例书”。单本导入成功后自动打开。
2. 阅读器上下滚动；底部切页、跳页及缩放，右上角打开目录或阅读设置。
3. 首次显示“离线已就绪”后，可以断网重新打开并阅读。

PDF 为固定排版，首版不提供字号/行距重排、OCR、批注、表单编辑、密码输入、云同步或其他电子书格式。扫描 PDF 可以显示，文字选择取决于文件是否包含文字层。

书籍保存在当前浏览器的 IndexedDB 中；清除网站数据、卸载浏览器或系统回收存储可能清空书架，请保留原始 PDF。浏览器开发服务器绑定本机，手机实机离线与安装应使用 HTTPS 部署地址；localhost 仅供本机验证。

## 结构与测试

- `reader/src/main.js`：界面、PDF.js 阅读器与用户交互。
- `reader/src/storage.js`：IndexedDB v2，PDF 文件与元数据分表存放，进度更新不复制整本书。
- `reader/scripts/build.mjs`：构建、整理 PDF 字体资源、生成带内容版本号的离线缓存。
- `reader/tests/`：模型边界、存储事务与迁移、中文 PDF、浏览器阅读流程及离线续读测试。
- `.openai/hosting.json`：私有 Sites 静态托管配置。

生产构建输出到仓库根目录 `dist/`；构建产物和浏览器测试截图不纳入 Git。

所有 PDF 渲染代码使用 Mozilla PDF.js（Apache-2.0），许可证随构建资源提供。示例书为本项目原创，生成脚本位于 `reader/scripts/create-sample.py`。
