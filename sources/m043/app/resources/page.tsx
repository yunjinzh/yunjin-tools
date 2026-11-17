import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { sourceDocuments } from "../course-data";

export const metadata: Metadata = {
  title: "资料索引｜DTS 数字孪生学习门户",
  description: "DTS 白皮书、Engine、Explorer、Cloud 与 SDK 五份课程资料的学习映射。",
};

export default function ResourcesPage() {
  const totalPages = sourceDocuments.reduce((sum, document) => sum + document.pages, 0);
  return (
    <main className="resources-page">
      <section className="resources-hero">
        <div>
          <span className="section-label">SOURCE LIBRARY / 05 DOCUMENTS</span>
          <h1>不是<br />少读资料，<br /><strong>是按问题读。</strong></h1>
        </div>
        <div className="resource-total">
          <strong>{totalPages.toLocaleString("en-US")}</strong>
          <span>PAGE<br />SOURCE SET</span>
          <p>课程保留原资料版本与页码范围，便于在需要时回到手册深挖细节。</p>
        </div>
      </section>

      <section className="section-shell resource-list">
        {sourceDocuments.map((document, index) => (
          <article key={document.title}>
            <span className="resource-index">0{index + 1}</span>
            <FileText size={28} strokeWidth={1.4} />
            <div className="resource-name">
              <small>{document.version}</small>
              <h2>{document.title}</h2>
            </div>
            <p>{document.role}</p>
            <div className="resource-map">
              <small>课程映射</small>
              <strong>{document.mapsTo}</strong>
            </div>
            <div className="resource-pages"><b>{document.pages}</b><span>PAGES</span></div>
          </article>
        ))}
      </section>

      <section className="reading-method section-shell">
        <div>
          <span className="section-label">READING METHOD</span>
          <h2>三层阅读法</h2>
        </div>
        <ol>
          <li><span>01</span><div><strong>先走课程主线</strong><p>先建立产品链路和操作判断，不被近千页 API 或参数表淹没。</p></div></li>
          <li><span>02</span><div><strong>遇到问题回到页码</strong><p>课程页标注资料来源与页码范围，需要配置或排障时再深入原文。</p></div></li>
          <li><span>03</span><div><strong>用项目固化知识</strong><p>把每节实操放入同一个案例，最终形成可演示、可测试、可交付的闭环。</p></div></li>
        </ol>
        <Link className="button-primary" href="/learn">
          进入学习路径 <ArrowUpRight size={19} />
        </Link>
      </section>
    </main>
  );
}
