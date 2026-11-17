import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="DTS 学习门户首页">
        <span className="brand-mark">DTS</span>
        <span className="brand-copy">
          DIGITAL TWIN
          <br />
          ACADEMY
        </span>
      </Link>

      <nav className="main-nav" aria-label="主导航">
        <Link href="/learn">学习路径</Link>
        <Link href="/resources">资料索引</Link>
        <a href="/learn/digital-twin-not-a-dashboard">第一课</a>
      </nav>

      <div className="header-index" aria-hidden="true">
        01—35
      </div>
    </header>
  );
}
