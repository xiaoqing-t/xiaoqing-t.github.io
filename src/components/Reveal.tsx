// <Reveal>：把包在里面的东西做成「滚进视野才淡入」。
//
// 为什么需要它：v1 里这段逻辑写在 script.js 里，靠 querySelectorAll('.card') 事后补类名 ——
// 在 React 里那样做会跟「渲染」抢方向盘。React 的做法是：把这件事变成一个组件，
// 它自己管自己的 ref 和副作用，谁想用就包一层。
//
// 两种用法（都行）：
//   包住整块：<Reveal className="about-grid"> …多张卡… </Reveal>   → 整块一起淡入
//   包住单张：<Reveal className="card"> … </Reveal>                → 每张各自淡入
// 注意它渲染出来的是一个 <div>，所以要包在「能当容器的元素」外；
// 笔记列表里每项本身是 <a>，所以那边包的是整个列表。

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** 想给这个容器加的类名，如 "card"、"projects-grid" */
  className?: string
}

export default function Reveal({ children, className = '' }: RevealProps) {
  // useRef 拿到的是一根「指向真实 DOM 节点的引用」，挂载后 ref.current 就是那个 div。
  // 它跟 useState 的区别：改它不会触发重新渲染（我们也不需要重渲染，只是加个类名）。
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
