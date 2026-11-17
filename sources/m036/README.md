# 山河入图 · 古今中外地图三维展厅

React 19 / TypeScript / Vinext / Three.js 三维地图史公共教育展览。

- 九个时代展区：空间认知、木帛山川、制图有法、方格山河、航路世界、经纬测绘、从地到空、数字图层、立体未来。
- 25 件真实地图作品与 25 块双面地图展板，涵盖中国、东亚、欧洲与现代全球地图。含版本、馆藏、数字化来源与原始图目链接。
- 每幅地图分别提供本地缩略图、预览图、高清图；显示实际像素，支持旋转、拖动、连续翻阅与缩放，加载失败可重试。
- 方格寻踪、两测站测角定位、图层组合三个互动工坊。
- 三维环视、步行、俯视、语音朗读、自动导览、待机模式、图片导出。
- Three.js WebGL 优先；无 WebGL 时采用同场景、同相机和同射线点选的 Canvas 兼容渲染，省略光照阴影，帧率较低。
- 离线保存仅由观众主动启动，使用浏览器 Cache Storage；生产 HTTPS 环境需要首次完整保存，外部史料页面不包含在离线资源中。

## 开发

使用项目现有 pnpm 版本安装依赖，再运行 `pnpm dev`。`pnpm build` 构建 Cloudflare Worker 与浏览器资源，并生成离线资源清单。`pnpm exec tsc --noEmit` 检查类型。`pnpm validate:maps` 检查全部 75 个图片文件、JPEG 像素、来源字段与高清图体积；构建前自动执行。

## 编辑

- `app/exhibits.ts`：时代文字、史料链接与互动工坊。
- `app/map-catalog.json`：25 幅作品、日期、版本、来源与版本化图片路径。
- `app/map-image.tsx`：渐进加载、缓存命中和失败重试。
- `app/scene.ts`：地形、相机、展厅几何、测角和网格逻辑。
- `app/canvas-renderer.ts`：不支持 WebGL 设备的兼容显示。
- `app/gallery.tsx` 与 `app/globals.css`：交互与视觉布局。
- `public/maps/credits.json`：图像来源记录。

教学地形不对应真实地区。远古序厅是空间认知教学情境；不把推想当作已证实史实。后世拓片、影印版与原始编绘年代分别标注。正式展出前可请地图史研究人员继续校核展签。

字体：Ma Shan Zheng（马善政毛笔字体）用于标题，Noto Serif SC 与 Noto Sans SC 子集用于正文，SIL Open Font License；见 `public/fonts/`。
