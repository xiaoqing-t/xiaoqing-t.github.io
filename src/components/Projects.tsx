// 「项目」区块：卡片的标签、标题、描述、要点、外链全部来自 projects 数组。
// 加项目只需往 site.tsx 里追加一个对象，不用动这个文件。

import Section from './Section'
import Reveal from './Reveal'
import { projects } from '../data/site'

export default function Projects() {
  return (
    <Section id="projects" num="02" title="项目" alt>
      <div className="projects-grid">
        {projects.map((project) => (
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
