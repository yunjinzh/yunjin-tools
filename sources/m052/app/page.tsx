"use client";

import { FormEvent, ReactNode, useState } from "react";
import { Platform, Role, PageKey, navItems } from "./platform";

type ToastState = { text: string; tone?: "ok" | "info" } | null;

const publicModules: Array<[string, string, string, PageKey]> = [
  ["01", "课程资源中心", "课程、课件、视频、笔记与学习进度一体管理", "courses"],
  ["02", "数字资源中心", "数据集、三维模型、算法、工具与开放服务", "resources"],
  ["03", "AI 智能助教", "通用模型与本地知识库协同，回答可追溯", "agent"],
  ["04", "考试与能力评价", "动态组卷、自动评分、错题诊断与学习推荐", "exam"],
  ["05", "孪生场景工作台", "多源数据融合、图层控制、IoT映射与空间分析", "scene"],
  ["06", "空间智能训练场", "数据标注、算法配置、训练评估与场景验证", "aiLab"],
];

const publicResources = [
  { title: "校园建筑与测绘三维数据集", type: "三维模型", format: "3D Tiles / GLB", size: "4.8 GB", scope: "教学区、宿舍区、道路与地形", tone: "cyan" },
  { title: "水库大坝精细模型数据集", type: "水利水电", format: "BIM / GLB", size: "2.6 GB", scope: "坝体、闸门、廊道与监测点", tone: "blue" },
  { title: "城市道路与建筑 OSM 样例", type: "矢量数据", format: "PBF / GPKG", size: "680 MB", scope: "道路、建筑、水系与绿地", tone: "green" },
];

export function Button({
  children,
  onClick,
  kind = "primary",
  type = "button",
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: "primary" | "secondary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return <button className={"btn btn-" + kind + " " + className} onClick={onClick} type={type} disabled={disabled}>{children}</button>;
}

export function Modal({
  title,
  eyebrow,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title} onMouseDown={onClose}>
      <div className={"modal-card " + (wide ? "modal-wide" : "")} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-head">
          <div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>
          <button className="icon-btn" aria-label="关闭" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className={"brand " + (compact ? "brand-compact" : "")}><span className="brand-mark"><i /><b /></span><div><strong>空间智训</strong><small>DIGITAL TWIN LAB</small></div></div>;
}

export default function Home() {
  const [role, setRole] = useState<Role | null>(null);
  const [page, setPage] = useState<PageKey>("dashboard");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [demoRole, setDemoRole] = useState<Role>("student");
  const [toast, setToast] = useState<ToastState>(null);

  const notify = (text: string, tone: "ok" | "info" = "ok") => {
    setToast({ text, tone });
    window.setTimeout(() => setToast(null), 2600);
  };

  const requestProtected = (target: PageKey) => {
    if (!role) {
      setAuthMode("login");
      setAuthOpen(true);
      return;
    }
    setPage(target);
  };

  const login = () => {
    setRole(demoRole);
    setAuthOpen(false);
    setPage("dashboard");
    notify(demoRole === "student" ? "已进入学生体验账号" : demoRole === "teacher" ? "已进入教师体验账号" : "已进入管理员体验账号");
  };

  if (role) {
    return (
      <>
        <Platform role={role} page={page} setPage={setPage} notify={notify} logout={() => { setRole(null); setPage("dashboard"); }} />
        {toast && <div className={"toast toast-" + toast.tone}>{toast.text}</div>}
      </>
    );
  }

  return (
    <div className="public-site">
      <header className="public-header">
        <Brand />
        <nav className="public-nav"><a href="#capability">平台能力</a><a href="#resources">资源体系</a><a href="#path">实训路径</a></nav>
        <div className="header-actions"><Button kind="ghost" onClick={() => { setAuthMode("login"); setAuthOpen(true); }}>登录</Button><Button onClick={() => { setAuthMode("register"); setAuthOpen(true); }}>申请入驻</Button></div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-grid" />
          <div className="hero-copy">
            <span className="hero-kicker"><b /> DIGITAL TWIN × SPATIAL AI</span>
            <h1>让空间数据进入<br /><em>可训练的孪生世界</em></h1>
            <p>集课程、数据、软件、三维场景、算法训练、项目实训与能力评价于一体，构建面向真实岗位任务的教学闭环。</p>
            <div className="hero-actions"><Button onClick={() => { setAuthMode("login"); setAuthOpen(true); }}>进入学习空间 <span>→</span></Button><Button kind="secondary" onClick={() => document.getElementById("capability")?.scrollIntoView({ behavior: "smooth" })}>查看平台全景</Button></div>
            <div className="hero-stats"><div><strong>126</strong><span>课程与微课</span></div><div><strong>48</strong><span>实训项目</span></div><div><strong>3.6 TB</strong><span>教学数据资源</span></div><div><strong>12</strong><span>空间智能模型</span></div></div>
          </div>
          <div className="hero-visual" aria-label="数字孪生场景示意">
            <div className="visual-top"><span>LIVE TWIN SCENE</span><b>数据在线</b></div>
            <div className="terrain terrain-a" /><div className="terrain terrain-b" /><div className="terrain terrain-c" />
            <div className="building building-a" /><div className="building building-b" /><div className="building building-c" /><div className="building building-d" />
            <div className="scan-ring ring-a" /><div className="scan-ring ring-b" />
            <div className="scene-point point-a"><i />综合教学楼<span>设备在线 96%</span></div>
            <div className="scene-point point-b"><i />空间实验中心<span>今日实训 18 项</span></div>
            <div className="visual-bottom"><div><span>对象</span><b>2,846</b></div><div><span>数据流</span><b>18.2k/s</b></div><div><span>预警</span><b className="safe">0</b></div></div>
          </div>
        </section>

        <section className="section" id="capability">
          <div className="section-heading"><div><span className="eyebrow">PLATFORM CAPABILITY</span><h2>从学习资源到项目交付</h2></div><p>访客可以了解平台框架；进入课程、资源、智能问答与实训环节时，系统将引导注册并等待审核。</p></div>
          <div className="capability-grid">{publicModules.map((item) => <button className="capability-card" key={item[0]} onClick={() => requestProtected(item[3])}><span>{item[0]}</span><h3>{item[1]}</h3><p>{item[2]}</p><b>查看详情 →</b></button>)}</div>
        </section>

        <section className="section resource-showcase" id="resources">
          <div className="section-heading"><div><span className="eyebrow">RESOURCE MATRIX</span><h2>专业资源，不止于下载</h2></div><p>每一项资源都关联课程、实训任务、知识点和成果要求，帮助学习者理解资源在项目中的真实位置。</p></div>
          <div className="showcase-row">{publicResources.map((resource) => <article className="public-resource" key={resource.title}><div className={"resource-art art-" + resource.tone}><span>{resource.type}</span><i /></div><div className="public-resource-body"><small>{resource.format} · {resource.size}</small><h3>{resource.title}</h3><p>{resource.scope}</p><button onClick={() => requestProtected("resources")}>登录后查看详情 →</button></div></article>)}</div>
        </section>

        <section className="section path-section" id="path">
          <div className="section-heading"><div><span className="eyebrow">LEARNING PATH</span><h2>一条可被评价的实训路径</h2></div><Button onClick={() => { setAuthMode("register"); setAuthOpen(true); }}>申请加入平台</Button></div>
          <div className="path-line">{["基础认知", "数据治理", "场景搭建", "算法训练", "项目交付", "能力认证"].map((item, index) => <div key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span>{index < 5 && <i>→</i>}</div>)}</div>
        </section>
      </main>

      <footer><Brand /><p>面向数字孪生、GIS、遥感、智能建造、水利水电与智慧城市相关专业。</p><span>教学原型 · 2026</span></footer>
      {authOpen && <AuthModal mode={authMode} setMode={setAuthMode} demoRole={demoRole} setDemoRole={setDemoRole} login={login} close={() => setAuthOpen(false)} notify={notify} />}
      {toast && <div className={"toast toast-" + toast.tone}>{toast.text}</div>}
    </div>
  );
}

function AuthModal({
  mode,
  setMode,
  demoRole,
  setDemoRole,
  login,
  close,
  notify,
}: {
  mode: "login" | "register";
  setMode: (mode: "login" | "register") => void;
  demoRole: Role;
  setDemoRole: (role: Role) => void;
  login: () => void;
  close: () => void;
  notify: (text: string, tone?: "ok" | "info") => void;
}) {
  const register = (event: FormEvent) => {
    event.preventDefault();
    notify("注册申请已提交，审核结果将通过短信和邮件通知");
    close();
  };
  return (
    <Modal title={mode === "login" ? "欢迎回到学习空间" : "申请加入实训平台"} eyebrow={mode === "login" ? "MEMBER SIGN IN" : "ACCOUNT APPLICATION"} onClose={close}>
      <div className="auth-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>账号登录</button><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>注册申请</button></div>
      {mode === "login" ? (
        <div className="auth-form">
          <label>账号<input defaultValue="demo_student" /></label>
          <label>密码<div className="password-field"><input type="password" defaultValue="12345678" /><button onClick={() => notify("密码显示功能已响应", "info")}>显示</button></div></label>
          <div className="role-picker"><span>选择原型体验角色</span><div>{(["student", "teacher", "admin"] as Role[]).map((item) => <button className={demoRole === item ? "active" : ""} key={item} onClick={() => setDemoRole(item)}>{item === "student" ? "学生" : item === "teacher" ? "教师" : "管理员"}</button>)}</div></div>
          <Button onClick={login} className="full-btn">进入平台</Button>
          <p className="auth-note">原型阶段可直接选择角色进入；正式系统中仅审核通过的账号可访问受保护资源。</p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={register}>
          <div className="field-row"><label>姓名<input required placeholder="请输入真实姓名" /></label><label>身份<select defaultValue="student"><option value="student">学生</option><option value="teacher">教师</option><option value="enterprise">企业导师</option></select></label></div>
          <label>所属学校 / 单位<input required placeholder="例如：三峡大学" /></label>
          <div className="field-row"><label>手机号<input required placeholder="用于接收审核结果" /></label><label>班级邀请码<input placeholder="选填" /></label></div>
          <label className="agree"><input type="checkbox" required /> 我已阅读并同意平台资源使用与数据保护规则</label>
          <Button type="submit" className="full-btn">提交审核申请</Button>
        </form>
      )}
    </Modal>
  );
}
