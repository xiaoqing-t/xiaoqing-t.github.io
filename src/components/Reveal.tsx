// <Reveal>：滚进视野才淡入。
//
// 包住整块就整块一起淡入，包住单张就每张各自淡入。
// 它渲染出来是 <div>，所以不能直接包 <a> 这类元素——笔记列表包的是整个列表。

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** 想给这个容器加的类名，如 "card"、"projects-grid" */
  className?: string
}

export default function Reveal({ children, className = '' }: RevealProps) {
  // 只是加个类名，不需要重新渲染，所以用 ref 而不是 state。
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // 兜底：万一浏览器不支持 IntersectionObserver，就直接显示，别把内容藏死
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('in-view')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('in-view')
          // 淡入一次就够了，之后不再观察它（否则滚动时会反复触发）
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.12 }, // 露出 12% 就算「进视野」
    )

    observer.observe(el)

    // 清理：组件卸载时断开观察器，避免它继续持有已经消失的节点
    return () => observer.disconnect()
  }, [])

  const cls = `${className} reveal`.trim()
  return (
    <div ref={ref} className={cls}>
      {children}
    </div>
  )
}
