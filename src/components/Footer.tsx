// 页脚。年份直接算出来 —— 它不会在页面开着的时候变，所以不需要 useState。

import { profile } from '../data/site'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p className="footer-brand">
          <span className="footer-name">{profile.name}</span>
          <span className="footer-note">© {year} · 用 React + TypeScript 构建</span>
        </p>
        <nav className="footer-links" aria-label="页脚导航">
          <a href="#contact">联系</a>
          <a href={profile.github} target="_blank" rel="noopener">
            GitHub ↗
          </a>
          <a href="/feed.xml">RSS</a>
          <a href="#top">回到顶部 ↑</a>
        </nav>
      </div>
    </footer>
  )
}
