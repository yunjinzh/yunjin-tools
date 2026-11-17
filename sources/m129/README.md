# 云金造物 · 三维建模工作台

文字描述 → 结构化场景 → Three.js 三维预览 → GLB / STL / JSON / sand3d Python。

## 快速开始

- **离线使用**：双击 `云金造物_离线版.html`，或打开 `dist/index.html`。参数化建模、预览和导出无需联网。请用支持 WebGL2 的近期浏览器；无法使用 WebGL 时自动启用 SVG 兼容渲染（简化光照，遮挡效果可能不如 WebGL）。
- **本地服务**：安装 Python 3.9+，Windows 双击 `start_windows.cmd`；macOS / Linux 执行 `sh start_mac_linux.sh`。访问 `http://127.0.0.1:8787`。
- **源码开发**：安装 Node.js 20+，执行 `npm ci`、`npm run build`。`npm test` 运行模型及导出测试。

## 能力边界

本工具受 sand3d 的“可读程序构建命名部件”思路启发，并提供经过实际运行验证的 sand3d 脚本导出。页面预览和即时 GLB/STL 导出由 Three.js 执行，不是在网页里运行 Blender，也没有托管无限制的自然语言建模模型。

| 模式 | 可用能力 | 依赖 |
|---|---|---|
| 参数化建模 | 12 类模板，中英文类别、主色、宽/深/高/直径；建筑层数、书架层数、示意齿轮齿数 | 无密钥、无网络 |
| AI 自由生成 | 描述转换为有限几何词汇的概念装配，最多 180 个部件 | 用户配置兼容 Chat Completions 的模型服务 |
| sand3d 导出 | 真实调用 sand3d 创建几何，以 Blender 变换复现位置和尺寸，生成 GLB | Python 3.11 或 3.13，sand3d 1.6.3；首次安装需联网 |

参数化模式不会推断所有自然语言细节；超出支持类别会明确提示。AI 模式使用 box / cylinder / cone / sphere / torus / tube 六类几何体，不支持任意雕刻曲面、图片转模型、纹理生成或真实布尔编辑。模型适合概念展示、教学和场景原型；齿轮不是渐开线工程齿形，拆解不是关节动力学。

## 使用流程

1. 输入描述，或点击示例填入；再点击“生成三维模型”。桌面支持 Ctrl / Cmd + Enter。
2. 拖拽旋转、滚轮缩放、右键平移；手机单指旋转、双指缩放。
3. 修改整体尺寸（单位 mm），点击“应用尺寸”。该操作按三轴缩放整个装配，不重新求解机械约束。
4. 在画面或部件列表中选择部件，调整颜色、粗糙度和可见性。可开启线框、自动旋转与拆解。
5. 导出 GLB、STL、JSON 或 Python；JSON 可再次导入，也能在“模型代码”中编辑并应用。

## AI 直连

点击“接入 AI”，填写：

- 完整接口地址：你的服务提供的 `https://…/v1/chat/completions`。
- 模型名称：服务实际支持的模型 ID。
- API Key：该服务的密钥；免密本地服务可留空。

服务必须允许浏览器的 CORS 请求。密钥仅保留在当前页面内存中，不写入 localStorage、文件或导出模型；刷新后需重填。描述会发送到所填接口，服务可能计费。请求 120 秒超时，可主动取消；失败时保留已有模型。实际生成质量和响应速度取决于所接模型。当前交付未配置或调用用户的付费 AI 服务。

## 本地代理（解决 CORS）

代理为 Python 标准库实现，无需额外依赖，仅监听 `127.0.0.1`。启动前设置环境变量：

```powershell
# Windows PowerShell；替换为你自己的服务配置
$env:AI_CHAT_URL="https://你的服务/v1/chat/completions"
$env:AI_API_KEY="你的密钥"
python backend/server.py
```

```bash
# macOS / Linux；替换为你自己的服务配置
export AI_CHAT_URL='https://你的服务/v1/chat/completions'
export AI_API_KEY='你的密钥'
python3 backend/server.py
```

在 **本地网页** `http://127.0.0.1:8787` 中点击“接入 AI”，接口填写 `http://127.0.0.1:8787/v1/chat/completions`，模型名称仍填上游真实 ID；密钥已在环境中设置时，页面留空。不要公开部署该本地代理；若需多人使用，需另行增加账户、配额、HTTPS 和运维防护。代理不接受任意转发 URL，不跟随跳转，不记录请求正文或凭证。

托管 HTTPS 页面访问 localhost 可能受浏览器本地网络权限限制。优先打开随包提供的本地页面，无需改变浏览器安全设置。

## sand3d 真实建模

网页中选择 `Python · sand3d` 导出。安装及运行：

```bash
# 使用 Python 3.11 或 3.13 的独立虚拟环境
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install sand3d==1.6.3
python 你的模型.py output.glb
```

sand3d 会安装较大的 bpy 依赖。Python 3.12 不适用。程序使用固定几何映射，场景内容以 JSON 数据嵌入，不执行 AI 返回的任意代码。输出含完整部件结构，浏览器的隐藏和拆解状态不会写入 Python。

## 单位和导出

| 格式 | 单位 / 坐标 | 内容 |
|---|---|---|
| GLB | 米，转换到 Y 向上 | 可见部件、名称、材质，组装姿态 |
| STL | 数值为毫米，Z 向上（STL 自身不存单位） | 可见三角网格，组装姿态，无材质 |
| JSON | 参数化模板可用归一化内部尺寸，`targetSize` 为毫米目标包围盒；AI 为毫米，Z 向上 | 完整部件及属性，可重新导入 |
| Python | sand3d 建模坐标为毫米；导出 GLB 转为米 | 完整结构、命名、材质和变换 |

导出 GLB / STL 不包括展示地面、网格或选中高亮。隐藏部件不会导出。导出不是布尔融合；相交部件可能重叠，打印前需要网格处理。

## 工程结构

- `src/model.js`：输入解析、12 个模板、结构校验、AI 提示词。
- `src/viewer.js`：Three.js 渲染、兼容渲染、选择、相机、拆解与导出。
- `src/main.js`：页面状态、AI 请求、交互、导入与异常处理。
- `src/export-python.js`：sand3d 固定词汇映射与 Python 导出。
- `backend/server.py`：本地静态服务和固定上游 AI 代理。
- `examples/`：12 组场景 JSON、sand3d Python 和经 sand3d 构建的 GLB。
- `tests/`：场景验证和真实二进制导出检查。

## 验证记录（2026-11-07）

- 12 类模板结构、唯一部件 ID、正尺寸、颜色与单位解析通过。
- 未知类别、非法几何、NaN、过多部件、非法管壁被拒绝。
- 12 类 GLB 文件头、长度、网格数量及材质，STL 头部及三角面字节长度通过。
- 12 个 Python 导出脚本在 Python 3.11.17 / sand3d 1.6.3 / bpy 4.5.15 中实际运行并导出 GLB；重导入检查部件数量及三轴包围盒通过。
- 浏览器验证：示例生成、尺寸变更、部件选择、线框切换、导出按钮反馈、AI 未配置提示；390px 窄屏布局检查通过。
- 环境限制：测试浏览器禁用 WebGL，浏览器可视验证使用 SVG 兼容模式，未实测 GPU 材质和阴影。浏览器自动化未捕获下载事件，因此下载内容检查由相同 Three.js 导出代码的程序测试完成。真实 AI 服务尚未接入，未验证上游服务质量、额度或 CORS 配置。

## 来源与许可

- sand3d 官方仓库：https://github.com/Sandflow-ai/sand3d
- sand3d API：https://github.com/Sandflow-ai/sand3d/blob/main/docs/api.md
- Three.js：https://threejs.org/docs/

参考 sand3d 1.6.3 API，sand3d 使用 Apache-2.0；Three.js 0.180.0 使用 MIT。未复制 sand3d 的 Python 库实现。本工具为独立页面项目，不是 Sandflow 官方产品。Third-party license texts are included in `licenses/`.
