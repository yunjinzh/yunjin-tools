import Link from "next/link";
import { ViewCounter } from "./view-counter";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-note">
        <span className="section-label">DTS / LEARNING SYSTEM</span>
        <p>依据所附 V6.0–V6.1 系列资料重构，具体操作以实际部署版本为准。</p>
      </div>
      <div className="footer-links">
        <Link href="/learn">35 节课程</Link>
        <Link href="/resources">5 份资料</Link>
      </div>
      <ViewCounter />
    </footer>
  );
}
