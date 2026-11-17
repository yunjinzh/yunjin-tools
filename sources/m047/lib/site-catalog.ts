export type Accent = "coral" | "blue" | "green" | "violet" | "amber" | "slate";

export type CatalogSite = {
  id: string;
  name: string;
  description: string;
  url: string | null;
  category: string;
  accent: Accent;
  published: boolean;
  hidden: boolean;
  versionCount: number;
  updatedAt: string;
  source: "chatgpt";
};

const site = (
  id: string,
  name: string,
  description: string,
  url: string | null,
  category: string,
  accent: Accent,
  versionCount: number,
  updatedAt: string,
  hidden = false,
): CatalogSite => ({
  id,
  name,
  description,
  url,
  category,
  accent,
  published: Boolean(url),
  hidden,
  versionCount,
  updatedAt,
  source: "chatgpt",
});

export const chatGptSites: CatalogSite[] = [
  site("university-lab-safety", "高校实验室安全分级分类管理系统", "实验室分级分类、风险台账、隐患整改与安全闭环管理。", "https://university-lab-safety.yunjinzh.chatgpt.site", "安全管理", "coral", 2, "2026-08-26T10:27:50Z"),
  site("splat-studio", "Splat Studio 3D", "照片与视频生成三维高斯模型的制作与预览工具。", "https://splat-studio.yunjinzh.chatgpt.site", "三维工具", "violet", 1, "2026-08-27T03:49:41Z"),
  site("paper-2280-local-guide", "论文零基础大图解：2280", "面向零基础读者的论文大图解专题版本。", null, "知识解读", "amber", 0, "2026-08-23T00:59:51Z", true),
  site("paper-visual-guide", "论文零基础大图解", "使用大图与精简文字解释论文核心内容。", "https://paper-visual-guide.yunjinzh.chatgpt.site", "知识解读", "amber", 2, "2026-08-23T00:40:28Z"),
  site("agent-business-guide", "Agent时代做生意：零基础图解", "以可视化方式解释 Agent 时代的商业反常识。", "https://agent-business-guide.yunjinzh.chatgpt.site", "知识解读", "coral", 2, "2026-08-22T13:28:52Z"),
  site("digital-twin-spatial-intelligence", "数字孪生空间智能实训平台", "课程、数据资源、算法训练与实训任务统一入口。", "https://digital-twin-spatial-intelligence.yunjinzh.chatgpt.site", "教育实训", "blue", 2, "2026-08-20T04:21:10Z"),
  site("prettymaps-studio", "PrettyMaps 地图艺术工坊", "框选地图区域并按预设艺术样式生成高清地图。", "https://prettymaps-studio.yunjinzh.chatgpt.site", "地图数据", "green", 1, "2026-08-27T03:50:06Z"),
  site("yunjin-portfolio", "云金｜空间与数字孪生作品集", "集中展示空间智能、数字孪生与产品设计作品。", "https://yunjin-portfolio.yunjinzh.chatgpt.site", "个人门户", "slate", 3, "2026-08-16T00:14:38Z"),
  site("survey-workbench", "问卷调研工作台", "问卷创建、发布、答卷收集与结果分析工作台。", "https://survey-workbench.yunjinzh.chatgpt.site", "业务系统", "blue", 1, "2026-08-27T03:50:06Z"),
  site("supplier-hub-local", "供应商协同管理系统", "供应商入库、采购需求、报价与项目协同管理。", "https://supplier-hub-local.yunjinzh.chatgpt.site", "业务系统", "slate", 1, "2026-08-27T03:49:56Z"),
  site("supplier-management-system", "供应商管理系统", "供应商审核、项目评价与采购协作管理。", null, "业务系统", "slate", 0, "2026-08-15T02:59:33Z", true),
  site("requirement-quality-framework", "需求分解与质量控制框架图", "需求、指标、功能、测试与交付物的质量控制框架。", "https://requirement-quality-framework.yunjinzh.chatgpt.site", "项目管理", "coral", 1, "2026-08-27T03:50:12Z"),
  site("geopbf-scene-builder", "GeoPBF 三维场景生成器", "解析本地 OSM PBF 并生成建筑、道路与水系三维场景。", "https://geopbf-scene-builder.yunjinzh.chatgpt.site", "三维工具", "green", 2, "2026-08-13T12:01:47Z"),
  site("teaching-effectiveness-graph", "高校教学成效评价知识图谱", "用知识图谱组织教学指标、成果与评价关系。", "https://teaching-effectiveness-graph.yunjinzh.chatgpt.site", "教育实训", "violet", 2, "2026-08-13T10:07:21Z"),
  site("geomodel-viewer", "GeoModel 通用三维模型浏览器", "在线浏览 FBX、GLB、IFC、STEP、STL 等三维模型。", "https://geomodel-viewer.yunjinzh.chatgpt.site", "三维工具", "blue", 1, "2026-08-13T02:33:25Z"),
  site("geoscene-builder", "GeoScene OSM 三维场景生成器", "在线选区获取 OSM、地形和影像并生成可导出的三维场景。", "https://geoscene-builder.yunjinzh.chatgpt.site", "三维工具", "green", 4, "2026-08-13T01:38:10Z"),
  site("shitian-siji-game", "诗田四季 · 唐诗种植乐园", "面向儿童的唐诗学习与植物种植互动游戏。", "https://shitian-siji-game.yunjinzh.chatgpt.site", "教育实训", "amber", 1, "2026-08-12T11:41:25Z"),
  site("paper-visual-digest", "论文可视化解读生成器", "把论文内容转换为大图化、低门槛的交互解读。", "https://paper-visual-digest.yunjinzh.chatgpt.site", "知识解读", "amber", 5, "2026-08-08T11:12:39Z"),
  site("resource-gallery-platform", "资源展示平台", "以卡片方式呈现数字孪生、时空数据和模型资源。", "https://resource-gallery-platform.yunjinzh.chatgpt.site", "地图数据", "blue", 2, "2026-08-07T00:06:09Z"),
  site("campus-digital-twin", "数字孪生校园原型", "校园态势监测、空间资产与业务应用一体化原型。", "https://campus-digital-twin.yunjinzh.chatgpt.site", "数字孪生", "blue", 1, "2026-08-06T08:04:59Z"),
  site("feishu-tool-studio", "FORM · AI 人像实验室", "面向职业头像与人像视觉实验的生成工作室。", "https://feishu-tool-studio.yunjinzh.chatgpt.site", "视觉工具", "coral", 4, "2026-07-26T14:25:12Z"),
  site("gpx-motion-studio", "GPX 轨迹动画工作室", "将 GPX 轨迹制作成地图运动动画并导出。", "https://gpx-motion-studio.yunjinzh.chatgpt.site", "地图数据", "green", 3, "2026-07-22T09:18:47Z"),
  site("image-to-3d-studio", "Image to 3D Studio", "从图像生成三维资产的实验性制作工具。", "https://image-to-3d-studio.yunjinzh.chatgpt.site", "三维工具", "violet", 1, "2026-08-27T03:50:16Z"),
  site("geoai-vision-studio", "GeoAI 影像智能识别平台", "遥感与地理影像的智能识别、训练和成果查看平台。", "https://geoai-vision-studio.yunjinzh.chatgpt.site", "地图数据", "green", 2, "2026-07-19T00:18:51Z"),
  site("robot-assembly-lab", "机器人交互式拆装训练平台", "机器人结构认知、拆装步骤与交互训练平台。", "https://robot-assembly-lab.yunjinzh.chatgpt.site", "教育实训", "violet", 1, "2026-07-17T10:19:39Z"),
  site("feidu-competency-graph", "飞渡岗位能力与知识图谱", "岗位任务、能力要求与知识体系的图谱化门户。", "https://feidu-competency-graph.yunjinzh.chatgpt.site", "教育实训", "slate", 1, "2026-08-27T03:50:20Z"),
  site("industry-education-spatial-ai", "产教融合空间智能教学门户", "面向产教融合的空间智能课程与资源门户。", "https://industry-education-spatial-ai.yunjinzh.chatgpt.site", "教育实训", "blue", 1, "2026-08-27T03:50:20Z"),
];

export const catalogSiteIds = new Set(chatGptSites.map((item) => item.id));
