// 首屏大标题区。纯展示，没有状态 —— 内容全部来自 src/data/site.tsx 的 hero。

import { hero } from '../data/site'

export default function Hero() {
  return (
    // id="top" 是给导航栏左上角那个「ZY」用的锚点
    <header className="hero" id="top">
      {/* 纯装饰的背景层，对读屏软件隐藏 */}
      <div className="hero-bg" aria-hidden="true"></div>

      <div className="hero-inner">
        <p className="hero-eyebrow">{hero.eyebrow}</p>

        <h1 className="hero-title">
          {hero.titleLead}
          {/* 标题中间那段上色 */}
          <span className="accent">{hero.titleAccent}</span>
          {hero.titleTail}
        </h1>

        {/* hero.sub 里的 \n 由 CSS 的 white-space: pre-line 负责换行 */}
        <p className="hero-sub">{hero.sub}</p>

        <div className="hero-actions">
          {hero.actions.map((action) => (
            <a
              key={action.href}
              href={action.href}
              // primary 为真 = 蓝色实心按钮，否则是描边按钮
              className={action.primary ? 'btn btn-primary' : 'btn btn-ghost'}
            >
              {action.label}
            </a>
          ))}
        </div>

        <ul className="hero-meta">
          {hero.meta.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </header>
  )
}
