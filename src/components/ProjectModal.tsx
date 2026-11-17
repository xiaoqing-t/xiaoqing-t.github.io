// 作品详情弹窗：点击作品卡打开，展示背景 / 职责 / 成果。
// 用原生 <dialog>：焦点限制、Esc、背景 inert 和关闭后的焦点归还都由浏览器处理。

import { useEffect, useRef } from 'react'
import type { Project } from '../data/site'
import ProjectPreview from './ProjectPreview'

export default function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.setAttribute('closedby', 'any')
    if (!dialog.open) dialog.showModal()

    const restoreFocus = () => {
      if (opener?.isConnected) opener.focus()
    }

    // closedby 在 Safari 还不支持，用指针坐标补一个点外关闭
    if ('closedBy' in HTMLDialogElement.prototype) return restoreFocus

    let pressedOutside = false
    const outside = (event: PointerEvent) => {
      const rect = dialog.getBoundingClientRect()
      return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
    }
    const onPointerDown = (event: PointerEvent) => {
      pressedOutside = outside(event)
    }
    const onPointerUp = (event: PointerEvent) => {
      if (pressedOutside && outside(event)) dialog.close()
    }

    dialog.addEventListener('pointerdown', onPointerDown)
    dialog.addEventListener('pointerup', onPointerUp)
    return () => {
      dialog.removeEventListener('pointerdown', onPointerDown)
      dialog.removeEventListener('pointerup', onPointerUp)
      restoreFocus()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="project-dialog"
      aria-labelledby="modal-title"
      onClose={onClose}
    >
      <button type="button" className="modal-close" onClick={onClose} aria-label="关闭详情" autoFocus>
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
    </dialog>
  )
}
