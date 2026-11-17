# 画间 · ListenHub 批量制图

私人在线图片工作台，使用自己的 ListenHub 开发者 API Key。

## 使用

1. 打开站点并用站点所有者的 ChatGPT 账户登录。
2. 点击右上角“连接 API Key”，填写 ListenHub Key 并验证。Key 只保留在当前页面内存中，刷新后重新填写。
3. 输入提示词，默认每行一条；多行分段模式用独立一行的 `---` 分隔。支持导入 UTF-8 TXT。
4. 选择模型、1K/2K/4K、比例，每条 1–10 张，并发 1–4，每批最多 100 张。
5. 可先预估积分，然后开始生成。点击作品预览，单张下载或勾选后打包 ZIP。

## 已实现

- GPT-Image-2、GPT-Image-2.5 Flare、GPT-Image-2.5 Sunburst、GPT-Image-2 Pro。
- 仅 Pro 发送 quality 参数；支持 10 种标准比例。
- 异步生成队列、逐项状态、暂停后续提交、失败手动重试。
- 本地任务记录最多 500 项，刷新后保留任务 ID，继续时仅查询已有任务。
- 网络中断导致提交结果不确定时标记“待确认”，不自动重发。云端任务分页查询与恢复。
- 积分实时预估；免费次数不从标价中扣除，不保证余额覆盖整批，以 ListenHub 实际结算为准。
- ZIP 含原图、提示词和参数 JSON，单次打包限制 250 MB。
- 手机和桌面布局，连接窗口、图片预览、使用指南。

## 架构与边界

React 19 + TypeScript + Vinext/Vite，运行于 Sites 的 Cloudflare Worker。保留 Sites 身份验证和构建集成。`/api/listenhub` 是服务端代理，验证登录身份、参数和固定上游端点，不接受任意代理 URL。

Key 由用户在自己的浏览器页面中输入，通过 HTTPS 请求头传给本站服务端，再由服务端调用 `https://api.marswave.ai/openapi/v1`。没有将 Key 写入源码、localStorage、sessionStorage、URL 或应用日志。站点默认仅所有者可访问。

提示词、参数、任务 ID、结果 URL 保存在当前浏览器 localStorage；不跨设备同步。清理浏览器数据会清除本地历史，可通过云端任务恢复平台仍保留的结果。图片由 ListenHub 托管，本工具不承诺其永久存储期限，请下载重要作品。

队列由页面调度；关闭页面后不再提交排队项，云端已提交项仍继续执行。重新连接 Key 后点击“继续队列”恢复查询。暂停不会撤销云端任务，也不代表免除费用。

单次查询持续最多 20 分钟，超时暂停并保留 taskId。查询失败会退避；提交 POST 不自动重试。429、鉴权失败、余额不足、订阅不足和不确定提交会暂停后续队列。手动重试失败的生成会创建新任务，界面会提示可能再次消耗额度。

本版面向文本批量制图，尚未加入参考图片上传。队列和记录仅在当前浏览器内管理，不是关页后仍运行的云端批处理服务。

## 本地开发

需要 Node.js >=22.13（本机使用 Codex 自带 Node 24）。

```powershell
npm ci
npm run dev
```

开发模式由 Sites starter 提供模拟登录，仅用于本地预览。生产站点使用平台登录与服务端身份检查。

```powershell
node node_modules/typescript/bin/tsc --noEmit
node scripts/test.mjs
npm run build
```

`tests/core.test.ts` 使用模拟 ListenHub 响应，覆盖请求参数、鉴权转发、积分、模糊提交、错误码、429、下载安全、队列并发、暂停恢复、失败重试路径、UTF-8 ZIP。测试不会调用真实生成接口。

## 核心文件

- `components/studio.tsx`：工作台、连接、历史、预览、下载。
- `lib/queue.ts`：并发队列、暂停恢复与安全重试。
- `lib/listenhub.ts`：固定上游 API、校验、错误分类与结果下载。
- `app/api/listenhub/route.ts`：服务端身份与请求边界。
- `lib/zip.ts`：浏览器 ZIP 打包。
- `.openai/hosting.json`：站点身份与托管配置，不含 Key。

## 接口文档

- [快速开始](https://listenhub.ai/docs/zh/openapi/quick-start)
- [图片生成接口](https://listenhub.ai/docs/zh/openapi/api-reference/image-generation)
- [GPT-Image 参数](https://listenhub.ai/docs/en/openapi/api-reference/image-generation/gpt-image)

开发时已完成类型检查、模拟测试、生产构建与浏览器交互检查。没有接触用户真实 Key，真实账户的扣费与图片生成需在网页连接后验证。
