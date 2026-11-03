// 「学习笔记」区块：按书分组列出章节，上面带一个本地搜索和按书筛选。
//
// 书目结构在 public/notes.json —— 笔记页的侧边栏运行时读的也是这一份，
// 所以加一篇笔记只改那个 JSON，不用同时改这里。
// 章节本身还是 public/ 里的独立静态 HTML（写完就冻结，不用 React 重排）。

import { useMemo, useState } from 'react'

import Section from './Section'
import Reveal from './Reveal'
import { books } from '../data/site'

const total = books.reduce((sum, book) => sum + book.notes.length, 0)

// 书卡先列这么多章，其余折起来，主页不会随章节数一直变长
const COLLAPSED = 4

export default function Notes() {
  const [query, setQuery] = useState('')
  const [bookId, setBookId] = useState('all')
  const [openBooks, setOpenBooks] = useState<string[]>([])

  function toggleBook(id: string) {
    setOpenBooks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const q = query.trim().toLowerCase()

  // 先按书筛，再按关键词筛章；筛空的整本书直接不显示，免得留下一排「0 篇」
  const visible = useMemo(
    () =>
      books
        .filter((book) => bookId === 'all' || book.id === bookId)
        .map((book) => ({
          book,
          notes: q
            ? book.notes.filter((note) =>
                [note.title, note.desc, note.meta, book.title].join(' ').toLowerCase().includes(q),
              )
            : book.notes,
        }))
        .filter((group) => group.notes.length > 0),
    [q, bookId],
  )

  const shown = visible.reduce((sum, group) => sum + group.notes.length, 0)
  const filtering = q !== '' || bookId !== 'all'

  function clear() {
    setQuery('')
    setBookId('all')
  }

  return (
    <Section
      id="notes"
      num="03"
      title="学习笔记"
      lead="读论文的方法、踩过的坑、做过的排查，都写在这里。同一主题的按阅读顺序编成书，从第一章往下读。"
    >
      <div className="notes-tools">
        <label className="notes-search">
          <span className="sr-only">搜索笔记</span>
          <svg className="search-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M11 11l3.2 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜标题、摘要或书名"
            autoComplete="off"
          />
        </label>

        <div className="notes-chips" role="group" aria-label="按书筛选">
          <button
            type="button"
            className="chip"
            aria-pressed={bookId === 'all'}
            onClick={() => setBookId('all')}
          >
            全部<span className="chip-n">{total}</span>
          </button>
          {books.map((book) => (
            <button
              key={book.id}
              type="button"
              className="chip"
              aria-pressed={bookId === book.id}
              onClick={() => setBookId(book.id)}
            >
              {book.title}
              <span className="chip-n">{book.notes.length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 始终存在（而不是只在筛选时出现），读屏软件才会把结果数念出来 */}
      <p className="notes-status" role="status">
        {filtering
          ? `找到 ${shown} 篇${shown < total ? `（共 ${total} 篇）` : ''}`
          : `共 ${books.length} 本书 · ${total} 篇笔记`}
      </p>

      <Reveal className="books">
        {visible.map(({ book, notes }) => {
          // 搜索或按书筛选时全展开，别把命中的章节藏在折叠下面
          const expanded = filtering || openBooks.includes(book.id)
          const listed = expanded ? notes : notes.slice(0, COLLAPSED)

          return (
            <article className="book-card card" key={book.id}>
              <header className="book-head">
                <div>
                  <p className="book-kicker">
                    书 · {String(books.indexOf(book) + 1).padStart(2, '0')}
                  </p>
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-tagline">{book.tagline}</p>
                </div>
                <span className="book-count">{notes.length} 篇</span>
              </header>

              <ol className="book-chapters" id={`chapters-${book.id}`}>
                {listed.map((note) => (
                  <li key={note.href}>
                    <a href={note.href}>
                      <span className="chapter-num">
                        {String(book.notes.indexOf(note) + 1).padStart(2, '0')}
                      </span>
                      <span className="chapter-main">
                        <span className="chapter-title">{note.title}</span>
                        <span className="chapter-desc">{note.desc}</span>
                      </span>
                      <span className="chapter-meta">{note.meta}</span>
                    </a>
                  </li>
                ))}
              </ol>

              {!filtering && notes.length > COLLAPSED && (
                <button
                  type="button"
                  className="chapters-toggle"
                  aria-expanded={expanded}
                  aria-controls={`chapters-${book.id}`}
                  onClick={() => toggleBook(book.id)}
                >
                  {expanded ? '收起' : `展开其余 ${notes.length - COLLAPSED} 篇`}
                </button>
              )}
            </article>
          )
        })}

        {shown === 0 && (
          <div className="notes-empty card">
            <p>没有符合条件的笔记。</p>
            <button type="button" className="chip" onClick={clear}>
              清除筛选
            </button>
          </div>
        )}
      </Reveal>
    </Section>
  )
}
