# 字里山河 · 文字地图工坊

浏览 OpenStreetMap，读取当前视野中的命名要素，将道路名称沿线排布、水域与园地名称填入自身几何轮廓，导出高清 PNG、嵌入字体的 SVG，或保存可再次编辑的工程 JSON。

## 运行

这是无构建步骤的静态应用。将 `dist/` 部署到任意 HTTPS 静态服务器；通过 HTTP(S) 访问，不能以 `file://` 双击方式调用模块与地图服务。网站配置见 `.openai/hosting.json`。

## 使用

1. 在 OSM 底图上拖动与缩放，或输入内置地点、`纬度, 经度`、OSM 的 `#map=缩放/纬度/经度` 链接。
2. 点击“一键生成文字地图”。已读取范围内直接复用数据；“重新读取 OSM 数据”显式更新。最大单次视野为 85 km²。
3. 调整配色、文字尺度、密度与四类图层。点击文字或在名称编辑面板中修改、隐藏单个要素；仅影响本作品。
4. 导出 2048、4096、8192 像素长边的 PNG，或 SVG。高清图像由原始文字绘制命令重新栅格化，不会下载更高层级瓦片。署名保留在底部。
5. 保存工程 JSON 可保留当前地图数据与设置。重新打开工程后可继续排版和导出。地图浏览、读取新视野需要联网。

## 数据与实现

- Leaflet 1.9.4 与 Protomaps Leaflet 5.1.0（Canvas 2D 渲染，无需 WebGL），默认使用 OpenFreeMap 的 OSM 矢量底图；设置中可选择标准 OSM XYZ 瓦片或自有瓦片服务。浏览器遵循正常缓存与 Referer 行为，无瓦片批量预取。
- 公共 Overpass endpoint 默认为 `https://overpass-api.de/api/interpreter`。可在页面的数据服务设置中改为自有 HTTPS 服务。只在明确点击时读取、一次一个请求，按视野缓存；429 冷却，不自动轮换服务器。
- 不接入公共 Nominatim。位置栏仅检索内置地点，或解析用户提供的经纬度和 OSM 链接。
- osmtogeojson 3.0.0-beta.5 使用 `flatProperties:false`，保留不完整几何标记并排除不完整区域；完整多边形与内环用于文字排布。
- 命名面要素用扫描线排字和内部标签，保留孔洞；较小嵌套区域从父区域填字中扣除。线要素先按名称拼接，再按弧长安放文字。空间索引用于文字避让。
- 2D Canvas 与 SVG 共用同一份排版命令。中文宋体子集内置并采用 SIL OFL；SVG 可嵌入该字体。
- 示例数据为 2026-10-25 从 Overpass 获取的北京真实 OSM 快照，不是生成式图像。`sample-query.overpass` 保存获取条件；`scripts/prepare-sample.mjs <Overpass JSON路径>` 可更新示例。
- 有名称的 OSM 要素才参与转换。关系和视野非常大时公共服务有资源限制；请求失败保留上一幅作品。艺术排版保留地理位置关系，字号会随视野变化进行取舍。

## 检查

`npm run check` 检查 JavaScript 语法；`npm test` 检查孔洞、命名归属、图层隐藏、跨日期变更线、数据错误处理、SVG 转义与实际北京数据排版。

## 许可与来源

地图数据 © OpenStreetMap contributors，ODbL：<https://www.openstreetmap.org/copyright>。

Leaflet 和 osmtogeojson 使用 MIT 许可，Protomaps 使用 BSD-3-Clause；对应许可证随 `dist/vendor/` 一并提供。Noto Serif CJK 使用 SIL Open Font License，见 `dist/fonts/OFL.txt`。公共服务使用规则：<https://operations.osmfoundation.org/policies/tiles/> 和 <https://dev.overpass-api.de/overpass-doc/en/preface/commons.html>。
