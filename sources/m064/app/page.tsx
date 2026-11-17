"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.replace("/index.html");
  }, []);

  return (
    <main className="redirect-shell">
      <div className="redirect-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p>正在进入资源展示平台…</p>
      <a href="/index.html">立即进入</a>
    </main>
  );
}
