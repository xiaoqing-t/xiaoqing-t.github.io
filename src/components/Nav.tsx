// 导航栏。三个状态：手机端菜单开没开、页面滚过没有（滚过加阴影）、当前在哪个区块（高亮）。

import { useEffect, useRef, useState } from 'react'
import { navLinks, profile } from '../data/site'

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false) // 手机上折叠菜单展开了吗
  const [scrolled, setScrolled] = useState(false) // 页面往下滚过 8px 了吗（滚过就加阴影）
  const [activeId, setActiveId] = useState('') // 当前视口里的区块 id
  const navRef = useRef<HTMLElement>(null) // 用来判断点击是不是发生在导航外面
  const toggleRef = useRef<HTMLButtonElement>(null) // 菜单收起后把焦点还给按钮

  // 滚动监听要在挂载时挂、卸载时撤，所以放 useEffect。
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll() // 先按当前位置算一次：刷新页面时浏览器可能保留了滚动位置
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 当前区块高亮：观察各锚点区块，取落在视口中带的那一个。
  useEffect(() => {
    const ids = navLinks.filter((l) => l.href.startsWith('#')).map((l) => l.href.slice(1))
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0 || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        setActiveId(visible[0].target.id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  // 菜单展开时才需要「Esc 关闭」和「点外面关闭」，收起时直接不挂监听。
  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      toggleRef.current?.focus()
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [menuOpen])

  return (
    <nav ref={navRef} className={scrolled ? 'nav scrolled' : 'nav'}>
      <div className="nav-inner">
        <a className="nav-brand" href="#top">
          <span className="nav-name">{profile.name}</span>
          <span className="nav-tagline">— {profile.tagline}</span>
        </a>

        {/* 手机端的三条横线。桌面端被 CSS 隐藏（.nav-toggle 默认 display: none） */}
        <button
          ref={toggleRef}
          className="nav-toggle"
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul id="site-menu" className={menuOpen ? 'nav-links open' : 'nav-links'}>
          {navLinks.map((link) => {
            const active = link.href === `#${activeId}`
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={link.cta ? 'nav-cta' : undefined}
                  aria-current={active ? 'true' : undefined}
                  data-active={active ? 'true' : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                  {link.cta ? ' ↗' : ''}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
