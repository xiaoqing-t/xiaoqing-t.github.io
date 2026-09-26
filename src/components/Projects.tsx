// 「项目」区块：每张卡片的标签、标题、描述、要点、外链全部来自 projects 数组。
//
// 这是整个重构里收益最大的一处：v1 加一个项目要复制 20 多行 HTML 再手改；
// 现在只是往 site.tsx 的 projects 里追加一个对象。

import Section from './Section'
import Reveal from './Reveal'
import { projects } from '../data/site'

export default function Projects() {
  return (
    <Section id="projects" num="02" title="项目" alt>
      <div className="projects-grid">
        {projects.map((project) => (
          // 每张卡片各自淡入 → 所以这里直接用 Reveal 当卡片的外壳
          <Reveal className="project-card card" key={project.title}>
            <div className="project-tag">{project.tag}</div>
            <h3>{project.title}</h3>
            <p>{project.desc}</p>

            <ul className="project-points">
              {project.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>

            <div className="project-links">
              {project.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noopener">
                  {link.label} ↗
                </a>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
