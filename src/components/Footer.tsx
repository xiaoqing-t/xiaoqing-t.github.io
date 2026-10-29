// 页脚。年份直接算出来 —— 它不会在页面开着的时候变，所以不需要 useState。

import { profile } from '../data/site'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <p>
          © {year} {profile.name} · 用 React + TypeScript 构建
        </p>
      </div>
    </footer>
  )
}
