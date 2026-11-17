# 四维秀秀

三维 DIY 创作工作台。使用上传的真实 SU7、CBD001 和 MX3 模型，提供表面喷涂、笔刷、文字、图案、按零件换色、图层显隐与排序、撤销/重做、图片及视频输出。

## 本次更新

- 页首使用用户提供的完整 Logo，保持原图比例，移除重复文字。
- 模型炸开：按已有独立网格沿部件中心向外展开，0–100% 连续调节，可一键合拢。保持零件比例、相机位置与缩放，只修改零件位移；用户可手动滚轮缩放或适应画布。重合中心采用不同方向。单网格模型不可自动拆分。
- 图案、文字和喷涂保存在目标零件的局部坐标中；跨零件笔触按零件合并，展开、合拢、删除及撤销/重做均保持位置。
- 自定义颜色：取色器、HEX（3 位或 6 位）、RGB 通道输入，覆盖材质、喷涂、笔刷、文字和背景。
- 内置 Noto Sans SC、Noto Serif SC、ZCOOL KuaiLe，字体文件随站点部署。文字预览和画布等待字体加载完成。
- 本地字体支持 TTF / OTF / WOFF / WOFF2，单文件最大 30 MB；在当前浏览器会话中使用，不上传服务器。字体需覆盖输入字符。

- 左侧“移除”下方的“生成”打开平台选择窗口，预置腾讯混元 3D、Tripo Studio、Hyper3D 的用户指定网址，通过新标签页跳转。
- 可添加及删除自定义建模快捷入口，名称和网址作为本机偏好保存在当前浏览器；不跨设备同步。接受 http/https 网址，拒绝其他协议与重复项。预设链接不会自动传送当前模型。

## 文件格式

- GLB / GLTF：Three.js GLTFLoader，含随包 Draco 解码器与 Meshopt 支持。GLTF 的 bin 和图片需一起选择或打包 ZIP。
- FBX：Three.js FBXLoader，静态网格与可读取的贴图；兼容范围受 FBX 版本与导出器扩展影响。
- STP / STEP：随站点部署 occt-import-js 0.0.23 和 WebAssembly，在独立 Worker 内三角化；不提供 CAD 参数编辑。
- OBJ：几何导入。STL：网格导入。
- 不请求保存用户的上传内容到服务器；编辑会话与上传文件在当前浏览器中处理，关闭前应导出作品。

## 图像和视频

PNG / JPG；长边 1280、1920 或 3840 像素；横版、方形或竖版；PNG 可选透明背景。导出前生成可查看的图片。

视频录制三维画布，无音轨；支持记录交互与 360° 环绕展示，选择浏览器支持的 MP4 或 WebM 编码。captureStream 请求 30 FPS，实际帧率受硬件、模型复杂度和浏览器录制实现影响。最长连续录制三分钟。

WebGL 是主要渲染路径，使用环境照明、阴影与标准材质。禁用 WebGL 的设备自动使用 CPU 三角形栅格化，提供基础光照、贴图和表面图案，性能与材质质量低于 WebGL。

## 技术

Vinext / React / Three.js / fflate / occt-import-js。静态依赖及内置模型均随站点部署，核心功能不依赖外部 CDN。

## 已核查（2026-09-21）

- 三个上传模型均能读取：SU7 41 个网格、CBD001 16 个网格、MX3 8 个网格。
- 浏览器中导入 CBD001_GLTF.zip、一个 ASCII FBX 7.4 测试模型、一个 STEP 圆角实体测试模型。
- 表面文字、喷涂、贴纸、无 UV 的 STEP 笔刷绘制、撤销与重做。
- 下载 PNG 为 1920×1080；下载环绕视频为 1920×1080 的 H.264 MP4。
- 测试浏览器 WebGL 被禁用，浏览器交互及导出核查使用 CPU 兼容渲染。完整 WebGL 视觉效果未在该环境中验证。
- 本次通过汽车、电子烟、遥控器炸开界面检查；拖动展开滑杆、合拢及切换模型重置正常。
- 本次检查 HEX / RGB 同步、材质换色、三种中文字体预览、真实 TTF 字体上传并放置文字。
- 本次下载的炸开图片为 1920×1080 PNG；交互录屏为 1920×1080 H.264 MP4（约 16.5 秒）。
- `node scripts/check-explosion.mjs` 额外断言相机位置、旋转、缩放、视场角、投影矩阵、观察中心及零件比例在炸开/合拢过程中完全不变；同时检查比例位移、精确合拢、展开前后创建图案、跨部件笔触、撤销重做和同心部件方向。
- `node node_modules/typescript/bin/tsc --noEmit` 与生产构建通过。
- WebMCP 工具已进行输入校验并按标准注册；测试浏览器没有 document.modelContext，无法进行端到端 WebMCP 调用验证。

## 授权信息

用户提供的三个模型仅作为本项目内置演示资源。occt-import-js 与 Open CASCADE Technology 的许可证随 `public/cad` 部署，源项目为 https://github.com/kovacsv/occt-import-js 。Three.js 和 Draco 保留其原始版权与许可证声明。

内置字体通过 Fontsource 5.3.0 分发，采用 SIL Open Font License 1.1；原始授权文本位于 `public/fonts/licenses/`。来源： https://fontsource.org/fonts/noto-sans-sc 、 https://fontsource.org/fonts/noto-serif-sc 、 https://fontsource.org/fonts/zcool-kuaile 。
