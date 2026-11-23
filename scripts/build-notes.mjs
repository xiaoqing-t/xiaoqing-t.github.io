/**
 * 把 notes/<文件名>.html 的内容片段套上公共外壳，写到 dist/。
 *
 * 片段格式：
 *   <!--note-page
 *   {"pageTitle":"…","pageDescription":"…","katex":true}
 *   note-page-->
 *   <!-- note-style:start -->
 *   这一页独有的 CSS
 *   <!-- note-style:end -->
 *   <main class="container article">…</main>
 *
 * 页面标题、描述、是否加载 KaTeX 放在片段头里；卡片用的 title / desc
 * 仍在 public/notes.json，不随页面实现重复。
 *
 * 没有片段的笔记（两张交互图）继续由 public/ 原样提供，不走模板。
 *
 * 用法：node scripts/build-notes.mjs
 * 位置：vite build 之后、note-dates / sitemap / note-meta 之前。
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderNotePage } from './lib/note-page.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const data = JSON.parse(readFileSync(join(root, 'public/notes.json'), 'utf8'))
const notes = data.books.flatMap((book) => book.notes)

const PAGE_START = '<!--note-page\n'
const PAGE_END = '\nnote-page-->\n'
const STYLE_START = '<!-- note-style:start -->\n'
const STYLE_END = '\n<!-- note-style:end -->'

let rendered = 0
let skipped = 0

for (const note of notes) {
  const fragmentPath = join(root, 'notes', note.href)
  if (!existsSync(fragmentPath)) {
    skipped += 1
    continue
  }

  let fragment = readFileSync(fragmentPath, 'utf8').replace(/\r\n/g, '\n')
  let page = {}
  if (fragment.startsWith(PAGE_START)) {
    const pageEnd = fragment.indexOf(PAGE_END)
    if (pageEnd === -1) {
      throw new Error(`[build-notes] ${note.href} 的 note-page 头没有闭合`)
    }
    page = JSON.parse(fragment.slice(PAGE_START.length, pageEnd))
    fragment = fragment.slice(pageEnd + PAGE_END.length)
  }

  const styleStart = fragment.indexOf(STYLE_START)
  const styleEnd = fragment.indexOf(STYLE_END)
  if (styleStart === -1 || styleEnd === -1) {
    throw new Error(`[build-notes] ${note.href} 缺少 note-style 标记`)
  }

  const style = fragment.slice(styleStart + STYLE_START.length, styleEnd)
  const contentStart = fragment.indexOf('<main')
  const contentEnd = fragment.lastIndexOf('</main>')
  if (contentStart === -1 || contentEnd === -1) {
    throw new Error(`[build-notes] ${note.href} 缺少 <main>`)
  }
  const content = fragment.slice(contentStart, contentEnd + '</main>'.length)

  const html = renderNotePage({
    title: page.pageTitle ?? `${note.title} · 学习笔记`,
    description: page.pageDescription ?? note.desc,
    style,
    content,
    katex: Boolean(page.katex),
  })

  writeFileSync(join(dist, note.href), html)
  rendered += 1
}

console.log(
  `[build-notes] 从模板生成 ${rendered} 页` +
    (skipped ? `，跳过 ${skipped} 页（保留 public/ 原样）` : ''),
)