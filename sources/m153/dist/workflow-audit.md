# 形迹工作台 · 状态与恢复规则

范围包括当前应用负责的交互、浏览器计算、独立处理服务器及其交界。第三方推理、编码库和浏览器下载管理器的内部状态由各自维护。

| 状态域 | 触发事件与主要转换 | 代码入口与约束 |
|---|---|---|
| 运行环境与启动 | 打开页面 → 查询部署模式 → 本机或服务器 → 恢复或空闲 | app.mjs 的 configureRuntime、init。导入等待部署模式确定。 |
| 素材与任务归属 | 空闲 → 选文件、拖入或载入示例 → 检查 → 接管最近任务。文件不合格时保留当前任务 | importFile、sampleRequest、restoreToken。异步结果须属于当前导入。 |
| 上传与远端观察 | 上传中 → 已受理 → 轮询。网络中断 → 重新查询。资源到期 → 用户可重新上传 | startRemote、poll、observeError。每个原片上传带独立去重标识，旧客户端仍可上传。 |
| 计算任务 | 检查 → 加载模型 → 提取 → 编码 → 校验 → 成片。暂停、失败、继续和重导出有独立入口 | workflow.mjs 的 taskPolicy 与 app.mjs 的 status、run。暂停请求与暂停实效分别表示。 |
| 人物选择 | 未定位 → 单人自动跟踪或等待多人选择 → 选定。取消选择进入暂停 | choose、service.py 的 choice 分支。服务端先释放工作线程，才发布可选择状态。新客户端提交本轮选人版本。 |
| 跟踪质量 | 搜寻 → 跟踪正常、低置信度、丢失 → 找回。两侧都有姿态且间隔足够短时可补间 | engine.mjs 的 extract、warnings 和 processor.py 的 extract。遮挡标记用原片时间定位，不改变视频时长。 |
| 计算后端和临时资源 | 视频轨道打开 → 原生逐帧解码或媒体元素寻帧；姿态运行时及渲染器按设备能力选择实现；编码完成或中断后释放 | engine.mjs、cpu-pose.mjs、figure.mjs。缓存加载中的运行时，失败可重新加载。 |
| 动作检查点与存储 | 无记录 → 不完整 → 已提取 → 可反复导出。存储失败时在当前页继续 | IndexedDB 事务关联最近任务的写入者。服务端以 motion.json 作为完整动作检查点。本机可恢复部分帧，服务端中断的提取从头恢复。 |
| 恢复与重试意图 | 刷新 → 原子读取最近任务 → 恢复暂停、失败、设置草稿、成片或继续在途工作 | workflow.mjs 的 restoration、app.mjs 的 init。兼容没有新增字段的旧记录，手动暂停优先。 |
| 输出设置、成片和下载 | 配置匹配 → 可下载；设置改变 → 上次成片可预览；撤销修改 → 可直接下载；按新设置导出 → 校验成功后发布 | sameSettings、applyChange、readyPlayback。成片的就绪只代表可下载，实际保存结果由浏览器管理。 |
| 播放与时间轴 | 示意动画或源片对照 → 起播 → 播放、暂停、逐帧定位、结束或播放失败 | pause、seek、sync。播放器代次隔离异步起播结果。定位使用原始帧时间戳。 |
| 服务端工作线程 | queued → running → choose、ready、failed 或 paused；选人、继续和重导出可重新排队 | service.py 的 TRANSITIONS、enqueue、worker。排队任务可立即暂停。完成状态和线程归属在同一把锁中提交。 |
| 服务端文件与清理 | 接收原片 → 动作检查点 → 临时成片 → 校验并发布 → 分段或重复下载 → 到期清理或手动清除 | service.py、processor.py。删除运行中任务时先标记，再由工作线程退出后清理。服务重启处理遗留上传和持久化任务。 |
| 面板与代理操作 | 工作台、说明弹窗、人物选择弹窗和结果页由任务阶段驱动；读取状态 → 使用当下允许的动作 → 读取新状态 | get_motion_state、act_on_motion_task 和主面板 data-phase、data-actions。代理使用任务标识和状态版本，选择人物或跳转时间还需通过范围检查。 |

## 开发者回归入口

在源码根目录执行以下命令。前端回归使用 Node.js 20 或更高版本。服务端回归需具备 requirements.txt 中的依赖及 Node.js、FFmpeg 和 FFprobe，并使用临时目录存放测试任务。

```sh
node --test tests/*.test.mjs
python tests/service_lifecycle.py
```

在“使用说明”中展开“查看当前任务状态”，可以读取同一份 JSON 状态。服务端 status 响应补充了 stage、revision、actions，旧客户端原有的 state 字段继续可用。

现有页面按钮、动态状态提示、框选和下载链接是普通浏览器的操作入口。支持 WebMCP 的浏览器另提供两个接口。get_motion_state 返回任务阶段、设置、进度、播放时间、可执行动作和下载就绪标记。act_on_motion_task 需要当前 task、revision 和 action，choose 的 value 为从 1 开始的人物编号，seek 的 value 为秒。完成下载使用可见的 MP4 链接。
