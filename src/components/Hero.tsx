// 首屏：左侧大标题（衬线，斜体棕色强调），右侧关注 / 现在 / 荣誉三块。
// 内容来自 src/data/site.tsx 的 hero 与 focus。

import { hero, focus } from '../data/site'

export default function Hero() {
  return (
    // id="top" 是给导航栏左上角姓名用的锚点
    <header className="hero" id="top">
      {/* 纯装饰的背景层，对读屏软件隐藏 */}
      <div className="hero-bg" aria-hidden="true" />

      <div className="hero-inner">
        <div className="hero-main">
          <p className="hero-eyebrow">{hero.eyebrow}</p>

          <h1 className="hero-title">
            {hero.titleLead}
            {/* 中间那段用衬线斜体 + 棕色 */}
            <em className="accent">{hero.titleAccent}</em>
            {hero.titleTail}
          </h1>

          <p className="hero-sub">
            {hero.subLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>

          <div className="hero-actions">
            {hero.actions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className={action.primary ? 'btn btn-primary' : 'btn btn-ghost'}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>

        <aside className="hero-aside" aria-label="简介与现状">
          <div className="hero-fact">
            <p className="fact-label">关注 · FOCUS</p>
            <p className="fact-body">{focus.focus}</p>
          </div>
          <div className="hero-fact">
            <p className="fact-label">现在 · CURRENTLY</p>
            <p className="fact-body">{focus.currently}</p>
          </div>
          <div className="hero-fact">
            <p className="fact-label">荣誉 · HONORS</p>
            <ul className="fact-badges">
              {focus.honors.map((h) => (
                <li key={h} className="fact-badge">
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </header>
  )
}
