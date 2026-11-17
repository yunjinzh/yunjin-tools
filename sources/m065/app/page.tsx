"use client";

import { useEffect, useMemo, useState } from "react";

type ModuleId =
  | "overview"
  | "data"
  | "security"
  | "assets"
  | "teaching"
  | "research"
  | "embodied"
  | "lowaltitude";

type IconName =
  | "overview"
  | "data"
  | "shield"
  | "building"
  | "book"
  | "flask"
  | "bot"
  | "drone"
  | "search"
  | "bell"
  | "pin"
  | "layers"
  | "energy"
  | "users"
  | "calendar"
  | "device"
  | "alert"
  | "arrow"
  | "check"
  | "route"
  | "database"
  | "camera"
  | "play"
  | "close";

const modules: Array<{ id: ModuleId; label: string; kicker: string; icon: IconName }> = [
  { id: "overview", label: "校园态势", kicker: "校级运行总览", icon: "overview" },
  { id: "data", label: "时空数据", kicker: "数据治理与服务", icon: "data" },
  { id: "security", label: "安消行", kicker: "安全消防通行", icon: "shield" },
  { id: "assets", label: "空间资产", kicker: "房产与资产管理", icon: "building" },
  { id: "teaching", label: "教学运行", kicker: "教室课程协同", icon: "book" },
  { id: "research", label: "科研数据", kicker: "数据集与训练场", icon: "flask" },
  { id: "embodied", label: "具身智能", kicker: "智能体与机器人", icon: "bot" },
  { id: "lowaltitude", label: "校园低空", kicker: "无人机采集平台", icon: "drone" },
];

const searchItems = [
  "A3教学楼",
  "分析测试中心",
  "信息技术中心机房",
  "北门",
  "空闲多媒体教室",
  "实验楼烟感异常",
];

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const shapes: Record<IconName, React.ReactNode> = {
    overview: <><path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19V3"/><path d="M2 19h22"/></>,
    data: <><path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z"/><path d="m4 12 8 4.5 8-4.5"/><path d="m4 16.5 8 4.5 8-4.5"/></>,
    shield: <><path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/></>,
    building: <><path d="M4 21V6l8-3v18"/><path d="M12 9h8v12"/><path d="M2 21h20"/><path d="M7 8h2M7 12h2M7 16h2M15 12h2M15 16h2"/></>,
    book: <><path d="M3 5.5A3.5 3.5 0 0 1 6.5 2H11v17H6.5A3.5 3.5 0 0 0 3 22V5.5Z"/><path d="M21 5.5A3.5 3.5 0 0 0 17.5 2H13v17h4.5A3.5 3.5 0 0 1 21 22V5.5Z"/></>,
    flask: <><path d="M9 3h6"/><path d="M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7.5 16h9"/></>,
    bot: <><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8M2 11v4M22 11v4"/></>,
    drone: <><path d="M9 9h6l2 6H7l2-6Z"/><path d="M9 10 5 7M15 10l4-3M8 14l-4 3M16 14l4 3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/><circle cx="3" cy="18" r="2"/><circle cx="21" cy="18" r="2"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>,
    energy: <path d="m13 2-9 12h8l-1 8 9-12h-8l1-8Z"/>,
    users: <><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 8M18 14a6 6 0 0 1 4 7"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    device: <><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 22h8M12 18v4"/></>,
    alert: <><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 18h.01"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    route: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3"/></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></>,
    camera: <><path d="M14.5 6 13 4H8L6.5 6H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-5.5Z"/><circle cx="11" cy="12" r="4"/></>,
    play: <path d="m8 5 11 7-11 7V5Z"/>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  };

  return <svg {...common}>{shapes[name]}</svg>;
}

function ProductMark() {
  return (
    <div className="product-mark" aria-label="数字孪生校园">
      <span className="mark-layer mark-layer-one" />
      <span className="mark-layer mark-layer-two" />
      <span className="mark-layer mark-layer-three" />
    </div>
  );
}

function MetricCard({ icon, label, value, unit, tone = "teal", trend }: { icon: IconName; label: string; value: string; unit?: string; tone?: "teal" | "coral"; trend: string }) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-icon"><Icon name={icon} size={22} /></div>
      <div className="metric-copy">
        <span>{label}</span>
        <strong>{value} <small>{unit}</small></strong>
      </div>
      <div className="metric-trend" aria-label={trend}>
        <svg viewBox="0 0 54 22" aria-hidden="true"><path d="M2 18 12 13 20 16 30 7 38 11 52 2" /></svg>
        <span>{trend}</span>
      </div>
    </article>
  );
}

function Panel({ title, action, children, className = "" }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-header">
        <h2>{title}</h2>
        {action && <div className="panel-action">{action}</div>}
      </header>
      {children}
    </section>
  );
}

function TrendChart() {
  return (
    <Panel title="今日校园运行趋势" action={<span className="chart-date">08月06日 · 实时</span>} className="trend-panel">
      <div className="chart-legend">
        <span><i className="legend-dot teal" />在校人数</span>
        <span><i className="legend-dot amber" />教室使用率</span>
        <span><i className="legend-dot blue" />能耗指数</span>
      </div>
      <div className="trend-chart" aria-label="今日校园运行趋势折线图">
        <div className="chart-ylabels"><span>30,000</span><span>20,000</span><span>10,000</span><span>0</span></div>
        <svg viewBox="0 0 760 160" preserveAspectRatio="none" role="img">
          <defs>
            <linearGradient id="tealFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#55d8c6" stopOpacity=".18"/><stop offset="1" stopColor="#55d8c6" stopOpacity="0"/></linearGradient>
          </defs>
          <path className="chart-gridline" d="M0 24h760M0 66h760M0 108h760M0 150h760"/>
          <path className="chart-fill" d="M0 134 C55 120 72 68 128 51 S220 60 266 45 350 64 410 54 485 45 555 63 620 55 700 61 760 58 L760 160 0 160Z"/>
          <path className="line teal-line" d="M0 134 C55 120 72 68 128 51 S220 60 266 45 350 64 410 54 485 45 555 63 620 55 700 61 760 58"/>
          <path className="line amber-line" d="M0 142 C70 130 98 106 158 103 S250 94 310 102 385 69 450 72 520 90 580 100 650 115 760 126"/>
          <path className="line blue-line" d="M0 148 C75 140 118 124 182 128 S275 117 332 122 420 100 472 103 570 101 630 110 710 101 760 105"/>
          <circle className="chart-point teal-point" cx="128" cy="51" r="4"/><circle className="chart-point amber-point" cx="450" cy="72" r="4"/><circle className="chart-point blue-point" cx="630" cy="110" r="4"/>
        </svg>
        <div className="chart-xlabels"><span>06:00</span><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span><span>22:00</span></div>
      </div>
    </Panel>
  );
}

function UtilizationPanel() {
  const rows = [
    ["教学空间", 76], ["办公空间", 68], ["实验空间", 81], ["体育场馆", 64], ["学生宿舍", 93],
  ] as const;
  return (
    <Panel title="空间与资源利用" action={<span className="pill coral">低效空间 23间</span>} className="utilization-panel">
      <div className="bar-list">
        {rows.map(([label, value]) => (
          <div className="bar-row" key={label}>
            <span>{label}</span>
            <div className="bar-track"><i style={{ width: `${value}%` }} /></div>
            <strong>{value}%</strong>
          </div>
        ))}
      </div>
      <button className="text-action">查看空间分析 <Icon name="arrow" size={14}/></button>
    </Panel>
  );
}

function CampusMap({ context = "overview", selectedBuilding, onSelectBuilding }: { context?: ModuleId; selectedBuilding: boolean; onSelectBuilding: () => void }) {
  const [mode, setMode] = useState(context === "overview" ? "综合态势" : modules.find((m) => m.id === context)?.label ?? "综合态势");
  const modes = context === "overview"
    ? ["综合态势", "教学运行", "空间资源", "安全运行", "设施运维"]
    : [modules.find((m) => m.id === context)?.label ?? "专题态势", "实时状态", "历史分析"];

  return (
    <div className={`campus-map map-${context}`}>
      <div className="map-image" />
      <div className="map-vignette" />
      <div className="map-tabs" role="tablist" aria-label="场景模式">
        {modes.map((item) => <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)}>{item}</button>)}
      </div>
      <div className="map-tools" aria-label="地图工具">
        <button title="图层"><Icon name="layers" size={18}/></button>
        <button title="空间定位"><Icon name="pin" size={18}/></button>
        <button title="路径分析"><Icon name="route" size={18}/></button>
      </div>
      <button className="map-marker marker-alert" title="实验楼烟感异常"><Icon name="alert" size={17}/><span>实验楼烟感异常</span></button>
      <button className="map-marker marker-traffic" title="北门17:30预计拥堵"><span className="traffic-dot"/><span>北门17:30预计拥堵</span></button>
      <button className="camera-marker camera-one" title="查看摄像头"><Icon name="camera" size={15}/></button>
      <button className="camera-marker camera-two" title="查看摄像头"><Icon name="camera" size={15}/></button>
      <button className="building-hit" onClick={onSelectBuilding} aria-label="查看A3教学楼" />
      <div className="drone-route" aria-hidden="true"><i/><i/><i/><span><Icon name="drone" size={18}/></span></div>
      {selectedBuilding && (
        <div className="building-popover">
          <button className="popover-close" onClick={onSelectBuilding} aria-label="关闭"><Icon name="close" size={14}/></button>
          <h3><i/>A3教学楼</h3>
          <dl><div><dt>当前课程</dt><dd>12</dd></div><div><dt>教室利用率</dt><dd>68%</dd></div><div><dt>设备在线</dt><dd>97%</dd></div><div><dt>待处理告警</dt><dd className="warning">1</dd></div></dl>
          <button className="popover-action">进入楼宇 <Icon name="arrow" size={13}/></button>
        </div>
      )}
      <div className="map-legend"><span><i className="healthy"/>正常</span><span><i className="attention"/>关注</span><span><i className="critical"/>告警</span></div>
    </div>
  );
}

function OverviewPage({ onEventAction }: { onEventAction: (name: string) => void }) {
  const [selectedBuilding, setSelectedBuilding] = useState(true);
  const health = [["校园安全", 91], ["教学运行", 96], ["空间资产", 83], ["设施运维", 88]] as const;
  const events = [
    ["实验楼烟感异常", "紧急", "处置", "critical"],
    ["北门17:30预计拥堵", "预警", "定位", "warning"],
    ["A3教学楼利用率偏低", "关注", "分析", "info"],
    ["分析测试中心设备待修", "待办", "查看", "neutral"],
  ] as const;
  return (
    <>
      <div className="metric-grid">
        <MetricCard icon="users" label="在校师生" value="22,684" trend="+2.4%" />
        <MetricCard icon="calendar" label="今日课程" value="186" trend="96%执行" />
        <MetricCard icon="overview" label="空间利用率" value="72.6%" trend="+3.8%" />
        <MetricCard icon="device" label="设备在线率" value="98.4%" trend="稳定" />
        <MetricCard icon="energy" label="今日能耗" value="84.2" unit="MWh" trend="-4.1%" />
        <MetricCard icon="alert" label="待办事件" value="7" tone="coral" trend="2项紧急" />
      </div>
      <div className="overview-grid">
        <CampusMap selectedBuilding={selectedBuilding} onSelectBuilding={() => setSelectedBuilding((v) => !v)} />
        <aside className="overview-rail">
          <Panel title="校级运行指数" className="health-panel">
            <div className="health-layout">
              <div className="health-score"><div><strong>92</strong><span>整体健康</span></div></div>
              <div className="health-bars">
                {health.map(([label, value]) => <div className="health-row" key={label}><span>{label}</span><div><i style={{width:`${value}%`}}/></div><strong>{value}</strong></div>)}
              </div>
            </div>
          </Panel>
          <Panel title="管理关注" action={<button className="subtle-button">全部 7</button>} className="attention-panel">
            <div className="event-list">
              {events.map(([name, level, action, tone]) => (
                <article className={`event-row event-${tone}`} key={name}>
                  <i/><div><strong>{name}</strong><span>{level}</span></div><button onClick={() => onEventAction(name)}>{action}</button>
                </article>
              ))}
            </div>
          </Panel>
          <Panel title="今日重点日程" className="schedule-panel">
            <div className="schedule-list">
              <div><time>08:30</time><span>教学楼巡检</span><em className="done">已完成</em></div>
              <div><time>14:00</time><span>学术活动</span><em>预计1,200人</em></div>
              <div><time>19:00</time><span>体育场活动</span><em>预计3,500人</em></div>
            </div>
          </Panel>
        </aside>
        <TrendChart />
        <UtilizationPanel />
      </div>
    </>
  );
}

const sourceSystems = [
  { name: "统一数据中台", detail: "人员 · 组织 · 课程 · 资产", status: "运行正常", rate: "99.8%" },
  { name: "物联中台", detail: "设备 · 测点 · 实时状态", status: "运行正常", rate: "98.9%" },
  { name: "视频融合平台", detail: "摄像机 · 视频 · AI事件", status: "轻微延迟", rate: "97.6%" },
  { name: "教务管理系统", detail: "课表 · 教室 · 教学班", status: "运行正常", rate: "100%" },
  { name: "房产资产系统", detail: "房间 · 资产 · 工单", status: "运行正常", rate: "99.2%" },
  { name: "无人机采集平台", detail: "航线 · 影像 · 点云", status: "待更新", rate: "94.3%" },
];

function DataCenterPage() {
  const [filter, setFilter] = useState("全部数据");
  return (
    <div className="module-layout data-layout">
      <div className="module-metrics compact-metrics">
        <div><span>接入系统</span><strong>18</strong><small>核心系统 8</small></div>
        <div><span>孪生对象</span><strong>86,420</strong><small>今日新增 126</small></div>
        <div><span>空间绑定率</span><strong>98.7%</strong><small>较上月 +1.6%</small></div>
        <div><span>数据质量</span><strong>94.6</strong><small>优秀</small></div>
        <div><span>今日交换</span><strong>2.84亿</strong><small>条数据</small></div>
      </div>
      <Panel title="校园数据资源图谱" action={<div className="segmented">{["全部数据","业务数据","感知数据","模型数据"].map(x=><button key={x} className={filter===x?"active":""} onClick={()=>setFilter(x)}>{x}</button>)}</div>} className="data-graph-panel">
        <div className="data-graph">
          <div className="graph-column source-column"><span className="column-label">数据来源</span>{sourceSystems.slice(0,4).map((s)=><div className="graph-node" key={s.name}><Icon name="database" size={17}/><div><strong>{s.name}</strong><span>{s.detail}</span></div></div>)}</div>
          <div className="graph-lines"><i/><i/><i/><i/></div>
          <div className="graph-core"><span className="core-ring ring-one"/><span className="core-ring ring-two"/><div><ProductMark/><strong>时空数据中心</strong><span>统一编码 · 语义映射</span><small>86,420 个孪生对象</small></div></div>
          <div className="graph-lines reverse"><i/><i/><i/><i/></div>
          <div className="graph-column service-column"><span className="column-label">能力服务</span>{["空间定位服务","室内外路径服务","模型场景服务","事件订阅服务"].map((x,i)=><div className="graph-node" key={x}><Icon name={i===0?"pin":i===1?"route":i===2?"layers":"alert"} size={17}/><div><strong>{x}</strong><span>{["4,268次/日","1,860次/日","32个场景","12,492条/日"][i]}</span></div></div>)}</div>
        </div>
      </Panel>
      <Panel title="数据源运行状态" action={<button className="subtle-button">接口监控</button>} className="source-panel">
        <div className="source-table"><div className="table-head"><span>系统</span><span>数据范围</span><span>状态</span><span>质量</span></div>{sourceSystems.map(s=><div className="table-row" key={s.name}><strong>{s.name}</strong><span>{s.detail}</span><em className={s.status!=="运行正常"?"warn":""}>{s.status}</em><b>{s.rate}</b></div>)}</div>
      </Panel>
      <Panel title="数据质量诊断" action={<span className="pill teal">今日已扫描</span>} className="quality-panel">
        <div className="quality-ring"><strong>94.6</strong><span>综合质量</span></div>
        <div className="quality-list"><div><span>完整性</span><b>97.2%</b></div><div><span>一致性</span><b>95.8%</b></div><div><span>及时性</span><b>91.4%</b></div><div><span>空间准确性</span><b>93.9%</b></div></div>
      </Panel>
      <Panel title="待治理问题" action={<span className="pill coral">42项</span>} className="issues-panel">
        <div className="issue-list"><button><i className="critical"/>未绑定空间资产 <b>18</b></button><button><i className="attention"/>坐标异常设备 <b>9</b></button><button><i className="attention"/>过期模型版本 <b>7</b></button><button><i className="healthy"/>重复房间编码 <b>8</b></button></div>
      </Panel>
    </div>
  );
}

function SecurityPage({ onEventAction }: { onEventAction: (name: string) => void }) {
  const [selectedBuilding, setSelectedBuilding] = useState(false);
  return (
    <div className="module-layout security-layout">
      <div className="module-metrics compact-metrics"><div><span>安全指数</span><strong>91</strong><small>总体平稳</small></div><div><span>在线摄像头</span><strong>3,842</strong><small>在线率 98.6%</small></div><div><span>今日事件</span><strong>12</strong><small>已处置 9</small></div><div><span>消防设备</span><strong>4,260</strong><small>异常 2</small></div><div><span>通行流量</span><strong>36,842</strong><small>人次</small></div></div>
      <div className="wide-map"><CampusMap context="security" selectedBuilding={selectedBuilding} onSelectBuilding={()=>setSelectedBuilding(v=>!v)}/></div>
      <Panel title="实时事件" action={<span className="pill coral">3项待处置</span>} className="security-events"><div className="command-list"><article><i className="critical"/><div><strong>实验楼烟感异常</strong><span>15:26 · 实验楼3层 · 视频已联动</span></div><button onClick={()=>onEventAction("实验楼烟感异常")}>立即处置</button></article><article><i className="attention"/><div><strong>北门人流密度升高</strong><span>预计17:30达到峰值 · 建议增派2人</span></div><button>调度资源</button></article><article><i className="healthy"/><div><strong>A3教学楼摄像头离线</strong><span>15:08 · 已生成维修工单</span></div><button>查看工单</button></article></div></Panel>
      <Panel title="应急资源" action={<button className="subtle-button">一键调度</button>} className="resource-panel"><div className="resource-grid"><div><Icon name="users"/><strong>安保人员</strong><span>在岗 42 / 可调度 8</span></div><div><Icon name="drone"/><strong>巡检无人机</strong><span>在线 4 / 空闲 2</span></div><div><Icon name="device"/><strong>应急车辆</strong><span>可用 6 / 执行中 1</span></div><div><Icon name="route"/><strong>疏散预案</strong><span>有效 18 / 待更新 2</span></div></div></Panel>
    </div>
  );
}

function AssetsPage() {
  const [spaceType, setSpaceType] = useState("全部空间");
  const [selectedBuilding, setSelectedBuilding] = useState(true);
  return (
    <div className="module-layout assets-layout">
      <div className="module-metrics compact-metrics"><div><span>房产面积</span><strong>140万㎡</strong><small>250余栋</small></div><div><span>空间利用率</span><strong>72.6%</strong><small>提升 3.8%</small></div><div><span>资产总量</span><strong>58,246</strong><small>总值 10.72亿元</small></div><div><span>重点设备</span><strong>426</strong><small>在线率 97.3%</small></div><div><span>待处理工单</span><strong>23</strong><small>逾期 3</small></div></div>
      <Panel title="空间资源目录" action={<button className="subtle-button">需求申报</button>} className="space-tree-panel"><div className="space-search"><Icon name="search" size={14}/><input placeholder="搜索楼宇或房间"/></div><div className="space-tree"><button className="expanded"><span>主校区</span><b>250栋</b></button><button className="child active"><span>A3教学楼</span><b>86间</b></button><button className="child"><span>分析测试中心</span><b>42间</b></button><button className="child"><span>信息技术中心</span><b>38间</b></button><button className="child"><span>图书馆</span><b>64间</b></button><button className="child"><span>学生公寓区</span><b>28栋</b></button></div></Panel>
      <div className="assets-map"><div className="filter-chips">{["全部空间","教学","办公","实验","宿舍"].map(x=><button key={x} className={spaceType===x?"active":""} onClick={()=>setSpaceType(x)}>{x}</button>)}</div><CampusMap context="assets" selectedBuilding={selectedBuilding} onSelectBuilding={()=>setSelectedBuilding(v=>!v)}/></div>
      <Panel title="空间使用分析" action={<span className="pill coral">23间低效</span>} className="space-analysis-panel"><div className="donut-set"><div className="mini-donut use"><strong>72.6%</strong><span>综合利用</span></div><div className="mini-donut vacant"><strong>8.4%</strong><span>空闲空间</span></div></div><div className="space-findings"><p><i className="critical"/>A3教学楼 12间教室利用率低于45%</p><p><i className="attention"/>西区办公空间人均面积高于校均值18%</p><p><i className="healthy"/>实验空间本月利用率提升6.2%</p></div><button className="primary-button">生成调配建议</button></Panel>
      <Panel title="资产状态" className="asset-status-panel"><div className="asset-summary"><div><span>使用中</span><strong>42,816</strong></div><div><span>闲置</span><strong>3,284</strong></div><div><span>维修中</span><strong>126</strong></div><div><span>待盘点</span><strong>842</strong></div></div><div className="asset-line"><i style={{width:"73.6%"}}/><i style={{width:"5.6%"}}/><i style={{width:".8%"}}/><i style={{width:"20%"}}/></div></Panel>
    </div>
  );
}

function TeachingPage() {
  const [selectedRoom, setSelectedRoom] = useState("A3-502");
  const rooms = [["A3-502","数据结构","68/80","进行中"],["A3-503","工程测量","72/80","进行中"],["B2-201","大学英语","0/60","空闲"],["C1-108","流体力学","116/120","进行中"],["A3-406","—","0/100","可预约"]];
  return (
    <div className="module-layout teaching-layout">
      <div className="module-metrics compact-metrics"><div><span>今日课程</span><strong>186</strong><small>执行率 96%</small></div><div><span>在用教室</span><strong>142</strong><small>空闲 42</small></div><div><span>平均到课率</span><strong>91.8%</strong><small>较上周 +1.2%</small></div><div><span>教室设备</span><strong>98.1%</strong><small>在线</small></div><div><span>教学异常</span><strong>6</strong><small>待复核 2</small></div></div>
      <Panel title="教室课程实时状态" action={<div className="segmented"><button className="active">当前</button><button>今日</button><button>本周</button></div>} className="room-table-panel"><div className="room-table"><div className="table-head"><span>教室</span><span>当前课程</span><span>到课/容量</span><span>状态</span></div>{rooms.map(r=><button className={`table-row ${selectedRoom===r[0]?"selected":""}`} key={r[0]} onClick={()=>setSelectedRoom(r[0])}><strong>{r[0]}</strong><span>{r[1]}</span><span>{r[2]}</span><em className={r[3]==="进行中"?"running":r[3]==="空闲"?"idle":"available"}>{r[3]}</em></button>)}</div></Panel>
      <Panel title="教学空间分布" action={<button className="subtle-button">空闲教室查询</button>} className="teaching-map-panel"><div className="mini-campus"><div className="mini-campus-image"/><span className="teaching-zone zone-a">A3教学楼<small>68%</small></span><span className="teaching-zone zone-b">C1教学楼<small>82%</small></span><span className="teaching-zone zone-c">B2教学楼<small>54%</small></span><div className="mini-legend"><span><i className="healthy"/>空闲</span><span><i className="teal"/>上课中</span><span><i className="attention"/>高负荷</span></div></div></Panel>
      <Panel title="课程运行分析" action={<span className="pill teal">实时</span>} className="course-analysis-panel"><div className="course-kpi"><div><span>课程执行</span><strong>96%</strong></div><div><span>平均到课</span><strong>91.8%</strong></div><div><span>设备可用</span><strong>98.1%</strong></div></div><div className="spark-area"><svg viewBox="0 0 440 110" preserveAspectRatio="none"><path className="chart-gridline" d="M0 20h440M0 55h440M0 90h440"/><path className="line teal-line" d="M0 82C45 72 60 54 102 60s54-18 96-8 55 24 96 10 68-5 100-18 36 2 46-8"/></svg><span>课堂到课率 · 近7日</span></div><div className="teaching-alerts"><p><i className="critical"/>2门课程计划与实际占用不一致</p><p><i className="attention"/>A3-406 连续3周利用率低于40%</p></div></Panel>
      <Panel title="智能排课助手" className="scheduler-panel"><div className="assistant-summary"><Icon name="bot" size={24}/><div><strong>查找今天15:00后</strong><span>可容纳80人且配有录播设备的教室</span></div></div><div className="room-recommendations"><button><strong>A3-406</strong><span>容量100 · 步行6分钟</span><em>推荐</em></button><button><strong>B2-305</strong><span>容量90 · 步行9分钟</span><em>可用</em></button></div></Panel>
    </div>
  );
}

function ResearchPage() {
  const datasets = [
    ["校园建筑与道路三维数据集","GIS · BIM · 3D Tiles","2.8 TB","98.4"],
    ["无人机航拍变化检测数据集","影像 · 点云 · 标注","860 GB","96.8"],
    ["机器人室内外导航数据集","轨迹 · 语义地图","124 GB","94.2"],
    ["校园物联时序数据集","IoT · 时序 · 环境","1.6 TB","97.1"],
  ];
  return (
    <div className="module-layout research-layout">
      <div className="research-hero"><div><span className="eyebrow">CAMPUS DATA WORKSHOP</span><h2>把校园运行沉淀为<br/>可持续研究的数据资产</h2><p>为测绘、空间智能、机器人、水利与计算机视觉提供受控、可追溯的数据集和算法验证环境。</p><div className="hero-actions"><button className="primary-button">申请数据集</button><button className="secondary-button">进入训练场</button></div></div><div className="hero-stats"><div><strong>42</strong><span>科研数据集</span></div><div><strong>18.6TB</strong><span>可用数据</span></div><div><strong>12</strong><span>在研项目</span></div><div><strong>368</strong><span>API日调用</span></div></div></div>
      <Panel title="高质量数据集" action={<button className="subtle-button">查看全部 42</button>} className="datasets-panel"><div className="dataset-grid">{datasets.map((d,i)=><article key={d[0]}><div className={`dataset-cover cover-${i+1}`}><Icon name={i===0?"building":i===1?"drone":i===2?"bot":"database"} size={30}/><span>DATASET {String(i+1).padStart(2,"0")}</span></div><div className="dataset-copy"><h3>{d[0]}</h3><span>{d[1]}</span><div><b>{d[2]}</b><em>质量 {d[3]}</em></div></div></article>)}</div></Panel>
      <Panel title="空间智能训练场" action={<span className="pill teal">3项运行中</span>} className="training-panel"><div className="training-list"><article><div className="training-icon"><Icon name="drone"/></div><div><strong>建筑变化检测模型</strong><span>Epoch 42 / 60 · GPU 68%</span><div className="progress"><i style={{width:"70%"}}/></div></div><em>训练中</em></article><article><div className="training-icon"><Icon name="bot"/></div><div><strong>室内外连续导航算法</strong><span>仿真场景 126 / 180</span><div className="progress"><i style={{width:"64%"}}/></div></div><em>验证中</em></article><article><div className="training-icon"><Icon name="layers"/></div><div><strong>山地校园人流预测</strong><span>数据准备完成 · 等待算力</span><div className="progress"><i style={{width:"92%"}}/></div></div><em>排队</em></article></div></Panel>
    </div>
  );
}

function EmbodiedPage() {
  const [command, setCommand] = useState("巡检信息技术中心六楼配电间");
  const [planned, setPlanned] = useState(false);
  return (
    <div className="module-layout embodied-layout">
      <div className="module-metrics compact-metrics"><div><span>在线机器人</span><strong>8/10</strong><small>空闲 3</small></div><div><span>今日任务</span><strong>26</strong><small>完成 19</small></div><div><span>平均成功率</span><strong>96.2%</strong><small>近30日</small></div><div><span>人工接管</span><strong>2</strong><small>均已完成</small></div><div><span>智能体调用</span><strong>186</strong><small>今日</small></div></div>
      <Panel title="具身智能协同地图" action={<span className="pill teal">实时在线</span>} className="robot-map-panel"><div className="robot-map"><div className="mini-campus-image"/><span className="robot-point robot-a"><Icon name="bot" size={15}/><b>巡检01</b></span><span className="robot-point robot-b"><Icon name="bot" size={15}/><b>配送02</b></span><span className="robot-point robot-c"><Icon name="drone" size={15}/><b>无人机03</b></span><svg className="robot-path" viewBox="0 0 700 360" preserveAspectRatio="none"><path d="M120 280C220 215 290 250 360 180s145-72 215-120"/></svg></div></Panel>
      <Panel title="任务队列" action={<button className="subtle-button">全部任务</button>} className="task-queue-panel"><div className="task-list"><article><span className="task-number">01</span><div><strong>信息中心配电间巡检</strong><small>巡检01 · 执行中 · 68%</small><div className="progress"><i style={{width:"68%"}}/></div></div><em>12:26</em></article><article><span className="task-number">02</span><div><strong>实验室样品配送</strong><small>配送02 · 前往取件点</small><div className="progress"><i style={{width:"36%"}}/></div></div><em>12:34</em></article><article><span className="task-number">03</span><div><strong>北区屋顶异常复核</strong><small>无人机03 · 等待授权</small><div className="progress"><i style={{width:"12%"}}/></div></div><em>待确认</em></article></div></Panel>
      <Panel title="校园智能体任务编排" action={<span className="pill teal">空间推理已启用</span>} className="agent-planner-panel"><div className="agent-dialog"><div className="agent-avatar"><Icon name="bot" size={22}/></div><div className="agent-bubble"><strong>我可以调用校园空间、设备与机器人能力</strong><span>输入巡检、查询或调度任务，我会先生成计划并等待确认。</span></div></div><div className="command-box"><input value={command} onChange={(e)=>setCommand(e.target.value)} aria-label="智能体任务"/><button onClick={()=>setPlanned(true)}>生成计划 <Icon name="arrow" size={14}/></button></div>{planned && <div className="plan-result"><div><span>1</span><p><strong>目标解析</strong><small>JI楼 · 6层 · 配电间</small></p><Icon name="check" size={16}/></div><div><span>2</span><p><strong>能力匹配</strong><small>巡检01 · 热成像载荷</small></p><Icon name="check" size={16}/></div><div><span>3</span><p><strong>路径规划</strong><small>预计12分钟 · 需门禁授权</small></p><button>确认执行</button></div></div>}</Panel>
    </div>
  );
}

function LowAltitudePage() {
  const [selectedBuilding, setSelectedBuilding] = useState(false);
  const [flightStarted, setFlightStarted] = useState(false);
  return (
    <div className="module-layout low-layout">
      <div className="module-metrics compact-metrics"><div><span>在线无人机</span><strong>4/6</strong><small>空闲 2</small></div><div><span>今日飞行</span><strong>12架次</strong><small>累计 146km</small></div><div><span>自动机库</span><strong>3</strong><small>全部正常</small></div><div><span>采集数据</span><strong>42.8GB</strong><small>今日</small></div><div><span>待更新区域</span><strong>6</strong><small>建筑 2处</small></div></div>
      <div className="low-map"><CampusMap context="lowaltitude" selectedBuilding={selectedBuilding} onSelectBuilding={()=>setSelectedBuilding(v=>!v)}/><div className="airspace-layers"><span>120m</span><span>80m</span><span>50m</span></div></div>
      <Panel title="飞行任务" action={<button className="subtle-button">新建任务</button>} className="flight-panel"><div className="flight-card active"><div><Icon name="drone"/><div><strong>北区屋顶巡检</strong><span>无人机03 · 航线 4.2km</span></div><em>{flightStarted?"执行中":"待执行"}</em></div><dl><div><dt>预计时长</dt><dd>18分钟</dd></div><div><dt>航点</dt><dd>26</dd></div><div><dt>最高航高</dt><dd>82m</dd></div></dl><button className="primary-button" onClick={()=>setFlightStarted(true)}>{flightStarted?"查看实时画面":"开始任务"}</button></div><div className="flight-list"><button><span>主干道交通巡查</span><em>14:30</em></button><button><span>边坡变化复测</span><em>16:00</em></button><button><span>体育场活动保障</span><em>18:30</em></button></div></Panel>
      <Panel title="飞行环境" action={<span className="pill teal">适宜飞行</span>} className="weather-panel"><div className="weather-main"><strong>26°</strong><div><span>多云</span><small>能见度 12km</small></div></div><div className="weather-grid"><div><span>风速</span><strong>2.6m/s</strong></div><div><span>风向</span><strong>东南</strong></div><div><span>降水</span><strong>0%</strong></div><div><span>图传</span><strong>优秀</strong></div></div></Panel>
      <Panel title="三维模型更新" action={<span className="pill coral">6处变化</span>} className="model-update-panel"><div className="update-preview"><div className="before"><span>更新前</span></div><div className="after"><span>最新采集</span><i>+新增结构</i></div></div><div className="update-info"><strong>北区屋顶变化检测</strong><span>采集于今日 10:42 · 置信度 96.8%</span><div className="update-actions"><button className="secondary-button">对比查看</button><button className="primary-button">创建更新任务</button></div></div></Panel>
    </div>
  );
}

function AppShell() {
  const [activeModule, setActiveModule] = useState<ModuleId>("overview");
  const [time, setTime] = useState("15:28:36");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const active = modules.find((m) => m.id === activeModule)!;

  useEffect(() => {
    const tick = () => setTime(new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredSearch = useMemo(() => searchItems.filter((x) => x.includes(query.trim())).slice(0, 5), [query]);
  const navigate = (id: ModuleId) => { setActiveModule(id); setSearchOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleEventAction = (name: string) => setToast(`${name} 已进入处置流程`);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <ProductMark />
        <nav aria-label="主要功能">
          {modules.map((item) => (
            <button key={item.id} className={activeModule === item.id ? "active" : ""} onClick={() => navigate(item.id)} aria-label={item.label} title={item.label}>
              <Icon name={item.icon} size={21}/><span className="nav-tooltip"><strong>{item.label}</strong><small>{item.kicker}</small></span>
            </button>
          ))}
        </nav>
        <div className="sidebar-status"><i/><span>平台运行正常</span></div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="page-title"><span>数字孪生校园</span><h1>{active.id === "overview" ? "校园态势总览" : active.kicker}</h1></div>
          <div className="global-search">
            <Icon name="search" size={18}/><input value={query} onFocus={()=>setSearchOpen(true)} onChange={(e)=>{setQuery(e.target.value);setSearchOpen(true)}} placeholder="搜索建筑、房间、设备或事件" aria-label="全局搜索"/>
            {searchOpen && (
              <div className="search-results">
                <header><span>空间智能搜索</span><button onClick={()=>setSearchOpen(false)}><Icon name="close" size={14}/></button></header>
                {(query ? filteredSearch : searchItems.slice(0,4)).map((item,i)=><button key={item} onClick={()=>{setQuery(item);setSearchOpen(false);setToast(`已定位：${item}`)}}><Icon name={i%2?"building":"pin"} size={15}/><span>{item}</span><small>{i<2?"空间对象":"业务对象"}</small></button>)}
              </div>
            )}
          </div>
          <button className="campus-select">主校区 <span>⌄</span></button>
          <div className="top-time"><span>2026-08-06</span><strong>{time}</strong></div>
          <button className={`assistant-entry ${assistantOpen?"active":""}`} onClick={()=>setAssistantOpen(v=>!v)}><Icon name="bot" size={18}/>校园智能体</button>
          <button className="notification-button" aria-label="通知"><Icon name="bell" size={18}/><i>3</i></button>
          <button className="profile-button" aria-label="用户设置"><span>校</span><i/></button>
        </header>

        <div className="content-shell">
          {activeModule === "overview" && <OverviewPage onEventAction={handleEventAction}/>} 
          {activeModule === "data" && <DataCenterPage/>}
          {activeModule === "security" && <SecurityPage onEventAction={handleEventAction}/>} 
          {activeModule === "assets" && <AssetsPage/>}
          {activeModule === "teaching" && <TeachingPage/>}
          {activeModule === "research" && <ResearchPage/>}
          {activeModule === "embodied" && <EmbodiedPage/>}
          {activeModule === "lowaltitude" && <LowAltitudePage/>}
        </div>
      </main>

      {assistantOpen && (
        <aside className="assistant-drawer" aria-label="校园智能体">
          <header><div><Icon name="bot"/><span><strong>校园智能体</strong><small>连接空间、数据与设备能力</small></span></div><button onClick={()=>setAssistantOpen(false)}><Icon name="close"/></button></header>
          <div className="assistant-messages"><div className="assistant-message"><Icon name="bot" size={16}/><p>下午好。当前校园整体运行指数为92，有3项管理关注需要处理。您可以直接查询空间、课程、设备或发起巡检任务。</p></div><div className="quick-prompts"><button onClick={()=>setQuery("空闲多媒体教室")}>查找空闲多媒体教室</button><button onClick={()=>navigate("security")}>查看今日安全事件</button><button onClick={()=>navigate("assets")}>分析低效空间</button><button onClick={()=>navigate("lowaltitude")}>创建无人机巡检</button></div></div>
          <div className="assistant-input"><input placeholder="询问校园智能体…"/><button><Icon name="arrow" size={16}/></button></div>
        </aside>
      )}
      {toast && <div className="toast"><Icon name="check" size={16}/><span>{toast}</span></div>}
    </div>
  );
}

export default function Home() {
  return <AppShell />;
}
