# 形迹 · 视频转白模

## 使用

打开工作台，选择视频或试用内置开合跳样片。单人自动生成，多人同框时点选一个目标。生成结束后，原片与白模共用一条时间轴，可逐帧核对并下载 H.264 MP4。修改颜色、分辨率或音轨后点击“重新导出 MP4”，已提取的动作可复用。

## 部署独立服务器

部署包面向 Linux x86-64 的 Docker 环境。解压后，在包含 Dockerfile 的目录执行以下命令。首次构建需联网获取基础镜像及 Python 包，推理权重已随包提供。

```sh
docker build -t motion-atelier .
docker volume create motion-atelier-jobs
docker run -d --name motion-atelier --restart unless-stopped \
  -p 127.0.0.1:8765:8765 -v motion-atelier-jobs:/data motion-atelier
```

同机访问 http://127.0.0.1:8765/ 。部署到已有域名时，可将 HTTPS 入口反向代理至此地址，并保留原始 Host，按 250 MB 配置请求体大小。按实际需要在入口配置访问权限。上传文件和成片存于数据卷，任务 ID 用于找回该任务。本页面仅管理当前浏览器最近一次任务。要从同一浏览器进入已提交的任务，应再次打开相同的站点地址。

## 运行条件

- 在线浏览器版在访客设备上识别和编码，页面关闭后暂停，回到同一浏览器可以续跑已保存的进度。优先使用桌面 Chrome 或 Edge。MP4、MOV、WebM 是容器，具体编解码支持随浏览器而异。
- 此独立服务版使用 MediaPipe CPU、Node.js 三维软件渲染及 FFmpeg。上传结束后关页可继续计算，服务器重启可找回排队任务。并发任务按提交顺序排队。服务端接收 FFmpeg 可读取的视频，输出 H.264 和可选 AAC。
- 最近任务可在“使用说明”中清除。服务端每隔 15 分钟清理已结束满 24 小时的任务；请及时将成片另存。
- 两版均处理一个跟踪目标，单文件上限 250 MB，单段时长上限 10 分钟。720p/1080p 为画幅上限，小尺寸输入保留原分辨率。单机位估计可能在遮挡、快速转身、出画时丢失动作。时间轴可以定位这些片段。

## 示例与组件

开合跳视频由 Taco Fleur / Cavemantraining 拍摄，按 CC BY-SA 4.0 分发，包含原声与裁切。所附白模示例沿用同一许可证。出处见 dist/assets/demo-source.txt，依赖许可在 dist/assets/notices。

## 状态与回归

完整的状态清单、恢复优先级、代理操作约定与回归入口见 [工作流说明](dist/workflow-audit.md)。
