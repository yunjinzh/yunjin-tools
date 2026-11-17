"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileBadge2,
  FlaskConical,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Map,
  Microscope,
  QrCode,
  Radar,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Siren,
  SlidersHorizontal,
  Sparkles,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";

import {
  categoryRules,
  directRiskTriggers,
  labs,
  managementRules,
  riskFactors,
  type Lab,
  type RiskLevel,
} from "./lab-data";
import { OperationsPage, type OperationsView } from "./operations";

type ViewKey = "dashboard" | "labs" | "assessment" | OperationsView;

const levelMeta: Record<
  RiskLevel,
  { name: string; color: string; soft: string; border: string }
> = {
  I: { name: "重大风险", color: "#c63b32", soft: "#fae8e5", border: "#e7b2ad" },
  II: { name: "高风险", color: "#d96b28", soft: "#fff0e3", border: "#efc49f" },
  III: { name: "中风险", color: "#b48a00", soft: "#fff6cf", border: "#ead986" },
  IV: { name: "低风险", color: "#2368a2", soft: "#e6f1fb", border: "#a9cbe7" },
};

const nav = [
  { key: "dashboard" as ViewKey, label: "安全态势", icon: LayoutDashboard },
  { key: "labs" as ViewKey, label: "实验室台账", icon: FlaskConical },
  { key: "assessment" as ViewKey, label: "分级分类评估", icon: Gauge },
  { key: "inspections" as ViewKey, label: "检查与隐患", icon: ClipboardCheck },
  { key: "access" as ViewKey, label: "培训与准入", icon: GraduationCap },
  { key: "equipment" as ViewKey, label: "设备与监测", icon: Microscope },
  { key: "emergency" as ViewKey, label: "应急管理", icon: Siren },
  { key: "rules" as ViewKey, label: "制度规则中心", icon: FileBadge2 },
];

function LevelPill({ level, compact = false }: { level: RiskLevel; compact?: boolean }) {
  const meta = levelMeta[level];
  return (
    <span
      className={`level-pill ${compact ? "level-pill--compact" : ""}`}
      style={{ color: meta.color, background: meta.soft, borderColor: meta.border }}
    >
      <i style={{ background: meta.color }} />
      {level}级 · {meta.name}
    </span>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof ShieldCheck;
  accent: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <span className="metric-icon" style={{ color: accent, background: `${accent}16` }}>
          <Icon size={19} strokeWidth={1.8} />
        </span>
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  note,
  action,
}: {
  eyebrow: string;
  title: string;
  note?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        {note ? <p>{note}</p> : null}
      </div>
      {action}
    </div>
  );
}

function FloorPlan({ onSelect }: { onSelect: (lab: Lab) => void }) {
  const rooms = [
    { room: "SC7104", name: "冷冻电镜", level: "II" as RiskLevel, x: 1, y: 1, w: 2, h: 2 },
    { room: "SC7105", name: "X射线结构", level: "I" as RiskLevel, x: 3, y: 1, w: 2, h: 2 },
    { room: "SC7106", name: "电子探针", level: "I" as RiskLevel, x: 5, y: 1, w: 2, h: 2 },
    { room: "SC7107", name: "扫描电镜", level: "III" as RiskLevel, x: 1, y: 3, w: 2, h: 2 },
    { room: "SC7108", name: "透射电镜", level: "II" as RiskLevel, x: 5, y: 3, w: 2, h: 2 },
  ];

  return (
    <div className="plan-shell">
      <div className="plan-toolbar">
        <div>
          <span className="live-dot" /> 生材楼 7F · 在线
        </div>
        <span>点击房间查看详情</span>
      </div>
      <div className="floor-plan" aria-label="实验室风险分区平面图">
        <div className="corridor"><span>安全疏散走廊</span><i>出口 →</i></div>
        {rooms.map((room) => {
          const lab = labs.find((item) => item.room === room.room) ?? labs[0];
          return (
            <button
              key={room.room}
              className="plan-room"
              style={{
                gridColumn: `${room.x} / span ${room.w}`,
                gridRow: `${room.y} / span ${room.h}`,
                borderColor: levelMeta[room.level].border,
                background: `linear-gradient(145deg, ${levelMeta[room.level].soft}, #fff)`,
              }}
              onClick={() => onSelect(lab)}
            >
              <span style={{ color: levelMeta[room.level].color }}>{room.level}</span>
              <strong>{room.room}</strong>
              <small>{room.name}</small>
              <i className="sensor-pulse" />
            </button>
          );
        })}
        <div className="plan-core"><Radar size={22} /><span>监测核心</span></div>
        <div className="plan-exit plan-exit--left">应急出口</div>
        <div className="plan-exit plan-exit--right">应急出口</div>
      </div>
      <div className="plan-legend">
        {(Object.keys(levelMeta) as RiskLevel[]).map((level) => (
          <span key={level}><i style={{ background: levelMeta[level].color }} />{level}级</span>
        ))}
        <span><i className="sensor-legend" />在线监测点</span>
      </div>
    </div>
  );
}

function Dashboard({ onSelectLab, onNavigate }: { onSelectLab: (lab: Lab) => void; onNavigate: (view: ViewKey) => void }) {
  const levelCounts = (Object.keys(levelMeta) as RiskLevel[]).map((level) => ({
    level,
    count: labs.filter((lab) => lab.level === level).length,
  }));

  return (
    <div className="view-stack">
      <section className="overview-band">
        <div>
          <span className="eyebrow-light">LAB SAFETY / 2026</span>
          <h1>风险看得见，责任落到人</h1>
          <p>以房间为最小管理单元，将分级分类、危险源、人员准入、检查整改与设备状态串成一条可追溯的安全链。</p>
          <div className="hero-actions">
            <Button className="warm-button" onClick={() => onNavigate("assessment")}>
              开始风险评估 <ChevronRight size={16} />
            </Button>
            <Button variant="outline" className="hero-outline" onClick={() => onNavigate("labs")}>
              查看实验室台账
            </Button>
          </div>
        </div>
        <div className="overview-gauge">
          <div className="gauge-ring" role="img" aria-label="安全治理指数92分">
            <div><strong>92</strong><span>治理指数</span></div>
          </div>
          <div className="gauge-copy">
            <span><CheckCircle2 size={15} /> 分级覆盖率 100%</span>
            <span><Activity size={15} /> 监测在线率 97.8%</span>
            <span><ClipboardCheck size={15} /> 闭环及时率 94.2%</span>
          </div>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard label="原型实验室台账" value="7 间" note="按房间建立唯一安全档案" icon={Building2} accent="#1e6459" />
        <MetricCard label="Ⅰ/Ⅱ级重点监管" value="4 间" note="自动匹配差异化检查频次" icon={ShieldAlert} accent="#c63b32" />
        <MetricCard label="重点仪器设备" value="44 台" note="来自50万元以上设备清单" icon={Microscope} accent="#7a5f38" />
        <MetricCard label="待闭环事项" value="3 项" note="1项重大隐患已限制实验活动" icon={Wrench} accent="#d96b28" />
      </section>

      <section className="dashboard-grid dashboard-grid--main">
        <article className="panel panel--wide">
          <SectionHeading
            eyebrow="SPATIAL RISK"
            title="实验楼风险空间一张图"
            note="房间颜色来自分级结果；监测点、疏散通道与设备位置可联动。"
            action={<Button variant="outline" size="sm" onClick={() => toast.info("已切换至楼层总览模式")}>楼层总览 <Map size={15} /></Button>}
          />
          <FloorPlan onSelect={onSelectLab} />
        </article>

        <article className="panel risk-panel">
          <SectionHeading eyebrow="RISK PROFILE" title="风险等级分布" />
          <div className="risk-donut-wrap">
            <div className="risk-donut"><div><strong>{labs.length}</strong><span>样例房间</span></div></div>
            <div className="risk-list">
              {levelCounts.map(({ level, count }) => (
                <button key={level} onClick={() => onNavigate("labs")}>
                  <span><i style={{ background: levelMeta[level].color }} />{level}级 {levelMeta[level].name}</span>
                  <strong>{count}</strong>
                </button>
              ))}
            </div>
          </div>
          <div className="risk-note"><TriangleAlert size={17} />Ⅰ级实验室须报高校主管部门备案，并纳入学校重点监管。</div>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <SectionHeading eyebrow="CLOSED LOOP" title="隐患整改闭环" action={<Button variant="ghost" size="sm" onClick={() => toast.success("整改台账已刷新")}>刷新 <RefreshCw size={14} /></Button>} />
          <div className="issue-list">
            <button onClick={() => toast.warning("重大隐患未完成整改前，系统保持实验活动禁用")}> 
              <span className="issue-level issue-level--red">重大</span>
              <div><strong>W6102 防护联锁异常</strong><small>已限制实验活动 · 待二级单位复核</small></div>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => toast.info("整改责任人：刘畅；计划完成：8月28日")}> 
              <span className="issue-level issue-level--orange">较大</span>
              <div><strong>W6107 危废暂存标签缺项</strong><small>整改中 · 剩余2天</small></div>
              <ChevronRight size={16} />
            </button>
            <button onClick={() => toast.success("已完成材料归档，可进入复核")}> 
              <span className="issue-level issue-level--blue">一般</span>
              <div><strong>SC7104 低温手套更换</strong><small>已完成 · 待线上销号</small></div>
              <ChevronRight size={16} />
            </button>
          </div>
        </article>

        <article className="panel">
          <SectionHeading eyebrow="TODAY" title="今日监管任务" />
          <div className="task-progress">
            <div><strong>8 / 11</strong><span>已完成</span></div>
            <Progress value={73} className="progress-teal" />
          </div>
          <div className="timeline-list">
            <div><i className="done" /><span>09:00</span><p><strong>Ⅰ级实验室月度检查</strong>SC7105 · 已归档</p></div>
            <div><i className="active" /><span>14:30</span><p><strong>整改复核</strong>W6102 · 安全主管部门</p></div>
            <div><i /><span>16:00</span><p><strong>新项目风险评估会</strong>材料学院 · 3项待审</p></div>
          </div>
        </article>
      </section>

      <section className="rule-strip">
        <div><FileBadge2 size={22} /><span>制度规则引擎</span><strong>4级 × 5类 × 责任链</strong></div>
        <p>依据附件1—4内置分级、评分、分类和管理要求；用途、危险源类型或数量变化时自动触发重新评估。</p>
        <Button variant="outline" onClick={() => onNavigate("assessment")}>查看判定规则</Button>
      </section>
    </div>
  );
}

function LabLedger({ onSelectLab }: { onSelectLab: (lab: Lab) => void }) {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(
    () =>
      labs.filter((lab) => {
        const hit = `${lab.name}${lab.room}${lab.unit}${lab.owner}`.toLowerCase().includes(search.toLowerCase());
        return hit && (level === "all" || lab.level === level) && (category === "all" || lab.category === category);
      }),
    [search, level, category],
  );

  function downloadLedger() {
    const header = ["编号", "实验室", "单位", "房间", "类别", "等级", "负责人", "状态"];
    const rows = filtered.map((lab) => [lab.id, lab.name, lab.unit, lab.room, lab.category, lab.level, lab.owner, lab.status]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "实验室安全分级分类台账.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("台账已导出");
  }

  return (
    <div className="view-stack">
      <SectionHeading
        eyebrow="ROOM-BASED LEDGER"
        title="实验室安全分级分类台账"
        note="以房间为单元，统一管理责任人、危险源、类别、等级、检查计划、门牌与变更记录。"
        action={<Button className="primary-button" onClick={() => toast.success("已创建一条待完善的实验室档案")}>+ 新建实验室</Button>}
      />

      <section className="ledger-summary">
        <div><span>纳入台账</span><strong>{labs.length}</strong><small>间</small></div>
        <div><span>重点监管</span><strong>{labs.filter((lab) => ["I", "II"].includes(lab.level)).length}</strong><small>间</small></div>
        <div><span>类别覆盖</span><strong>{new Set(labs.map((lab) => lab.category)).size}</strong><small>/ 5类</small></div>
        <div><span>待复核变更</span><strong>2</strong><small>项</small></div>
      </section>

      <section className="panel ledger-panel">
        <div className="filter-row">
          <label className="search-box"><Search size={17} /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索实验室、房间、单位或负责人" /></label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="filter-select"><SelectValue placeholder="全部等级" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部等级</SelectItem>
              <SelectItem value="I">Ⅰ级 / 红色</SelectItem>
              <SelectItem value="II">Ⅱ级 / 橙色</SelectItem>
              <SelectItem value="III">Ⅲ级 / 黄色</SelectItem>
              <SelectItem value="IV">Ⅳ级 / 蓝色</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="filter-select"><SelectValue placeholder="全部类别" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类别</SelectItem>
              {categoryRules.map((item) => <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={downloadLedger}><Download size={16} /> 导出台账</Button>
        </div>

        <div className="table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>实验室 / 房间</TableHead>
                <TableHead>所属单位</TableHead>
                <TableHead>安全类别</TableHead>
                <TableHead>风险等级</TableHead>
                <TableHead>负责人</TableHead>
                <TableHead>下次检查</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lab) => (
                <TableRow key={lab.id} className="ledger-row" onClick={() => onSelectLab(lab)}>
                  <TableCell><strong>{lab.name}</strong><span>{lab.room} · {lab.building}</span></TableCell>
                  <TableCell>{lab.unit}</TableCell>
                  <TableCell><Badge variant="outline">{lab.category}</Badge></TableCell>
                  <TableCell><LevelPill level={lab.level} compact /></TableCell>
                  <TableCell>{lab.owner}</TableCell>
                  <TableCell>{lab.nextCheck}</TableCell>
                  <TableCell><span className={`status-tag status-${lab.status}`}>{lab.status}</span></TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="sm">详情 <ChevronRight size={14} /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 ? <div className="empty-state"><Search size={24} /><strong>没有匹配的实验室</strong><span>请调整搜索词或筛选条件。</span></div> : null}
        </div>
      </section>
    </div>
  );
}

function Assessment() {
  const [selectedFactors, setSelectedFactors] = useState<string[]>(["r10-2", "r10-12", "r5-1"]);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [category, setCategory] = useState("化学类");
  const [area, setArea] = useState("50");

  const rawScore = Math.min(
    100,
    riskFactors.filter((factor) => selectedFactors.includes(factor.id)).reduce((sum, factor) => sum + factor.score, 0),
  );
  const scoreLevel: RiskLevel = rawScore >= 100 ? "I" : rawScore >= 75 ? "II" : rawScore >= 25 ? "III" : "IV";
  const directLevels = directRiskTriggers.filter((factor) => selectedTriggers.includes(factor.id)).map((factor) => factor.level);
  const rank: Record<RiskLevel, number> = { I: 1, II: 2, III: 3, IV: 4 };
  const directLevel = directLevels.sort((a, b) => rank[a] - rank[b])[0];
  const finalLevel = directLevel && rank[directLevel] < rank[scoreLevel] ? directLevel : scoreLevel;
  const finalRule = directLevel && rank[directLevel] < rank[scoreLevel] ? "直接分级条件" : "风险累计评分";
  const management = managementRules.find((item) => item.level === finalLevel)!;

  const toggle = (id: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <div className="view-stack">
      <SectionHeading
        eyebrow="CLASSIFY & GRADE"
        title="实验室分级分类评估"
        note="先核对直接分级情形，再按评价表累计评分；系统自动取两种结果中风险较高的等级。"
        action={<Button variant="outline" onClick={() => { setSelectedFactors([]); setSelectedTriggers([]); toast.info("评估表已重置"); }}><RefreshCw size={15} /> 重置</Button>}
      />

      <section className="assessment-layout">
        <div className="assessment-form">
          <article className="panel assessment-block">
            <div className="step-head"><span>01</span><div><h3>基础信息与实验室类别</h3><p>分类依据主要危险源。涉及多类危险源时，以等级最高的危险源类别为主类。</p></div></div>
            <div className="basic-fields">
              <label><span>实验室名称</span><Input defaultValue="新能源材料制备实验室" /></label>
              <label><span>房间号</span><Input defaultValue="M4206" /></label>
              <label><span>房间面积（m²）</span><Input type="number" min="1" value={area} onChange={(event) => setArea(event.target.value)} /></label>
            </div>
            <div className="category-grid">
              {categoryRules.map((item) => (
                <button key={item.name} className={category === item.name ? "active" : ""} onClick={() => setCategory(item.name)}>
                  <span>{item.name.slice(0, 2)}</span><strong>{item.name}</strong><small>{item.cue}</small>
                </button>
              ))}
            </div>
            <p className="area-note"><SlidersHorizontal size={15} />评价表以50m²房间为基准；当前面积系数为 <strong>{((Number(area) || 50) / 50).toFixed(2)}</strong>，涉及数量阈值时应按学校细则同比调整后再勾选。</p>
          </article>

          <article className="panel assessment-block">
            <div className="step-head"><span>02</span><div><h3>直接分级情形</h3><p>命中任一情形即可得到对应等级；没有命中时继续使用累计评分结果。</p></div></div>
            <div className="trigger-list">
              {directRiskTriggers.map((item) => (
                <label key={item.id} className={selectedTriggers.includes(item.id) ? "checked" : ""}>
                  <Checkbox checked={selectedTriggers.includes(item.id)} onCheckedChange={() => toggle(item.id, setSelectedTriggers)} />
                  <span className={`trigger-level trigger-${item.level}`}>{item.level}</span>
                  <p>{item.label}</p>
                </label>
              ))}
            </div>
          </article>

          <article className="panel assessment-block">
            <div className="step-head"><span>03</span><div><h3>危险源累计评分</h3><p>符合一项计相应分数，符合多项累加，最高100分。</p></div></div>
            {[25, 10, 5].map((score) => (
              <div className="factor-group" key={score}>
                <div className="factor-score"><strong>{score}</strong><span>分 / 项</span></div>
                <div className="factor-options">
                  {riskFactors.filter((factor) => factor.score === score).map((factor) => (
                    <label key={factor.id} className={selectedFactors.includes(factor.id) ? "checked" : ""}>
                      <Checkbox checked={selectedFactors.includes(factor.id)} onCheckedChange={() => toggle(factor.id, setSelectedFactors)} />
                      <span>{factor.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </article>
        </div>

        <aside className="assessment-result">
          <div className="result-card" style={{ borderTopColor: levelMeta[finalLevel].color }}>
            <span className="result-kicker">实时评估结果</span>
            <div className="result-level" style={{ color: levelMeta[finalLevel].color }}><strong>{finalLevel}</strong><span>级</span></div>
            <h3>{levelMeta[finalLevel].name}实验室</h3>
            <p>主要类别：<strong>{category}</strong></p>
            <div className="score-row"><span>累计得分</span><strong>{rawScore} / 100</strong></div>
            <Progress value={rawScore} className="result-progress" />
            <div className="result-rule"><Sparkles size={16} /><span>最终等级由<strong>{finalRule}</strong>确定</span></div>
            <div className="result-comparison">
              <div><span>直接分级</span><strong>{directLevel ? `${directLevel}级` : "未命中"}</strong></div>
              <div><span>评分分级</span><strong>{scoreLevel}级</strong></div>
            </div>
            <Button className="primary-button result-save" onClick={() => toast.success("评估已提交至二级单位审核")}>提交审核 <ChevronRight size={16} /></Button>
          </div>

          <div className="result-requirements">
            <h4><ShieldCheck size={18} />自动匹配管理要求</h4>
            <dl>
              <div><dt>学校检查</dt><dd>{management.school}</dd></div>
              <div><dt>单位与实验室</dt><dd>{management.unit}</dd></div>
              <div><dt>培训准入</dt><dd>{management.entry}</dd></div>
              <div><dt>应急演练</dt><dd>{management.drill}</dd></div>
              <div><dt>条件保障</dt><dd>{management.guarantee}</dd></div>
            </dl>
          </div>
        </aside>
      </section>
    </div>
  );
}

function LabDetail({ lab, open, onOpenChange, onPlate }: { lab: Lab | null; open: boolean; onOpenChange: (open: boolean) => void; onPlate: () => void }) {
  if (!lab) return null;
  const rule = managementRules.find((item) => item.level === lab.level)!;
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="lab-sheet sm:max-w-xl">
        <SheetHeader>
          <div className="sheet-heading-row"><LevelPill level={lab.level} /><Badge variant="outline">{lab.category}</Badge></div>
          <SheetTitle>{lab.name}</SheetTitle>
          <SheetDescription>{lab.id} · {lab.building} {lab.room}</SheetDescription>
        </SheetHeader>
        <div className="sheet-scroll">
          <div className="lab-identity">
            <div><span>直接责任人</span><strong>{lab.owner}</strong></div>
            <div><span>责任单位</span><strong>{lab.unit}</strong></div>
            <div><span>运行状态</span><strong className={`text-${lab.status}`}>{lab.status}</strong></div>
          </div>
          <section><h4>主要危险源</h4><div className="tag-cloud">{lab.hazards.map((item) => <span key={item}>{item}</span>)}</div></section>
          <section><h4>监测与报警</h4><div className="sensor-grid">{lab.sensors.map((item, index) => <div key={item}><i className={index === 0 ? "pulse" : ""} /><span>{item}</span><strong>在线</strong></div>)}</div></section>
          <section><h4>检查计划</h4><div className="inspection-card"><ClipboardCheck size={22} /><div><span>上次检查 {lab.lastCheck}</span><strong>下次检查 {lab.nextCheck}</strong><small>{rule.unit}</small></div></div></section>
          <section><h4>等级对应要求</h4><ul className="requirement-list"><li>{rule.entry}</li><li>{rule.drill}</li><li>{rule.guarantee}</li></ul></section>
          <div className="sheet-actions"><Button className="primary-button" onClick={onPlate}><QrCode size={16} />生成安全信息牌</Button><Button variant="outline" onClick={() => toast.info("已进入该实验室的变更重评流程")}>发起变更重评</Button></div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoPlate({ lab, open, onOpenChange }: { lab: Lab | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!lab) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="plate-dialog sm:max-w-2xl">
        <DialogHeader><DialogTitle>实验室安全信息牌预览</DialogTitle><DialogDescription>符合“门外标明分级分类结果和主要危险源，并及时更新”的管理要求。</DialogDescription></DialogHeader>
        <div className="safety-plate" style={{ borderTopColor: levelMeta[lab.level].color }}>
          <header><div><ShieldAlert size={28} /><span>高校实验室安全信息牌</span></div><strong style={{ color: levelMeta[lab.level].color }}>{lab.level}级</strong></header>
          <h3>{lab.name}</h3>
          <div className="plate-meta"><span>房间 <strong>{lab.room}</strong></span><span>类别 <strong>{lab.category}</strong></span><span>状态 <strong>{lab.status}</strong></span></div>
          <div className="plate-body"><div><span>主要危险源</span>{lab.hazards.map((item) => <p key={item}>• {item}</p>)}</div><div><span>责任信息</span><p>负责人：{lab.owner}</p><p>责任单位：{lab.unit}</p><p>紧急电话：0717-639 ····</p></div><div className="fake-qr"><QrCode size={78} strokeWidth={1} /><small>扫码查看动态档案</small></div></div>
        </div>
        <Button className="primary-button" onClick={() => toast.success("信息牌打印任务已生成")}>打印 / 导出信息牌</Button>
      </DialogContent>
    </Dialog>
  );
}

export default function Home() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [plateOpen, setPlateOpen] = useState(false);

  const selectLab = (lab: Lab) => { setSelectedLab(lab); setSheetOpen(true); };

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="app-sidebar">
        <SidebarHeader className="brand-block">
          <div className="brand-mark"><ShieldCheck size={22} /></div>
          <div className="brand-copy"><strong>LAB SAFE</strong><span>高校实验室安全管理</span></div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>安全治理</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.slice(0, 3).map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton tooltip={item.label} isActive={view === item.key} onClick={() => setView(item.key)}>
                      <item.icon /><span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>运行中心</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.slice(3).map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton tooltip={item.label} isActive={view === item.key} onClick={() => setView(item.key)}><item.icon /><span>{item.label}</span></SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="sidebar-user"><span>安</span><div><strong>安全主管部门</strong><small>系统管理员</small></div></div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="app-main">
        <header className="topbar">
          <div className="topbar-left"><SidebarTrigger /><div><span>三峡大学 · 实验室安全治理平台</span><strong>{nav.find((item) => item.key === view)?.label}</strong></div></div>
          <div className="topbar-actions">
            <button className="global-search" onClick={() => { setView("labs"); toast.info("可在实验室台账中搜索房间、人员和单位"); }}><Search size={16} /><span>搜索实验室 / 设备 / 人员</span><kbd>⌘ K</kbd></button>
            <button className="icon-button" aria-label="通知" onClick={() => toast.warning("3项安全事项需要处理")}><Bell size={18} /><i>3</i></button>
            <Button variant="outline" className="date-button">2026年08月26日</Button>
          </div>
        </header>
        <div className="content-shell">
          {view === "dashboard" ? <Dashboard onSelectLab={selectLab} onNavigate={setView} /> : null}
          {view === "labs" ? <LabLedger onSelectLab={selectLab} /> : null}
          {view === "assessment" ? <Assessment /> : null}
          {["inspections", "access", "equipment", "emergency", "rules"].includes(view) ? <OperationsPage view={view as OperationsView} /> : null}
        </div>
      </SidebarInset>

      <LabDetail lab={selectedLab} open={sheetOpen} onOpenChange={setSheetOpen} onPlate={() => { setSheetOpen(false); setPlateOpen(true); }} />
      <InfoPlate lab={selectedLab} open={plateOpen} onOpenChange={setPlateOpen} />
      <Toaster position="top-right" richColors />
    </SidebarProvider>
  );
}
