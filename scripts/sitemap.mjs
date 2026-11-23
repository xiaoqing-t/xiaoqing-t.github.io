/**
 * 生成 dist/sitemap.xml。
 *
 * 静态页（主页、简历、案例、demo）的 lastmod 仍然手写，因为它们的更新时间
 * 没有统一来源；笔记的 lastmod 来自 note-dates.json，跟 git 走。
 *
 * 用法：node scripts/sitemap.mjs
 * 位置：note-dates 之后、note-meta 之前。
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE = 'https://xiaoqing-t.github.io'

/** 非笔记页面；改这些页时顺手更新 lastmod。 */
const STATIC_PAGES = [
  { path: '/', lastmod: '2026-10-30', priority: '1.0' },
  { path: '/en/', lastmod: '2026-11-14', priority: '0.8' },
  { path: '/resume.html', lastmod: '2026-11-14', priority: '0.8' },
  { path: '/resume-en.html', lastmod: '2026-11-14', priority: '0.8' },
  { path: '/now.html', lastmod: '2026-11-14', priority: '0.7' },
  { path: '/case-coding-agent.html', lastmod: '2026-11-14', priority: '0.7' },
  { path: '/case-eeg-pipeline.html', lastmod: '2026-11-14', priority: '0.7' },
  { path: '/uses.html', lastmod: '2026-11-14', priority: '0.6' },
  { path: '/demo/automata.html', lastmod: '2026-11-14', priority: '0.7' },
  { path: '/demo/pda.html', lastmod: '2026-11-14', priority: '0.7' },
]

const data = JSON.parse(readFileSync(join(root, 'public/notes.json'), 'utf8'))
const dateFile = join(dist, 'note-dates.json')
const dates = existsSync(dateFile) ? JSON.parse(readFileSync(dateFile, 'utf8')) : {}

const notes = data.books.flatMap((book) => book.notes)
const urls = [
  ...STATIC_PAGES.map((page) => ({
    loc: `${SITE}${page.path}`,
    lastmod: page.lastmod,
    priority: page.priority,
  })),
  ...notes.map((note) => ({
    loc: `${SITE}/${note.href}`,
    lastmod: dates[note.href]?.updated ?? note.updated ?? note.date,
    priority: '0.6',
  })),
]

const xml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const body = urls
  .map((url) =>
    [
      '  <url>',
      `    <loc>${xml(url.loc)}</loc>`,
      url.lastmod ? `    <lastmod>${xml(url.lastmod)}</lastmod>` : null,
      url.priority ? `    <priority>${url.priority}</priority>` : null,
      '  </url>',
    ]
      .filter(Boolean)
      .join('\n'),
  )
  .join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

writeFileSync(join(dist, 'sitemap.xml'), sitemap)
console.log(
  `[sitemap] 写入 ${urls.length} 个 URL（静态 ${STATIC_PAGES.length}，笔记 ${notes.length}）`,
)