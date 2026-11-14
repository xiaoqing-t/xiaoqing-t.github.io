// 作品详情弹窗：点击作品卡打开，展示背景 / 职责 / 成果。
// 无障碍：role=dialog + aria-modal，Esc 关闭、点遮罩关闭、焦点陷阱、关闭后把焦点还给触发的卡片，
// 打开时锁住背景滚动。

import { useEffect, useRef } from 'react'
import type { Project } from '../data/site'
import ProjectPreview from './ProjectPreview'

export default function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      if (!items || items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      opener?.focus()
    }
  }, [onClose])

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeRef} type="button" className="modal-close" onClick={onClose} aria-label="关闭详情">
          <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div className={`modal-preview pv-${project.preview}`}>
          <ProjectPreview kind={project.preview} />
        </div>

        <div className="modal-body">
          <p className="modal-kicker">
            {project.tag} <span className="modal-dot">·</span> {project.metric}
          </p>
          <h3 id="modal-title" className="modal-title">
            {project.title}
          </h3>
          <p className="modal-lead">{project.desc}</p>

          <section className="modal-block">
            <h4>背景</h4>
            <p>{project.background}</p>
          </section>
          <section className="modal-block">
            <h4>我做了什么</h4>
            <ul>
              {project.responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
          <section className="modal-block">
            <h4>结果</h4>
            <ul>
              {project.outcomes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </section>

          <div className="modal-links">
            {project.case && (
              <a className="btn btn-primary" href={project.case}>
                阅读完整案例 →
              </a>
            )}
            {project.links.map((l) => (
              <a key={l.href} className="btn btn-ghost" href={l.href} target="_blank" rel="noopener">
                {l.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}