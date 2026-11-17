# GeoPBF 三维场景生成器

GeoPBF 是一个浏览器端 OSM PBF 三维建模工具。PBF 文件在本机浏览器中流式解析，不会上传到服务器。

## 已实现

- 读取 `.osm.pbf` / `.pbf` 文件头与数据覆盖范围
- 矩形、圆形地图选区，不设面积硬上限；大范围自动启用性能保护
- Web Worker 流式解析 zlib PBF、DenseNodes、Ways、Multipolygon Relations
- 建筑、道路、水系、绿地、铁路五类 OSM 图层识别
- 按 `height`、`building:levels`、建筑用途推断建筑高度和颜色
- 道路按 `width`、`lanes`、`highway` 生成实际宽度网格
- 可选 AWS Terrain Tiles 真实高程、Esri World Imagery 影像底图
- Three.js 交互预览、图层显隐、场景统计
- GLB 2.0 与 FBX 7.4 ASCII 导出

## 本地运行

需要 Node.js 22.13 或更高版本：

```bash
npm install
npm run dev
```

生产构建与测试：

```bash
npm run build
npx vitest run --config vitest.config.ts
```

## 数据与授权

OSM 数据 © OpenStreetMap contributors，遵循 ODbL 1.0。在线地形来自 AWS Open Data Terrain Tiles；影像来自 Esri World Imagery，发布成果时请保留相应来源标注。
