/* eslint-disable @next/next/no-html-link-for-pages */

export default function NotFound() {
  return (
    <main className="not-found">
      <span>404 / NOT FOUND</span>
      <h1>这件作品，<br />暂时不在这里。</h1>
      <p>它可能已经更名、移动，或仍在整理中。</p>
      <a href="/">返回作品集 <span>↗</span></a>
    </main>
  );
}
