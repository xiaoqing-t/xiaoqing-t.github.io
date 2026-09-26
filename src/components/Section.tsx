// 通用「章节壳」：每个区块的外层结构都一样（section > container > 标题 + 内容），
// 抽出来一次，About / Projects / Notes / Contact 四个组件复用。
//
// children 是 React 的「插槽」：谁用这个组件，写在 <Section> ... </Section> 中间的东西
// 就会作为 children 传进来，渲染在标题下面。

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

        {/* lead 是可选的：写成 {lead && ...} 表示「有才渲染」。
            React 里 false / null / undefined 都不会渲染出任何东西。 */}
        {lead && <p className="section-lead">{lead}</p>}

        {children}
      </div>
    </section>
  )
}
