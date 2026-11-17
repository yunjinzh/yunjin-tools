import type { CourseModule, Lesson } from "./course-data";

type FullLesson = Lesson & { module: CourseModule };

type LessonCopy = {
  notes: string;
  guide: string;
};

const lessonCopy: Record<string, LessonCopy> = {
  "digital-twin-not-a-dashboard": {
    notes: "用四层关系判断一个系统是否真正“孪生”",
    guide: "把抽象概念落到一张项目判断表",
  },
  "dts-product-map": {
    notes: "沿交付链看清四个产品的职责边界",
    guide: "把四件套排成一条可执行流水线",
  },
  "acp-and-3dt": {
    notes: "分清数据资产与场景配置的两套逻辑",
    guide: "建立不会因换机器而失效的项目目录",
  },
  "first-end-to-end-workflow": {
    notes: "把五个独立环节连成一条验收闭环",
    guide: "走通从原始数据到浏览器的最小链路",
  },
  "engine-environment-and-formats": {
    notes: "格式、版本与本机环境必须先配对",
    guide: "完成一次 Engine 发布前环境体检",
  },
  "coordinate-system-baseline": {
    notes: "先确认空间基准，再讨论位置偏移",
    guide: "建立 DOM、DEM 与 SHP 的坐标基线表",
  },
  "terrain-and-imagery": {
    notes: "地形底座由影像、高程与边界共同决定",
    guide: "发布第一份可稳定加载的地形影像 3DT",
  },
  "oblique-photogrammetry": {
    notes: "倾斜摄影发布的关键在元数据与金字塔",
    guide: "把一套 OSGB 小样可靠转换为 3DT",
  },
  "models-and-bim": {
    notes: "模型分类、视图和精度共同控制结果",
    guide: "在构件细节与运行性能之间完成配置",
  },
  "point-cloud-resources-vector": {
    notes: "三类数据要用三种不同的生产思路",
    guide: "分别完成点云、资源与矢量的发布验证",
  },
  "engine-quality-control": {
    notes: "可复现比一次发布成功更重要",
    guide: "用配置、日志与场景预览完成质量闭环",
  },
  "explorer-interface": {
    notes: "先认识工作区，再建立正确操作顺序",
    guide: "用一个空工程熟悉 Explorer 工作台",
  },
  "project-and-import": {
    notes: "工程结构决定后续维护成本",
    guide: "搭建第一棵面向业务的场景图层树",
  },
  "navigation-camera-tour": {
    notes: "相机与导览决定场景如何被理解",
    guide: "制作一条有节奏的五镜头演示路线",
  },
  "environment-and-rendering": {
    notes: "表现效果必须同时服务信息与性能",
    guide: "从中性基准逐步制作三套环境预设",
  },
  "measurement-and-analysis": {
    notes: "每种分析工具都对应一种空间问题",
    guide: "从测量输入到业务结论完成一次分析",
  },
  "layer-material-editing": {
    notes: "图层命名与材质规则决定工程可维护性",
    guide: "整理一组可切换、可追踪的场景状态",
  },
  "tags-video-particles": {
    notes: "动态信息需要被放在正确空间位置",
    guide: "组合标签、视频与粒子表达一条告警",
  },
  "acp-delivery-practice": {
    notes: "能在制作机打开不等于能够交付",
    guide: "完成一次脱离制作环境的 ACP 迁移检查",
  },
  "cloud-architecture": {
    notes: "理解画面下沉与操作上行的完整链路",
    guide: "为六个并发用户画出云渲染拓扑",
  },
  "cloud-environment-network": {
    notes: "容量、终端与网络必须作为一体规划",
    guide: "形成可用于现场部署的基础条件清单",
  },
  "cloud-install-master-node": {
    notes: "主控与节点的连接顺序决定集群能否建立",
    guide: "完成一主一节点的安装与在线验证",
  },
  "cloud-project-node-instance": {
    notes: "工程同步、节点容量与实例参数相互制约",
    guide: "发布并启动第一个可访问的渲染实例",
  },
  "cloud-service-operations": {
    notes: "上线后的重点是连接、服务与日志证据",
    guide: "走通一次接口验证与运行问题定位",
  },
  "sdk-development-model": {
    notes: "业务页面与三维引擎通过接口协作",
    guide: "完成读取相机并输出日志的 HelloWorld",
  },
  "explorer-webui": {
    notes: "启动参数与透明交互决定 WebUI 是否可用",
    guide: "把一条半透明业务状态栏嵌入 Explorer",
  },
  "websocket-and-async": {
    notes: "稳定调用依赖连接生命周期与异步纪律",
    guide: "用 async/await 编排一条可追踪调用链",
  },
  "camera-events-coordinates": {
    notes: "相机、坐标与事件共同构成交互基础",
    guide: "完成点击对象、显示属性与定位的闭环",
  },
  "layers-tags-objects": {
    notes: "稳定 ID 与可见范围决定对象能否管理",
    guide: "实现图层与标签的增、显、定位和删除",
  },
  "analysis-simulation-apis": {
    notes: "先按业务问题选择 API，再看类参考",
    guide: "为一个行业场景编制 API 能力清单",
  },
  "sdk-production-practice": {
    notes: "从 Demo 到产品需要统一服务层与状态",
    guide: "搭建一个可维护的 sceneService 骨架",
  },
  "campus-twin-case": {
    notes: "校园孪生要把空间层级与业务事件对齐",
    guide: "拆解一次实验室告警处置完整过程",
  },
  "city-twin-case": {
    notes: "城市级项目必须分层处理尺度与性能",
    guide: "制定全域到构件的四级数据策略",
  },
  "delivery-acceptance": {
    notes: "交付物、指标与证据必须逐项对应",
    guide: "建立一张可直接用于验收的六列表",
  },
  "graduation-challenge": {
    notes: "范围可以小，但闭环必须完整",
    guide: "规划并完成你的第一个最小孪生作品",
  },
};

const moduleRules: Record<
  string,
  {
    mode: string;
    notesEyebrow: string;
    notesIntro: string;
    guideEyebrow: string;
    guideIntro: string;
    kickers: [string, string, string];
    leads: [string, string, string];
    finalKicker: string;
    finalTitle: string;
    finalLead: string;
    expected: string;
  }
> = {
  "01": {
    mode: "concept",
    notesEyebrow: "CONCEPT MODEL",
    notesIntro: "先把关系想清楚，再进入工具。下面三组内容不是并列知识点，而是一套逐层收紧的判断框架。",
    guideEyebrow: "THINKING WALKTHROUGH",
    guideIntro: "跟着四步完成一次纸面推演。每一步都有明确产物，完成后再进入练习。",
    kickers: ["界定对象", "画出关系", "代入案例"],
    leads: [
      "先明确当前要判断的对象、空间范围和业务目标，不急着打开任何软件。",
      "把输入、处理、输出和依赖关系画到同一张图上，避免只记住名词。",
      "选择一个真实校园、园区或城市项目逐项反证，找出还没有闭环的位置。",
    ],
    finalKicker: "形成结论",
    finalTitle: "把判断写成一句可复述的话",
    finalLead: "最后用不超过 100 字说明为什么这样判断，并标出支撑结论的对象、数据和业务动作。",
    expected: "一张关系图或判断表，以及一段能够向项目成员直接讲清楚的结论。",
  },
  "02": {
    mode: "workflow",
    notesEyebrow: "DATA WORKFLOW",
    notesIntro: "数据生产不是点击“开始发布”。它由输入检查、参数配置和结果验证三个连续控制点组成。",
    guideEyebrow: "ENGINE WALKTHROUGH",
    guideIntro: "先用小样完成一遍可复现流程，再处理全量数据。以下步骤对应真实的 Engine 操作顺序。",
    kickers: ["检查输入", "配置发布", "运行小样"],
    leads: [
      "在 Engine 之外先核对格式、坐标、范围、依赖软件和数据完整性，把异常记录下来。",
      "进入对应数据分类，只调整与当前目标直接相关的参数，并在开始前保存 Aconf 配置。",
      "截取代表性小范围先发布，持续观察信息面板和命令窗口，确认没有错误再扩大到全量。",
    ],
    finalKicker: "验证输出",
    finalTitle: "把 3DT 放进 Explorer 做结果质检",
    finalLead: "发布结束后立即加载输出，检查位置、范围、材质、对象属性、LOD 与调度速度，并保存参数和结果证据。",
    expected: "3DT 小样、Aconf 配置、关键参数截图和一份包含问题记录的质检表。",
  },
  "03": {
    mode: "studio",
    notesEyebrow: "SCENE STUDIO",
    notesIntro: "场景搭建既是空间组织，也是信息设计。三个要点分别控制结构、观看方式与最终体验。",
    guideEyebrow: "EXPLORER WALKTHROUGH",
    guideIntro: "在同一个测试 ACP 中完成四步，边操作边保存版本，避免多个知识点散落在不同工程。",
    kickers: ["建立工程", "组织场景", "调整体验"],
    leads: [
      "新建或复制一份测试 ACP，先固定坐标基准、资源路径和本次操作的目标状态。",
      "在图层树中按业务关系组织对象，再执行本课涉及的导入、编辑、分析或表现操作。",
      "从总览、近景和目标终端三个角度观察结果，调整可见范围、相机、材质或效果参数。",
    ],
    finalKicker: "保存复核",
    finalTitle: "保存新版本并从默认视角重新检查",
    finalLead: "关闭无关面板，从工程默认状态重新打开，确认图层、路径、交互和性能仍符合预期。",
    expected: "一个可重新打开的 ACP 版本、前后对比截图和一份场景检查记录。",
  },
  "04": {
    mode: "operations",
    notesEyebrow: "CLOUD OPERATIONS",
    notesIntro: "云渲染需要同时看资源、连接和服务状态。三组要点对应部署前、运行中与交付端。",
    guideEyebrow: "DEPLOYMENT WALKTHROUGH",
    guideIntro: "在测试网络中按顺序完成规划、配置、启动和验证，不要在前一步状态不明时继续部署。",
    kickers: ["规划容量", "配置服务", "启动观察"],
    leads: [
      "先记录目标分辨率、并发数、工程负载、GPU 和网络条件，算出本次测试的容量边界。",
      "按主控、节点、工程和实例的依赖顺序配置地址、端口、权限及同步范围。",
      "启动服务后观察节点、实例、客户端和日志四类状态，不以“进程存在”代替可用性判断。",
    ],
    finalKicker: "终端验证",
    finalTitle: "从真实浏览器完成一次端到端访问",
    finalLead: "使用目标终端连接实例，验证首帧时间、清晰度、交互延迟、断线恢复和访问权限，并记录结果。",
    expected: "部署拓扑、关键配置表、在线状态截图和一次终端访问测试记录。",
  },
  "05": {
    mode: "code",
    notesEyebrow: "API ORCHESTRATION",
    notesIntro: "开发重点不是记住类名，而是把连接、调用与反馈组织成稳定的业务动作。",
    guideEyebrow: "IMPLEMENTATION WALKTHROUGH",
    guideIntro: "每一步都要求保留请求、响应或界面状态，保证最终功能可以被复现和排错。",
    kickers: ["准备上下文", "实现调用", "处理反馈"],
    leads: [
      "确认 Explorer 或 Cloud、工程、端口、SDK 版本和授权范围，先用测试页验证基础连接。",
      "把本课接口封装为一个明确业务方法，校验 ID、坐标和参数，不在页面事件中堆叠底层调用。",
      "等待真实响应再更新界面，记录耗时和错误信息，同时处理超时、重连与组件销毁。",
    ],
    finalKicker: "集成验证",
    finalTitle: "用一次完整用户操作验证接口闭环",
    finalLead: "从页面触发动作，观察三维变化，再回到页面确认状态一致；重复执行并检查事件是否叠加。",
    expected: "可运行代码、请求与响应日志、异常处理结果和一段完整交互演示。",
  },
  "06": {
    mode: "case",
    notesEyebrow: "PROJECT BLUEPRINT",
    notesIntro: "综合实战关注边界、链路和证据。下面三组内容用于把一个宽泛主题收束为可交付项目。",
    guideEyebrow: "CASE WALKTHROUGH",
    guideIntro: "用同一案例依次完成范围定义、底座搭建、业务闭环和验收证据，避免只做一段演示动画。",
    kickers: ["限定范围", "搭建底座", "接通业务"],
    leads: [
      "先限定空间范围、用户、问题和交付周期，删除不能为核心问题提供价值的内容。",
      "根据目标确定数据清单、3DT、ACP 与服务结构，优先打通最小但完整的数据链。",
      "选择一个真实事件或任务接入场景，让查询、分析、联动和处置结果形成前后闭环。",
    ],
    finalKicker: "形成证据",
    finalTitle: "把功能转化为可复核的验收材料",
    finalLead: "为每项能力补充测试条件、结果、截图或日志，再按固定演示脚本完成一次复核。",
    expected: "项目范围说明、数据与功能清单、可演示成果和一套对应验收证据。",
  },
};

export function getLessonPresentation(lesson: FullLesson) {
  const copy = lessonCopy[lesson.slug] ?? {
    notes: `理解「${lesson.title}」的关键关系`,
    guide: `完成「${lesson.title}」的操作流程`,
  };
  const rules = moduleRules[lesson.module.id] ?? moduleRules["01"];

  const steps = lesson.core.map((note, index) => ({
    number: `0${index + 1}`,
    kicker: rules.kickers[index],
    title: note.title,
    detail: `${rules.leads[index]}${note.body}`,
    check: `完成标志：能够${lesson.objectives[index]}，并留下可复核的记录。`,
  }));

  steps.push({
    number: "04",
    kicker: rules.finalKicker,
    title: rules.finalTitle,
    detail: `${rules.finalLead}${lesson.summary}`,
    check: `完成标志：能够用截图、记录或现场演示说明“${lesson.title}”已经按预期完成。`,
  });

  return {
    ...copy,
    mode: rules.mode,
    notesEyebrow: rules.notesEyebrow,
    notesIntro: rules.notesIntro,
    guideEyebrow: rules.guideEyebrow,
    guideIntro: rules.guideIntro,
    steps,
    expected: rules.expected,
    checks: lesson.objectives.map((objective) => `我是否已经能够${objective}？`),
  };
}
