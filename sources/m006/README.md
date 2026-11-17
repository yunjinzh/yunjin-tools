# 职业教育数字教材研究与设计

CIM与数字孪生的政策、案例、教材策划、交互样章与原创字幕动画。

静态发布入口：`dist/index.html`，资源与研究报告内嵌，可离线使用。

源文件：`src/`；Three.js MIT依赖：`vendor/`；原创微课与字体子集：`assets/`。

课程资源规模为策划建议。交互数值、对象与路径为教学合成数据，不用于实际工程决策。

构建：使用含python-docx、fonttools的Python运行`src/build.py`。原报告快照见`assets/original-report.docx`。视频源脚本：`src/render_videos.py`，需要Pillow与FFmpeg。
