// 通用章节壳：每个区块都是 section > container > 标题 + 内容，
// 抽出来给 About / Projects / Notes / Contact 四个组件复用。

import type { ReactNode } from 'react'

interface SectionProps {
  /** 锚点 id，导航栏的 #about / #projects 就是跳到它上面 */
  id: string
  /** 标题前的两位编号，如 "01" */
  num: string
  title: string
  /** 标题下面那行小字（可选） */
  lead?: string
  /** 是否用浅灰底色（让相邻区块交替，视觉上分得开） */
  alt?: boolean
  children: ReactNode
}

export default function Section({ id, num, title, lead, alt, children }: SectionProps) {
  return (
    <section id={id} className={alt ? 'section section-alt' : 'section'}>
      <div className="container">
        <h2 className="section-title">
          <span className="section-num">{num}</span>
          {title}
        </h2>

        {lead && <p className="section-lead">{lead}</p>}

        {children}
      </div>
    </section>
  )
}
