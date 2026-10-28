// 「学习笔记」区块：列表项来自 notes 数组。
//
// 每一篇笔记本身还是 public/ 里的独立静态 HTML（写完就冻结、不用 React 重新排一遍版），
// 这里只负责在主页列出它们。加一篇笔记 = 把 html 放进 public/ + 往 notes 数组加一项。

import Section from './Section'
import Reveal from './Reveal'
import { notes } from '../data/site'

export default function Notes() {
  return (
    <Section
      id="notes"
      num="03"
      title="学习笔记"
      lead="读论文的方法、踩过的坑、做过的排查，都写在这里。有长有短，看当时想清楚了多少。"
    >
      {/* 每个条目本身是 <a>，而 <Reveal> 渲染的是 <div>，没法直接包条目 → 包整个列表 */}
      <Reveal className="notes-list">
        {notes.map((note) => (
          <a className="note-item card" href={note.href} key={note.href}>
            <span className="note-cat">{note.category}</span>
            <h3>{note.title}</h3>
            <p>{note.desc}</p>
            <span className="note-date">{note.meta}</span>
          </a>
        ))}
      </Reveal>
    </Section>
  )
}
