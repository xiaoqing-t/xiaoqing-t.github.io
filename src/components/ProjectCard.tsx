// 一张作品卡：整张是按钮，点击打开详情弹窗。
// 预览画面铺满，底部叠项目名（衬线斜体）+ 类别 + 真实指标；hover 时露出「查看 →」。

import type { Project } from '../data/site'
import ProjectPreview from './ProjectPreview'

export default function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <button
      type="button"
      className={`work-card pv-${project.preview}`}
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`查看项目详情：${project.title}`}
    >
      <span className="work-preview">
        <ProjectPreview kind={project.preview} />
      </span>
      <span className="work-scrim" aria-hidden="true" />
      <span className="work-open" aria-hidden="true">
        查看 →
      </span>
      <span className="work-meta">
        <span className="work-name">{project.title}</span>
        <span className="work-foot">
          <span className="work-tag">{project.tag}</span>
          <span className="work-metric">{project.metric}</span>
        </span>
      </span>
    </button>
  )
}