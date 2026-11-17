# 便携单文件构建

在项目目录执行：

1. `python scripts/build-offline.py`：默认最长边 1024、WebP 质量 55，保留完整画面；依赖 Pillow。
2. `python scripts/package-offline.py`：执行实际 HTML 专项与功能检查，打包并检查 ZIP 小于 24 MB。

输出 `offline-portable/index.html` 与 `offline-portable/world-map-museum-{实际作品总数}-portable.zip`。源文件 dist 不会被修改。图片变体缓存及交付目录已从 Git 排除。

Three、应用、gallery-config.js、样式和所有图片均内嵌，无网络依赖。替换脚本使用回调，避免 $& 等字符破坏内容。

真实 Windows 浏览器及 GPU 视觉测试仍需要相应环境；自动检查不替代该项测试。
