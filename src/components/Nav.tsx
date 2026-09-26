// 导航栏。全站唯一「有自己状态」的组件，正好一次练到 React 的两个核心概念：
//   useState  —— 记住「菜单开没开」「页面滚了没有」，变了就重新渲染
//   useEffect —— 往 window 上挂一个滚动监听，并在卸载时撤掉

import { useEffect, useState } from 'react'
import { navLinks, profile } from '../data/site'

export default function Nav() {
  // useState 返回 [当前值, 改它的函数]。这里的初值都是 false。
  const [menuOpen, setMenuOpen] = useState(false) // 手机上折叠菜单展开了吗
  const [scrolled, setScrolled] = useState(false) // 页面往下滚过 8px 了吗（滚过就加阴影）

  // useEffect = 「渲染之外要做的事」。滚动监听不属于「算出界面长什么样」，所以放这里。
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)

    onScroll() // 先按当前位置算一次：刷新页面时浏览器可能保留了滚动位置
    window.addEventListener('scroll', onScroll, { passive: true })

    // 返回的函数是「清理函数」：组件卸载（或依赖变化）时自动执行。
    // 少了它，每次重新挂载都会多挂一个监听器 —— StrictMode 在开发期会故意挂两遍，
    // 正是为了让这种「忘了清理」的问题立刻暴露出来。
    return () => window.removeEventListener('scroll', onScroll)
  }, []) // 空数组 = 不依赖任何会变的值，只在挂载时跑一次

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
          {/* key 是 React 用来「认条目」的身份证：列表增删时靠它知道谁是谁。
              用 href 当 key 比用下标稳 —— 以后在中间插一项，也不会让整列错位。 */}
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
