"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlarmClock,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  Flame,
  GraduationCap,
  HardHat,
  History,
  ImageIcon,
  KeyRound,
  MapPinned,
  Microscope,
  MonitorCheck,
  Radio,
  RefreshCw,
  Rotate3D,
  Search,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sparkles,
  Upload,
  UserRoundCheck,
  Users,
  Video,
  Wifi,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  categoryRules,
  clauseMappings,
  equipment,
  managementRules,
  type RiskLevel,
} from "./lab-data";

export type OperationsView = "inspections" | "access" | "equipment" | "emergency" | "rules";

const levelColors: Record<RiskLevel, string> = {
  I: "#c63b32",
  II: "#d96b28",
  III: "#b48a00",
  IV: "#2368a2",
};

function Heading({
  eyebrow,
  title,
  note,
  action,
}: {
  eyebrow: string;
  title: string;
  note: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-heading operations-heading">
      <div><span>{eyebrow}</span><h2>{title}</h2><p>{note}</p></div>
      {action}
    </div>
  );
}

function TinyStat({ icon: Icon, label, value, note }: { icon: typeof ShieldCheck; label: string; value: string; note: string }) {
  return (
    <article className="ops-stat"><span><Icon size={18} /></span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></article>
  );
}

function Inspections() {
  const [issues, setIssues] = useState([
    { id: "HD-0825-01", lab: "W6102 电镜制样实验室", issue: "防护门联锁装置异常", level: "重大", state: "整改中", owner: "赵奇", deadline: "08-27" },
    { id: "HD-0824-03", lab: "W6107 色谱质谱实验室", issue: "危废暂存标签信息缺项", level: "较大", state: "待复核", owner: "刘畅", deadline: "08-28" },
    { id: "HD-0819-06", lab: "SC7104 冷冻电镜实验室", issue: "低温防护手套超期", level: "一般", state: "已闭环", owner: "陈哲", deadline: "08-23" },
  ]);

  function advance(id: string) {
    setIssues((current) => current.map((item) => item.id === id ? { ...item, state: item.state === "整改中" ? "待复核" : "已闭环" } : item));
    toast.success("整改证据和处置记录已归档");
  }

  return (
    <div className="view-stack">
      <Heading eyebrow="INSPECTION & RECTIFICATION" title="检查与隐患闭环" note="由风险等级自动生成学校、主管部门、二级单位和实验室四级检查计划；重大隐患未闭环前锁定实验活动。" action={<Button className="primary-button" onClick={() => toast.success("已创建移动检查任务")}>+ 发起检查</Button>} />
      <section className="ops-stat-grid">
        <TinyStat icon={ClipboardCheck} label="本月计划" value="36 / 42" note="完成率85.7%" />
        <TinyStat icon={ShieldAlert} label="重大隐患" value="1 项" note="已自动限制运行" />
        <TinyStat icon={Wrench} label="整改中" value="2 项" note="均已落实责任人" />
        <TinyStat icon={CheckCircle2} label="按期闭环" value="94.2%" note="较上月提升2.6%" />
      </section>

      <section className="ops-two-column">
        <article className="panel frequency-panel">
          <Heading eyebrow="FREQUENCY ENGINE" title="分级检查频次引擎" note="系统按附件4自动排程，并在逾期前向对应责任层级提醒。" />
          <div className="frequency-matrix">
            {managementRules.map((rule) => (
              <div key={rule.level}>
                <span className="freq-level" style={{ background: levelColors[rule.level] }}>{rule.level}</span>
                <div><strong>{rule.name}实验室</strong><p>{rule.school}</p><p>{rule.unit}</p></div>
                <span className="schedule-status">已排程</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel mobile-check-panel">
          <Heading eyebrow="MOBILE CHECK" title="移动检查样例" note="扫码进房、逐项核查、现场取证、电子签名。" />
          <div className="mobile-check-card">
            <header><span>SC7105</span><strong>Ⅰ级月度检查</strong><small>7 / 9</small></header>
            {["安全信息牌与责任人一致", "射线装置联锁状态正常", "个人剂量计佩戴合规", "应急物资在有效期内"].map((item, index) => (
              <button key={item} onClick={() => toast.success(`检查项“${item}”已记录`)}><i className={index < 3 ? "checked" : ""}>{index < 3 ? "✓" : ""}</i><span>{item}</span></button>
            ))}
            <Button className="primary-button" onClick={() => toast.success("检查记录已保存，2项待补充")}>保存检查记录</Button>
          </div>
        </article>
      </section>

      <section className="panel ops-table-panel">
        <Heading eyebrow="ISSUE LEDGER" title="隐患整改台账" note="发现—派单—整改—复核—销号全程保留时间、人员、附件和意见。" action={<Button variant="outline" onClick={() => toast.info("已导出隐患闭环证据包")}>导出证据包</Button>} />
        <div className="table-wrap">
          <Table>
            <TableHeader><TableRow><TableHead>隐患编号</TableHead><TableHead>实验室</TableHead><TableHead>问题描述</TableHead><TableHead>级别</TableHead><TableHead>责任人</TableHead><TableHead>期限</TableHead><TableHead>状态</TableHead><TableHead className="text-right">处置</TableHead></TableRow></TableHeader>
            <TableBody>{issues.map((item) => <TableRow key={item.id}><TableCell>{item.id}</TableCell><TableCell>{item.lab}</TableCell><TableCell>{item.issue}</TableCell><TableCell><Badge variant="outline">{item.level}</Badge></TableCell><TableCell>{item.owner}</TableCell><TableCell>{item.deadline}</TableCell><TableCell><span className={`workflow-state state-${item.state}`}>{item.state}</span></TableCell><TableCell className="text-right">{item.state === "已闭环" ? <Button size="sm" variant="ghost" onClick={() => toast.info("已打开完整闭环记录")}>查看记录</Button> : <Button size="sm" variant="outline" onClick={() => advance(item.id)}>{item.state === "整改中" ? "提交整改" : "复核销号"}</Button>}</TableCell></TableRow>)}</TableBody>
          </Table>
        </div>
        <div className="stop-work"><ShieldAlert size={18} /><div><strong>重大隐患停用规则已生效</strong><span>W6102在复核销号前，门禁准入、设备预约和实验活动申请均保持禁用。</span></div><Button variant="outline" onClick={() => toast.warning("需学校安全主管部门复核后方可解除")}>查看锁定范围</Button></div>
      </section>
    </div>
  );
}

const people = [
  { name: "张雨", unit: "材料与化工学院", lab: "W6107", level: "II", hours: 16, done: 16, exam: 92, access: "已准入" },
  { name: "李衡", unit: "分析测试中心", lab: "SC7105", level: "I", hours: 24, done: 21, exam: 88, access: "待补训" },
  { name: "宋佳", unit: "生物与制药学院", lab: "SC7301", level: "II", hours: 16, done: 16, exam: 95, access: "已准入" },
  { name: "周云", unit: "艺术学院", lab: "A302", level: "IV", hours: 4, done: 4, exam: 86, access: "已准入" },
  { name: "陈诺", unit: "材料与化工学院", lab: "W6102", level: "III", hours: 8, done: 8, exam: 79, access: "实验室受限" },
];

function AccessTraining() {
  const [query, setQuery] = useState("");
  const filtered = people.filter((person) => `${person.name}${person.unit}${person.lab}`.includes(query));
  return (
    <div className="view-stack">
      <Heading eyebrow="TRAINING & ACCESS" title="培训、演练与人员准入" note="人员要求随实验室等级自动变化；培训学时、考试、专项能力、应急演练和授权期限共同决定门禁与设备使用权限。" action={<Button className="primary-button" onClick={() => toast.success("培训任务已按实验室等级批量下发")}>批量下发培训</Button>} />
      <section className="training-levels">
        {managementRules.map((rule) => (
          <article key={rule.level} style={{ borderTopColor: levelColors[rule.level] }}>
            <header><strong style={{ color: levelColors[rule.level] }}>{rule.level}</strong><div><span>{rule.name}</span><small>{rule.color}级</small></div></header>
            <p>{rule.entry}</p><p>{rule.drill}</p>
            <div><span>准入课程</span><strong>{rule.level === "I" ? "8门" : rule.level === "II" ? "6门" : rule.level === "III" ? "4门" : "2门"}</strong></div>
          </article>
        ))}
      </section>

      <section className="ops-two-column ops-two-column--training">
        <article className="panel training-progress-panel">
          <Heading eyebrow="COMPLIANCE" title="年度培训达标" note="按人员、实验室与危险源三个维度核验。" />
          <div className="compliance-ring"><div><strong>86%</strong><span>全校达标率</span></div></div>
          <div className="compliance-list">
            <div><span>准入培训</span><strong>92%</strong><Progress value={92} /></div>
            <div><span>年度复训</span><strong>84%</strong><Progress value={84} /></div>
            <div><span>应急演练</span><strong>78%</strong><Progress value={78} /></div>
          </div>
        </article>
        <article className="panel access-logic">
          <Heading eyebrow="ACCESS LOGIC" title="准入判定链" note="任何一项失效都触发降权或停用。" />
          <div className="logic-flow">
            {[{ icon: BookOpenCheck, title: "课程", note: "学时达标" }, { icon: FileCheck2, title: "考试", note: "成绩合格" }, { icon: HardHat, title: "专项", note: "危险源能力" }, { icon: KeyRound, title: "授权", note: "门禁/设备" }].map((item, index) => <div key={item.title}><span><item.icon size={19} /></span><strong>{item.title}</strong><small>{item.note}</small>{index < 3 ? <ArrowRight size={15} /> : null}</div>)}
          </div>
          <div className="access-alert"><AlertTriangle size={17} /><span>Ⅰ/Ⅱ级实验室人员授权到期前30天自动提醒；重大隐患期间房间级授权全部暂停。</span></div>
        </article>
      </section>

      <section className="panel ops-table-panel">
        <Heading eyebrow="PERSONNEL LEDGER" title="人员准入台账" note="原型展示培训、考试与授权联动。" />
        <label className="inline-search"><Search size={16} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索姓名、单位或房间" /></label>
        <div className="table-wrap"><Table><TableHeader><TableRow><TableHead>人员</TableHead><TableHead>单位 / 房间</TableHead><TableHead>目标学时</TableHead><TableHead>完成进度</TableHead><TableHead>考试</TableHead><TableHead>准入状态</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader><TableBody>{filtered.map((person) => <TableRow key={person.name}><TableCell><strong>{person.name}</strong></TableCell><TableCell>{person.unit}<small className="table-sub">{person.lab} · {person.level}级</small></TableCell><TableCell>{person.hours}学时</TableCell><TableCell><div className="person-progress"><Progress value={(person.done / person.hours) * 100} /><span>{person.done}/{person.hours}</span></div></TableCell><TableCell>{person.exam}</TableCell><TableCell><span className={`access-state access-${person.access}`}>{person.access}</span></TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => toast.info(`已打开${person.name}的准入档案`)}>准入档案</Button></TableCell></TableRow>)}</TableBody></Table></div>
      </section>
    </div>
  );
}

type EquipmentRow = typeof equipment[number];

function EquipmentCenter() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<EquipmentRow | null>(null);
  const [rotation, setRotation] = useState(0);
  const categories = Array.from(new Set(equipment.map((item) => item[0])));
  const filtered = useMemo(() => equipment.filter((item) => `${item[2]}${item[3]}${item[4]}`.toLowerCase().includes(query.toLowerCase()) && (category === "all" || item[0] === category)), [query, category]);
  const counts = categories.map((name) => ({ name, count: equipment.filter((item) => item[0] === name).length }));

  return (
    <div className="view-stack">
      <Heading eyebrow="ASSET DIGITAL TWIN" title="重点仪器设备与监测" note="将附件中的44台50万元以上仪器关联到房间、责任人、运行参数、维保记录和风险点位；模型资产支持检索、拖拽摆放与搬迁预演。" action={<Button className="primary-button" onClick={() => toast.success("设备位置同步任务已创建")}>同步设备位置</Button>} />
      <section className="equipment-hero">
        <div className="equipment-image" style={{ "--rotate": `${rotation}deg` } as React.CSSProperties}>
          <img src="/lab-equipment-twin.png" alt="附件中提供的实验仪器数字孪生效果示意图" />
          <button className="image-hotspot hotspot-one" onClick={() => toast.info("运行状态：待机；设备温度：23.8℃")}>1</button>
          <button className="image-hotspot hotspot-two" onClick={() => toast.info("关联资产：场发射扫描电镜；房间：W6105")}>2</button>
          <div className="image-caption"><ImageIcon size={15} /><span>设备数字孪生效果示意 · 来源于用户附件</span></div>
        </div>
        <div className="equipment-hero-copy">
          <span>L4 MODEL ASSET</span><h3>一台设备，一份动态安全档案</h3><p>设备三维模型、机械图纸、实物照片、运行手册、部件结构和运行参数统一挂接。可动构件可配置旋转轴与位移范围，用于运行机理演示和维护培训。</p>
          <div className="model-controls"><Button variant="outline" onClick={() => setRotation((value) => value + 2)}><Rotate3D size={16} />旋转视角</Button><Button variant="outline" onClick={() => toast.info("已显示温度、转速和设备告警图层")}><Activity size={16} />运行参数</Button></div>
          <div className="model-stats"><div><span>重点设备</span><strong>44</strong></div><div><span>所在房间</span><strong>25</strong></div><div><span>测试类别</span><strong>6</strong></div></div>
        </div>
      </section>

      <section className="equipment-category-grid">
        {counts.map((item, index) => <button key={item.name} onClick={() => setCategory(item.name)} className={category === item.name ? "active" : ""}><span>0{index + 1}</span><strong>{item.name}</strong><small>{item.count} 台设备</small></button>)}
      </section>

      <section className="panel ops-table-panel">
        <Heading eyebrow="ASSET LEDGER" title="50万元以上重点仪器清单" note="设备名称、品牌型号与安装地点来自附件清单；价格分类沿用附件原值。" />
        <div className="equipment-filters"><label className="inline-search"><Search size={16} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索设备、型号或房间" /></label><Select value={category} onValueChange={setCategory}><SelectTrigger className="filter-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">全部测试类别</SelectItem>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Button variant="outline" onClick={() => { setQuery(""); setCategory("all"); }}><RefreshCw size={15} />清除筛选</Button></div>
        <div className="table-wrap equipment-table"><Table><TableHeader><TableRow><TableHead>序号</TableHead><TableHead>测试项目</TableHead><TableHead>设备名称</TableHead><TableHead>品牌 / 型号</TableHead><TableHead>安装地点</TableHead><TableHead>价格分类</TableHead><TableHead className="text-right">数字资产</TableHead></TableRow></TableHeader><TableBody>{filtered.map((item) => <TableRow key={item[1]}><TableCell>{item[1]}</TableCell><TableCell><Badge variant="outline">{item[0]}</Badge></TableCell><TableCell><strong>{item[2]}</strong></TableCell><TableCell>{item[3]}</TableCell><TableCell><span className="room-code"><MapPinned size={12} />{item[4]}</span></TableCell><TableCell>{item[5] || "—"}</TableCell><TableCell className="text-right"><Button size="sm" variant="ghost" onClick={() => setSelected(item)}><Boxes size={14} />查看资产</Button></TableCell></TableRow>)}</TableBody></Table></div>
      </section>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="device-dialog sm:max-w-2xl"><DialogHeader><DialogTitle>{selected?.[2]}</DialogTitle><DialogDescription>{selected?.[3]} · 安装于{selected?.[4]}</DialogDescription></DialogHeader>{selected ? <div className="device-detail"><div className="device-model-card"><Microscope size={64} /><span>L4 设备资产</span><small>可拆分构件 / 可绑定参数 / 可拖拽摆放</small></div><div className="device-data"><div><span>设备编号</span><strong>CTGU-EQ-{selected[1].padStart(3, "0")}</strong></div><div><span>测试类别</span><strong>{selected[0]}</strong></div><div><span>在线状态</span><strong className="online"><Wifi size={13} />监测在线</strong></div><div><span>关联安全档案</span><strong>{selected[4]} 房间档案</strong></div><Button className="primary-button" onClick={() => toast.success("设备已定位到楼层孪生场景")}>在场景中定位</Button></div></div> : null}</DialogContent>
      </Dialog>
    </div>
  );
}

function EmergencyCenter() {
  const [alarm, setAlarm] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const steps = ["监测告警", "人员确认", "预案匹配", "任务派发", "现场处置", "复盘归档"];
  function simulate() {
    setAlarm(true); setActiveStep(2); toast.warning("已触发低氧告警模拟，系统正在匹配专项预案");
  }
  return (
    <div className="view-stack">
      <Heading eyebrow="EMERGENCY RESPONSE" title="应急预案、演练与联动处置" note="针对实验室等级和重要危险源建立专项预案；监测报警自动关联房间、人员、物资、路线和处置卡。" action={<Button className={alarm ? "alarm-button" : "primary-button"} onClick={simulate}><Siren size={16} />{alarm ? "告警处置中" : "模拟应急告警"}</Button>} />
      <section className={`emergency-command ${alarm ? "is-alarm" : ""}`}>
        <div className="command-status"><span><Radio size={18} />实时指挥</span><strong>{alarm ? "SC7104 低氧告警" : "当前无未处置告警"}</strong><p>{alarm ? "氧浓度18.2% · 已联动门禁、广播和责任人" : "全校重点点位保持在线监测"}</p></div>
        <div className="command-flow">{steps.map((step, index) => <button key={step} className={index <= activeStep ? "active" : ""} onClick={() => alarm && setActiveStep(index)}><i>{index + 1}</i><span>{step}</span>{index < steps.length - 1 ? <ChevronRight size={14} /> : null}</button>)}</div>
        {alarm ? <div className="alarm-actions"><Button onClick={() => toast.success("已通知实验室负责人、二级单位与主管部门")}>一键通知责任链</Button><Button variant="outline" onClick={() => { setAlarm(false); setActiveStep(0); toast.success("模拟告警已解除并归档"); }}>解除并归档</Button></div> : null}
      </section>

      <section className="ops-three-column">
        {[{ icon: Flame, title: "化学品泄漏专项预案", tag: "I/II级", note: "现场隔离、气体监测、吸附处置、危废转运", owner: "材料与化工学院" }, { icon: Activity, title: "生物暴露专项预案", tag: "BSL-2", note: "暴露报告、医学评估、区域消杀、样本追溯", owner: "生物与制药学院" }, { icon: ShieldAlert, title: "辐射异常专项预案", tag: "Ⅰ级", note: "装置停机、区域封控、剂量核验、专业处置", owner: "分析测试中心" }].map((item) => <article className="panel emergency-plan" key={item.title}><header><span><item.icon size={20} /></span><Badge variant="outline">{item.tag}</Badge></header><h3>{item.title}</h3><p>{item.note}</p><div><Building2 size={14} />{item.owner}</div><Button variant="outline" onClick={() => toast.info(`已打开“${item.title}”处置卡`)}>查看处置卡 <ChevronRight size={14} /></Button></article>)}
      </section>

      <section className="ops-two-column">
        <article className="panel drill-panel"><Heading eyebrow="DRILL PLAN" title="年度应急演练计划" note="Ⅰ级每年不少于2次，其他等级每年不少于1次。" /><div className="drill-list">{[{ date: "09.12", title: "危险化学品泄漏演练", level: "I", state: "待开展" }, { date: "10.18", title: "生物安全暴露演练", level: "II", state: "待开展" }, { date: "06.20", title: "实验室火灾疏散演练", level: "III/IV", state: "已完成" }].map((item) => <button key={item.title} onClick={() => toast.info(`演练：${item.title}`)}><time>{item.date}</time><div><strong>{item.title}</strong><small>{item.level}级适用</small></div><span>{item.state}</span></button>)}</div></article>
        <article className="panel resource-panel"><Heading eyebrow="RESOURCE MAP" title="应急资源与联系人" note="按最近距离和处置能力自动推荐。" /><div className="resource-map"><div className="map-wave wave-one" /><div className="map-wave wave-two" /><span className="map-center"><Siren size={22} /></span>{[{ cls: "point-a", label: "微型消防站" }, { cls: "point-b", label: "校医院" }, { cls: "point-c", label: "危化品库" }, { cls: "point-d", label: "学院安全员" }].map((item) => <button key={item.label} className={item.cls} onClick={() => toast.info(`${item.label}：预计3分钟到场`)}><i />{item.label}</button>)}</div></article>
      </section>
    </div>
  );
}

function RuleCenter() {
  return (
    <div className="view-stack">
      <Heading eyebrow="POLICY KNOWLEDGE BASE" title="制度依据与规则配置中心" note="将《高等学校实验室安全分级分类管理办法（试行）》及附件1—4转成可执行规则、流程和检查任务，并保留学校细则扩展位。" action={<Button className="primary-button" onClick={() => toast.success("规则库已完成一致性校验")}>校验规则版本</Button>} />
      <Tabs defaultValue="clauses" className="rule-tabs">
        <TabsList><TabsTrigger value="clauses">条款—功能映射</TabsTrigger><TabsTrigger value="levels">四级管理要求</TabsTrigger><TabsTrigger value="categories">五类实验室</TabsTrigger><TabsTrigger value="responsibility">责任体系</TabsTrigger><TabsTrigger value="sources">附件来源</TabsTrigger></TabsList>
        <TabsContent value="clauses"><section className="panel ops-table-panel"><Heading eyebrow="TRACEABILITY" title="法规条款落实矩阵" note="每个系统能力均可回溯到制度依据。" /><div className="table-wrap"><Table><TableHeader><TableRow><TableHead>条款</TableHead><TableHead>制度主题</TableHead><TableHead>系统落地功能</TableHead><TableHead>状态</TableHead></TableRow></TableHeader><TableBody>{clauseMappings.map((item) => <TableRow key={item[0]}><TableCell><strong>{item[0]}</strong></TableCell><TableCell>{item[1]}</TableCell><TableCell>{item[2]}</TableCell><TableCell><span className="rule-ready"><BadgeCheck size={13} />已建模</span></TableCell></TableRow>)}</TableBody></Table></div></section></TabsContent>
        <TabsContent value="levels"><section className="level-rule-grid">{managementRules.map((rule) => <article key={rule.level} style={{ borderTopColor: levelColors[rule.level] }}><header><strong style={{ color: levelColors[rule.level] }}>{rule.level}级</strong><span>{rule.name} / {rule.color}</span></header><dl><div><dt>学校检查</dt><dd>{rule.school}</dd></div><div><dt>单位检查</dt><dd>{rule.unit}</dd></div><div><dt>培训准入</dt><dd>{rule.entry}</dd></div><div><dt>应急演练</dt><dd>{rule.drill}</dd></div><div><dt>条件保障</dt><dd>{rule.guarantee}</dd></div></dl></article>)}</section></TabsContent>
        <TabsContent value="categories"><section className="category-rule-grid">{categoryRules.map((item, index) => <article key={item.name}><span>0{index + 1}</span><div><h3>{item.name}</h3><p>{item.cue}</p><strong>主要风险</strong><small>{item.risk}</small></div></article>)}</section></TabsContent>
        <TabsContent value="responsibility"><section className="panel responsibility-panel"><Heading eyebrow="RESPONSIBILITY CHAIN" title="校—院—室—人四级责任链" note="将制度责任落实到岗位、任务、提醒与审计证据。" /><div className="responsibility-flow">{[{ icon: ShieldCheck, title: "学校领导机构", role: "全面指导、党政主要负责人第一责任" }, { icon: Building2, title: "主管职能部门", role: "制度制定、全校认定、台账与监督" }, { icon: Users, title: "二级教学科研单位", role: "审核类别等级、建立台账、备案与复核" }, { icon: UserRoundCheck, title: "实验室负责人", role: "危险源辨识、风险评价与直接责任" }].map((item, index) => <div key={item.title}><span><item.icon size={21} /></span><strong>{item.title}</strong><p>{item.role}</p>{index < 3 ? <ChevronRight size={18} /> : null}</div>)}</div><div className="audit-strip"><History size={18} /><span>所有认定、审核、备案、变更、检查、整改与授权操作写入不可抵赖的审计时间线。</span><Button variant="outline" onClick={() => toast.info("已打开责任追溯时间线")}>责任追溯</Button></div></section></TabsContent>
        <TabsContent value="sources"><section className="source-grid">{[{ title: "附件1", name: "高校实验室安全分级表", use: "直接判定Ⅰ—Ⅳ级及评分阈值" }, { title: "附件2", name: "高校实验室安全风险评价表", use: "25/10/5分危险源累计评价" }, { title: "附件3", name: "高校实验室分类参照表", use: "化学、生物、辐射、机电、其他五类" }, { title: "附件4", name: "高校实验室分级管理要求参照表", use: "检查、培训、评估和条件保障" }, { title: "学校设备清单", name: "50万元以上重点仪器设备", use: "44台设备、25个房间、6类测试项目" }].map((item) => <article className="panel" key={item.title}><FileText size={24} /><span>{item.title}</span><h3>{item.name}</h3><p>{item.use}</p><Button variant="outline" onClick={() => toast.info(`${item.name}已纳入规则库`)}>查看提取结果</Button></article>)}</section></TabsContent>
      </Tabs>
    </div>
  );
}

export function OperationsPage({ view }: { view: OperationsView }) {
  if (view === "inspections") return <Inspections />;
  if (view === "access") return <AccessTraining />;
  if (view === "equipment") return <EquipmentCenter />;
  if (view === "emergency") return <EmergencyCenter />;
  return <RuleCenter />;
}
