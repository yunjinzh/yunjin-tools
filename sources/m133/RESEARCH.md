# 视野 FIELDNOTES

私人、持久化的 YouTube 知识研究工作台。Vinext + React + Cloudflare D1。

## 数据原则
- `app/lib/seed.ts` 为 2026-11-09 检索的十条原始案例。统计来自搜索索引，不是实时 API，实际采集日期未知。
- `metricsChecked` 是核查/检索日期，不能视为源页面的采集时刻；`metricsCaveat` 保留限制。
- 常青程度为人工判断；播放/订阅比例不是完播率、自然流量或因果效果。
- 未取得的视频时长、Hook、逐段转折和节奏保留未核验。
- 用户提交字幕的提取是基于时间戳和语言线索的确定性辅助，不是已观看原片的自动认证。
- 关联收藏、已核验分析与已复盘实验生成可编辑草稿，不调用外部 AI API。

## 更新
用户在页面添加链接，通过 oEmbed 读取标题/频道；失败可手动建档。配置服务端秘密 `YOUTUBE_API_KEY` 后可使用官方 Data API 读取统计。密钥不在页面输入、不进源码。
每周更新页提供人工核验队列、发现阈值和 JSON 导出/恢复。备份导入先全量校验与预览，默认只新增，不覆盖当前资料。未设定后台自动抓取或定时任务。

## 持久保存
D1 research_records 按 Sites 用户 ID 隔离，资料采用单条版本冲突检查。数据迁移位于 drizzle；只在正常部署阶段应用。页面通过 URL 恢复，倍数阈值、视图和对比选择作为设备偏好保留；重要草稿保存为实验后可跨设备读取。预览数据与生产数据库隔离。

## 验证
`node node_modules/typescript/bin/tsc --noEmit`
`node /root/.codex/plugins/cache/openai-curated-remote/sites/1.1.4/scripts/build-site.mjs`
`node scripts/check-research.mjs`
检查脚本使用隔离内存 D1，不写入用户数据。覆盖持久保存、冲突拒绝、身份隔离和缺少 API 密钥的反馈。
