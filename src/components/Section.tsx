// 通用章节壳：每个区块都是 section > container > 标题 + 内容，
// 抽出来给 About / Projects / Notes / Contact 四个组件复用。

import type { ReactNode } from 'react'

interface SectionProps {
  /** 锚点 id，导航栏的 #work / #notes 就是跳到它上面 */
  id: string
  /** 标题前的两位编号，如 "01" */
  num: string
  title: string
  /** 标题后的英文小标签（等宽），如 "SELECTED WORK" */
  en?: string
  /** 标题行最右侧的元信息，如年份区间 "2025 — 2026" */
  meta?: string
  /** 标题下面那行小字（可选） */
  lead?: string
  children: ReactNode
}

export default function Section({ id, num, title, en, meta, lead, children }: SectionProps) {
  return (
    <section id={id} className="section">
      <div className="container">
        <header className="section-head">
          <h2 className="section-title">
            <span className="section-num">{num}</span>
            <span className="section-zh">{title}</span>
            {en && <span className="section-en">{en}</span>}
          </h2>
          <span className="section-rule" aria-hidden="true" />
          {meta && <span className="section-meta">{meta}</span>}
        </header>

        {lead && <p className="section-lead">{lead}</p>}

        {children}
      </div>
    </section>
  )
}
