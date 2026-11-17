# 清底 Qingdi

在浏览器内完成 AI 主体抠图、纯色背景移除和透明 PNG 导出。界面为中文，图片不会发送至服务器。本应用不需要 API Key。

## 使用

上传、拖入或粘贴一张 JPG / PNG / WebP，自动开始处理。照片选择 AI，文字与均匀底色选择纯色背景。结果可对比、放大、擦除、恢复、撤销以及裁掉透明留白。背景预览默认不写入导出图片，只有勾选对应选项才合成。点击“下载透明 PNG”查看导出预览，再点击“保存 PNG”。支持文件保存对话框的桌面浏览器会询问保存位置，写入成功后显示文件名；其他浏览器使用已生成的完整 PNG 数据直接下载。另提供“直接下载 PNG”、复制图片（支持时显示）及右键 / 长按预览图保存。取消保存不会丢失预览。原生保存写入完成后，导出窗口显示绿色“图片保存成功”提示及文件名，按钮变为“已保存 · 再存一份”，工作台同步显示已保存。普通下载仅显示“已发起下载”，再次生成导出时重置状态。

首次 AI 使用从同一站点加载约 54.4 MiB 模型和运行资源；PNG 输出工作图最长边不超过 4096 px，总像素不超过 8,388,608。大图会缩放且在页面明确显示尺寸。单张文件上限 25 MiB。AI 默认清理低 alpha 残影，可调节背景净化强度；手动修边最多撤销 8 步。

## GitHub 选型（核查时间：2026-10-27）

| 项目 | 官方仓库 | 本次判断 |
| --- | --- | --- |
| IMG.LY Background Removal | https://github.com/imgly/background-removal-js | 浏览器推理路线，与无需服务器上传的任务相符，实际接入 |
| rembg | https://github.com/danielgatis/rembg | Python、CLI、HTTP 服务，适合另行部署服务器进行批处理 |
| BiRefNet | https://github.com/ZhengPeng7/BiRefNet | 高分辨率前景分割研究实现，本页面未接入 |

选型逻辑：IMG.LY 提供浏览器执行库 + 本工具要求图片在网页内直接处理 => 采用 IMG.LY 作为当前 AI 引擎。不是基准测试排名，不将此决定表述为精度最高或速度最快。

## 本地构建

要求 Node.js 20+ 和可访问 npm / GitHub 的网络。

```sh
npm ci
npm run prepare-assets
npm run build
npm test
python -m http.server 8080 --directory dist
```

访问 http://localhost:8080 。Web Worker 和模型分块加载需要 HTTP(S)，不使用 file:// 直接双击运行。部署目录为 dist。模型、WASM 和脚本均由部署目录提供，运行时不依赖外部 CDN。服务器需正常提供 .js/.mjs、.json、.bin、.png、.jpg、.svg 文件；现代静态 HTTP 服务器通常直接支持。

依赖固定为 @imgly/background-removal 1.7.0 与 onnxruntime-web 1.21.0。模型 IS-Net quint8，来源、Git revision、字节数及 SHA-256 见 MODEL-PROVENANCE.json。构建脚本校验模型哈希并切分为 4 MiB 资源块；总资源大小 57,041,950 字节。CPU/WASM 在独立 Worker 内推理，取消操作终止 Worker。

源码下载包包含编辑源码、构建脚本、界面与示例素材、许可证和 package-lock；模型通过 prepare-assets 从固定 revision 获取并校验。该包用于构建，不是双击即运行的离线 HTML。图片处理代码和模型资源均可自行托管。

## 验证与边界

2026-10-27，在本次托管 Chrome 预览中实际运行植物图（900×599）和人像图（600×399），模型完成推理并显示透明结果。环境中首次植物处理 30.3 秒、随后人像 8.5 秒，这些数值不代表用户设备性能。色彩算法用合成 RGBA 数组验证边缘连通、封闭区域、透明度合成、羽化、擦除恢复、裁切和大图约束。最终验证记录见 VALIDATION.md。

AI 会提取显著主体，不能保证所有细线、透明物体或发丝均完整保留。多个主体、低对比度、阴影及复杂背景需要人工复查；提供背景净化强度和恢复画笔供修正。纯色全图模式也会移除主体中相同颜色；仅边缘连通模式可保留封闭同色区域，但文字内部的底色也会保留。没有评估过全量用户素材，不能承诺通用准确率。

## 许可

本应用源码：AGPL-3.0-only；底层 @imgly/background-removal：IMG.LY GmbH 的 AGPL-3.0 软件。ONNX Runtime Web：Microsoft Corporation，MIT。完整文本及其他依赖说明位于 dist/licenses。代码许可与模型资产许可应分别查看上游声明；本项目没有改变模型的权利声明。

植物示例原始地址：https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=900&q=88 。人像示例：https://raw.githubusercontent.com/danielgatis/rembg/main/examples/girl-1.jpg 。文字图案为本应用 Canvas 绘制。
