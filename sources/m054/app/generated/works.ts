// 本文件由 scripts/generate-works.mjs 自动生成，请勿手动编辑。

export type WorkAsset = {
  name: string;
  url: string;
  kind: string;
  extension: string;
  size: number;
  sizeLabel: string;
};

export type Work = {
  slug: string;
  title: string;
  category: string;
  year: string;
  summary: string;
  description: string;
  role: string;
  client: string;
  tags: string[];
  tone: "coral" | "dark" | "lime" | "paper";
  size: "large" | "small" | "wide";
  featured: boolean;
  order: number;
  cover: string | null;
  primaryUrl: string | null;
  primaryKind: string | null;
  sections: { title: string; content: string }[];
  metrics: { value: string; label: string }[];
  attachments: WorkAsset[];
};

export const works: Work[] = [
  {
    "slug": "campus-digital-twin",
    "title": "三峡大学数字孪生校园",
    "category": "数字孪生 / 校园治理",
    "year": "2026",
    "summary": "将教学、资产、空间与设备数据组织进同一套校园运行视图。",
    "description": "这不是简单的三维校园展示，而是一套围绕空间分配、教学排课、资产设备与学生学习状态建立的数据联动框架。",
    "role": "产品架构 / 交互原型 / 场景设计",
    "client": "高校数字化建设",
    "tags": [
      "数字孪生",
      "GIS",
      "校园治理",
      "三维可视化"
    ],
    "tone": "coral",
    "size": "large",
    "featured": true,
    "order": 1,
    "cover": null,
    "primaryUrl": null,
    "primaryKind": null,
    "sections": [
      {
        "title": "项目背景",
        "content": "传统校园三维系统常停留在场景展示与图层叠加，空间、教务、资产和设备数据彼此分散，学校管理者很难从一个入口理解校园正在如何运行。"
      },
      {
        "title": "设计方法",
        "content": "以空间为连接索引，建立学院—楼宇—房间—课程—设备—人员之间的对象关系；围绕校域总览、空间配置、教学运行、资产维护与安全应急设计分层信息界面。"
      },
      {
        "title": "成果价值",
        "content": "形成可继续扩展的校园孪生产品架构与高保真原型，使三维场景从展示背景转变为查询、分析和协同决策的工作入口。"
      }
    ],
    "metrics": [
      {
        "value": "5",
        "label": "核心业务域"
      },
      {
        "value": "20+",
        "label": "功能场景"
      },
      {
        "value": "1",
        "label": "统一空间索引"
      }
    ],
    "attachments": []
  },
  {
    "slug": "geotime-studio",
    "title": "GeoTime Studio",
    "category": "GIS 工具 / 历史影像",
    "year": "2026",
    "summary": "框选区域，即可生成跨越数十年的地表变化影像。",
    "description": "面向非专业用户的历史影像变化视频工具，把区域选择、时间序列组织、字幕叠加、预览与导出整合为一条清晰流程。",
    "role": "产品定义 / 交互设计 / 前端原型",
    "client": "时空影像应用",
    "tags": [
      "历史影像",
      "时间序列",
      "地图交互",
      "视频生成"
    ],
    "tone": "dark",
    "size": "small",
    "featured": true,
    "order": 2,
    "cover": null,
    "primaryUrl": null,
    "primaryKind": null,
    "sections": [
      {
        "title": "项目背景",
        "content": "历史遥感影像分散在不同时期和服务中，普通用户既难以快速选择研究范围，也缺少把多期影像转化为可讲述视频的轻量工具。"
      },
      {
        "title": "设计方法",
        "content": "通过矩形框选与圆形圈选确定区域，自动编排可用年份，统一画幅与色彩，在视频底部生成时间信息，并提供逐帧预览与本地导出。"
      },
      {
        "title": "成果价值",
        "content": "将原本需要多个 GIS 与视频工具协同的工作压缩为一个连贯流程，为城市变化、生态监测、工程建设与公众传播提供更低门槛的表达方式。"
      }
    ],
    "metrics": [
      {
        "value": "4",
        "label": "核心操作步骤"
      },
      {
        "value": "2",
        "label": "区域绘制方式"
      },
      {
        "value": "30+",
        "label": "可表达年份跨度"
      }
    ],
    "attachments": []
  },
  {
    "slug": "twin-education",
    "title": "数字孪生产教融合体系",
    "category": "教育产品 / 课程设计",
    "year": "2026",
    "summary": "从岗位能力到实训项目，构建政产研学用协同培养路径。",
    "description": "围绕数字孪生应用技术岗位，将行业场景、平台工具、课程资源、实训空间和能力评价组织成可执行的人才培养体系。",
    "role": "体系策划 / 课程架构 / 内容设计",
    "client": "高校与职业院校",
    "tags": [
      "产教融合",
      "数字孪生",
      "课程体系",
      "实训室"
    ],
    "tone": "lime",
    "size": "small",
    "featured": true,
    "order": 3,
    "cover": null,
    "primaryUrl": null,
    "primaryKind": null,
    "sections": [
      {
        "title": "项目背景",
        "content": "院校面对新职业与新技术时，容易先采购平台和设备，却缺少岗位标准、课程内容、实训项目与评价方式之间的闭环。"
      },
      {
        "title": "设计方法",
        "content": "从职业任务反推能力模块，再将能力拆解为课程单元与项目任务，配套行业数据、教学工具、师资培训和过程性评价，形成政产研学用五个维度的协同机制。"
      },
      {
        "title": "成果价值",
        "content": "输出可用于专业建设、实训室规划、课程开发与行业汇报的完整框架，让技术建设和人才培养围绕同一套能力目标展开。"
      }
    ],
    "metrics": [
      {
        "value": "5",
        "label": "协同维度"
      },
      {
        "value": "6",
        "label": "岗位任务域"
      },
      {
        "value": "1",
        "label": "能力闭环"
      }
    ],
    "attachments": []
  },
  {
    "slug": "geofabrik-downloader",
    "title": "GeoFabrik Downloader",
    "category": "数据工具 / OSM",
    "year": "2026",
    "summary": "面向大规模 OSM 数据的自动下载、归档与检索工具。",
    "description": "为需要长期维护开放街图数据的团队设计的一键式下载与管理工具，覆盖数据选择、批量任务、分级存储、更新计划和本地检索。",
    "role": "需求分析 / 产品设计 / 工具开发",
    "client": "空间数据生产",
    "tags": [
      "OpenStreetMap",
      "数据下载",
      "自动归档",
      "Windows"
    ],
    "tone": "paper",
    "size": "wide",
    "featured": true,
    "order": 4,
    "cover": null,
    "primaryUrl": null,
    "primaryKind": null,
    "sections": [
      {
        "title": "项目背景",
        "content": "GeoFabrik 数据体量大、区域层级多，手工下载容易产生遗漏、路径混乱和版本不一致；在 Windows 本地盘与网络映射盘之间还存在兼容问题。"
      },
      {
        "title": "设计方法",
        "content": "建立大洲—国家—省份—城市的统一目录规则，支持 PBF、SHP、GPKG 与说明文档组合下载，并通过本地服务处理进度、断点、更新频率和索引页面生成。"
      },
      {
        "title": "成果价值",
        "content": "形成面向非开发人员的桌面化工作流，数据下载结果可追踪、可检索、可更新，降低大规模 OSM 数据维护的操作成本。"
      }
    ],
    "metrics": [
      {
        "value": "4",
        "label": "数据类型"
      },
      {
        "value": "3",
        "label": "更新模式"
      },
      {
        "value": "4",
        "label": "目录层级"
      }
    ],
    "attachments": []
  },
  {
    "slug": "smart-water-lab",
    "title": "数字孪生智慧水务实训室",
    "category": "行业方案 / 水利水务",
    "year": "2026",
    "summary": "把真实水务流程转化为可建模、可联动、可训练的教学场景。",
    "description": "面向高校教学与职业技能训练，围绕城乡水务、水质监测和智慧灌排构建软硬件协同的数字孪生实训空间。",
    "role": "方案架构 / 实训项目设计 / 预算规划",
    "client": "水利水务相关院校",
    "tags": [
      "智慧水务",
      "实训室",
      "物联网",
      "数字孪生"
    ],
    "tone": "dark",
    "size": "small",
    "featured": true,
    "order": 5,
    "cover": null,
    "primaryUrl": null,
    "primaryKind": null,
    "sections": [
      {
        "title": "项目背景",
        "content": "水务教学往往割裂在模型、设备和软件之间，学生难以从一次完整项目中理解感知、建模、分析、控制和运维的协同关系。"
      },
      {
        "title": "设计方法",
        "content": "将建设内容拆分为城乡智慧水务、水质智能监测和智慧灌排三类重点项目，分别组织场景、设备、平台、数据与课程任务，并设置可量化的建设绩效。"
      },
      {
        "title": "成果价值",
        "content": "构建能够支撑课程教学、项目实训、技能竞赛与科研创新的复合型环境，让学生在接近真实业务的链路中形成系统能力。"
      }
    ],
    "metrics": [
      {
        "value": "3",
        "label": "重点实训方向"
      },
      {
        "value": "8+",
        "label": "单项目预算项"
      },
      {
        "value": "全链路",
        "label": "教学场景"
      }
    ],
    "attachments": []
  },
  {
    "slug": "spatial-knowledge-graph",
    "title": "空间智能知识图谱",
    "category": "交互系统 / 知识图谱",
    "year": "2026",
    "summary": "把岗位、能力、课程、任务与数据来源组织成可探索的关系网络。",
    "description": "通过交互式知识图谱呈现数字孪生与高校教学评价等复杂知识体系，让用户能够从任一节点理解上下游关系与计算逻辑。",
    "role": "信息架构 / 图谱建模 / 交互设计",
    "client": "知识管理与教学评价",
    "tags": [
      "知识图谱",
      "空间智能",
      "信息架构",
      "可视化"
    ],
    "tone": "coral",
    "size": "small",
    "featured": true,
    "order": 6,
    "cover": null,
    "primaryUrl": null,
    "primaryKind": null,
    "sections": [
      {
        "title": "项目背景",
        "content": "复杂专业体系通常以长文档和多级表格存在，维度、指标、数据来源与任务之间的联系难以被快速看见。"
      },
      {
        "title": "设计方法",
        "content": "先提炼对象类型与关系语义，再用层级布局、筛选、搜索和节点详情降低图谱阅读负担，同时保留指标来源、权重和初步计算方法。"
      },
      {
        "title": "成果价值",
        "content": "把静态框架转变为可探索的知识工作台，既适合整体认知，也支持从单个指标或任务进入局部分析。"
      }
    ],
    "metrics": [
      {
        "value": "6+",
        "label": "核心对象类型"
      },
      {
        "value": "N×N",
        "label": "关系探索"
      },
      {
        "value": "实时",
        "label": "交互反馈"
      }
    ],
    "attachments": []
  }
];

export function getWorkBySlug(slug: string) {
  return works.find((work) => work.slug === slug);
}
