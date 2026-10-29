// 导航栏。两个状态：手机端菜单开没开、页面滚过没有（滚过加阴影）。

import { useEffect, useState } from 'react'
import { navLinks, profile } from '../data/site'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false) // 手机上折叠菜单展开了吗
  const [scrolled, setScrolled] = useState(false) // 页面往下滚过 8px 了吗（滚过就加阴影）

  // 滚动监听要在挂载时挂、卸载时撤，所以放 useEffect。
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)

    onScroll() // 先按当前位置算一次：刷新页面时浏览器可能保留了滚动位置
    window.addEventListener('scroll', onScroll, { passive: true })

    // 少了清理，每次重新挂载都会多挂一个监听器（开发期 StrictMode 会挂两遍，暴露这类问题）。
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={scrolled ? 'nav scrolled' : 'nav'}>
      <div className="nav-inner">
        <a className="nav-brand" href="#top">
          {profile.shortName} <span className="nav-brand-en">/ {profile.name}</span>
        </a>

        {/* 手机端的三条横线。桌面端被 CSS 隐藏（.nav-toggle 默认 display: none） */}
        <button
          className="nav-toggle"
          aria-label="菜单"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={menuOpen ? 'nav-links open' : 'nav-links'}>
          {/* key 用 href 而不是下标：以后在中间插一项也不会错位 */}
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={link.cta ? 'nav-cta' : undefined}
                onClick={() => setMenuOpen(false)} // 点了任何一项就收起菜单
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
