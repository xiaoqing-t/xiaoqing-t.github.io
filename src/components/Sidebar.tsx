// 作品区右侧栏：路径时间线 / 能力标签 / 联系入口。
// 联系里邮箱是纯文本 + 复制按钮（不做 mailto，沿用站点防爬取的选择）。

import { useState } from 'react'
import { timeline, capabilities, contact, profile } from '../data/site'

export default function Sidebar() {
  const [copied, setCopied] = useState(false)

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // 剪贴板不可用（无权限/非安全上下文）时静默失败：邮箱仍可直接选中复制
    }
  }

  return (
    <aside className="work-side">
      <section className="side-block" aria-labelledby="side-path">
        <h3 className="side-head" id="side-path">
          <span className="side-num">02</span> 路径 <span className="side-en">PATH</span>
        </h3>
        <ol className="timeline">
          {timeline.map((t) => (
            <li key={t.title} className={t.current ? 'tl-item current' : 'tl-item'}>
              <span className="tl-dot" aria-hidden="true" />
              <span className="tl-period">{t.period}</span>
              <span className="tl-title">{t.title}</span>
              <span className="tl-role">{t.role}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="side-block" aria-labelledby="side-cap">
        <h3 className="side-head" id="side-cap">
          <span className="side-num">03</span> 能力 <span className="side-en">CAPABILITIES</span>
        </h3>
        <ul className="caps">
          {capabilities.map((c) => (
            <li key={c.label} className={c.core ? 'cap core' : 'cap'}>
              {c.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="side-block" id="contact" aria-labelledby="side-hello">
        <h3 className="side-head" id="side-hello">
          <span className="side-num">04</span> 联系 <span className="side-en">SAY HELLO</span>
        </h3>
        <p className="side-lead">{contact.lead}</p>
        <div className="hello-email">
          <span className="email-text">{profile.email}</span>
          <button type="button" className="copy-btn" onClick={copyEmail} aria-label="复制邮箱地址">
            {copied ? '已复制' : '复制'}
          </button>
        </div>
        <div className="hello-links">
          {contact.links.map((l) => (
            <a
              key={l.href}
              className="btn btn-ghost"
              href={l.href}
              {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}
            >
              {l.label}
            </a>
          ))}
        </div>
        <p className="hello-status">
          <span className="status-dot" aria-hidden="true" />
          {contact.status}
        </p>
      </section>
    </aside>
  )
}