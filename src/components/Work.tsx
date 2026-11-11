// 「精选作品」区：左侧两列作品卡，右侧路径/能力/联系栏。
// 弹窗状态在这里管理：点哪张卡就把哪个项目设为 active，关闭时置空。

import { useCallback, useState } from 'react'
import Section from './Section'
import Reveal from './Reveal'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import Sidebar from './Sidebar'
import { projects } from '../data/site'
import type { Project } from '../data/site'

export default function Work() {
  const [active, setActive] = useState<Project | null>(null)
  const close = useCallback(() => setActive(null), [])

  return (
    <Section id="work" num="01" title="精选作品" en="SELECTED WORK" meta="2025 — 2026">
      <div className="work-layout">
        <Reveal className="work-grid">
          {projects.map((p) => (
            <ProjectCard key={p.title} project={p} onOpen={() => setActive(p)} />
          ))}
        </Reveal>
        <Sidebar />
      </div>
      {active && <ProjectModal project={active} onClose={close} />}
    </Section>
  )
}