import type { Metadata } from "next";
import { CurriculumClient } from "../components/curriculum-client";
import { modules } from "../course-data";

export const metadata: Metadata = {
  title: "学习路径｜DTS 数字孪生学习门户",
  description: "从认知基座、数据生产、场景搭建、云端发布到 SDK 二次开发的 35 节系统课程。",
};

export default function LearnPage() {
  return (
    <main className="learn-page">
      <section className="learn-hero">
        <div>
          <span className="section-label">FULL CURRICULUM / 35 LESSONS</span>
          <h1><span>从入门</span><strong>到精通</strong></h1>
        </div>
        <div className="learn-hero-note">
          <span>HOW TO USE</span>
          <p>主线建议按 01 → 06 顺序学习。已有项目经验的学习者，可直接搜索“坐标系”“倾斜摄影”“Cloud”或“SDK”。</p>
          <small>每节课完成后点击“学会了”，进度保存在当前设备。</small>
        </div>
      </section>

      <div className="section-shell curriculum-shell">
        <CurriculumClient modules={modules} />
      </div>
    </main>
  );
}
