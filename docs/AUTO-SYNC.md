# 新工具自动同步

用户已授权将后续 GPT 新制作的可运行工具及版本更新持续同步到 `yunjinzh/yunjin-tools`，并更新 GitHub Pages 统一入口。定时任务每小时检查一次；没有新工具完成事件接口，因此不是聊天结束时即时推送。

## 可发现的来源

- 用户拥有的 Sites：完整分页读取 `sites_list_sites(role=owner)`，以原始项目 ID 和已保存发布版本号识别新增或更新。未发布的草稿暂不导入。
- 「云金工具全景」目录：项目 ID 保存在 `sync/config.json`。目录版本改变时检查 `catalog.json` 中新增的网页或交付链接，使用已连接且有权限的工具读取对应源码、网页或安装包。
- 只有聊天文本、未暴露给连接器的附件或未登记来源的本地文件无法自动发现。取得可读取来源后再补入；不要假定可遍历其他 GPT 的全部聊天或附件。

首次基线来自初次迁移时的 101 个已知 Sites。旧目录中未收录且没有变化的历史项目不因启用任务而重复导入。当前目录自身、测试页、内部资料源等不是独立工具，应检查用途后跳过。用户可在 `sync/config.json` 的 `excluded_projects` 中填写排除项目，或在原源码根目录放置 `.github-sync-ignore`。

## 每轮操作

1. 优先通过 GitHub 连接器读取 `sync/config.json`、`sync/state.json` 和 `modules.json`，然后读取全部拥有的 Sites 元数据。没有新版本、目录变化或待验证导入时直接结束，不克隆整个大仓库，不修改时间戳，也不发送通知。
2. 有候选时使用现有干净 checkout，或从 GitHub 克隆。先获取远端最新提交，保留用户改动；禁止强推。发现并发更新时重新合并，不能覆盖另一轮同步或用户提交。
3. 将元数据保存为临时 JSON 数组（字段 `id, title, version, url, status`；也支持 Sites 原始版本/URL字段），运行 `python scripts/sync_tools.py plan --inventory /tmp/current-sites.json`。它区分新增、更新、目录变化和等待线上验证四类操作。
4. 对候选调用 Sites 版本工具取得准确版本和源提交，用短期源仓库凭据取回该提交。凭据仅通过隐藏 stdin/进程环境使用，不保存到文件、Git remote 或报告。不得向原 Sites 源仓库推送，不修改原站访问范围。只有源项目的独立可运行工具纳入主目录。
5. 检查该模块的说明和构建方式。静态项目使用已验证静态产物；纯前端项目可按原项目构建或做必要的 Pages 适配。服务端项目保留完整源码和原入口，分类为需要后端，不伪装为已在线部署。更新已在线工具时，如果新构建未通过，保留原线上版本并记录失败。
6. 准备不含凭据的元数据文件：`id, title, description, url, version, source_commit`，其中 `source_commit` 必须匹配选定保存版本。示例：

   ```bash
   python scripts/sync_tools.py import --metadata /tmp/tool.json --source /tmp/tool-source --web /tmp/tool-source/dist --category 教学与实训
   # 新增的确实依赖服务器的工具，检查后可用 --source-only，省略 --web。
   ```

   导入脚本会分配稳定的新编号或复用原编号，排除环境文件和平台配置，保留源码，按哈希去重资源，更新目录、迁移清单和待验证记录。对于本地安装包或非 Sites 来源，按同一 `modules.json` 格式加入；超过 GitHub 单文件限制的包用 Release 或分卷，不省略包内容。
7. 运行 `python tests/test_sync_tools.py`、`python scripts/build.py`、`python scripts/validate.py --hashes`。在 Pages 相同子路径下预览，执行 `tests/smoke.mjs <变更模块ID>` 和目录筛选检查。需要前端适配时按 `docs/BUILDING.md` 处理。产物需小于 950 MiB；超限或功能失败时停止发布该候选并保留原版本。
8. 只提交已检查的导入，推送 `main`，等待 Pages 工作流成功。程序包使用仓库发布工作流并核对下载文件校验值。公共环境重新检查变更入口、资源请求和主要操作，不使用本地资源代替线上文件。
9. 真实验证成功后记录：

   ```bash
   python scripts/sync_tools.py confirm --project <原项目ID> --deployment-commit <已成功部署的完整SHA> --url <真实HTTPS入口>
   ```

   提交验证状态和简洁结果，文档/状态提交可使用 `[skip ci]` 避免无意义重部署。保存 `sync/reports/latest.json`，至少包含实际变更的模块、源版本、部署提交、验证结果和未完成项。没有变化时不重写报告。

## 失败与去重

`modules.json` 记录已导入版本；`sync/state.json` 中 `pending_verification` 只有线上验证成功后才能清除，因此一次失败部署不会被当成已完成而跳过。来源暂时不可访问、未取得文件或编译失败时保留已有项目，记录源 ID、版本和不含秘密的原因。同一失败版本只通知一次；失败未变化时最多每天重试，来源出现新版本则可立即再试。

使用 `python scripts/sync_tools.py defer --project <原项目ID> --version <源版本号> --reason <不含秘密的失败原因>` 保存 24 小时重试间隔。返回的 `notify` 表示该版本/原因是否首次出现；同一失败不重复发送通知。`plan` 会跳过仍在间隔内的版本，新版本不受旧失败间隔影响。

读取目录变化后，仅对有证据的新条目添加或更新；不要重新运行初次全量迁移脚本覆盖当前仓库。支持服务和明确排除项可在 `known_sites` 中记录已检查版本；来源删除不传播为仓库删除。

## 运行边界

GitHub Pages 仍是静态托管。云数据库、用户上传数据、平台身份与原站浏览器数据不进入公开仓库。定时任务只读取当前账号可访问的来源；后台权限审批或连接失效时如实报告。此任务不修改任何自定义 GPT 的全局配置，也不会让没有来源入口的聊天附件自动变得可读取。
