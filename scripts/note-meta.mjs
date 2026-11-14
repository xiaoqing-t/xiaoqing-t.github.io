/**
 * 构建后产出两样东西（都在 dist/ 里，public/ 源文件不动）：
 *
 *   1. dist/feed.xml —— 由 public/notes.json 生成的 RSS 2.0，
 *      按笔记日期倒序，条目链接指向对应的 note-*.html。
 *   2. 每个笔记页 <head> 里的 canonical / OG / Twitter 标签，
 *      标题与摘要取自 notes.json，图片用 public/og/ 下对应的笔记图。
 *
 * 用法：node scripts/note-meta.mjs
 * 位置：必须放在 vite build 之后、inline-build 之前（dist 已存在，入口还没内联）。
 * 幂等：重复执行会先删掉上一次注入的 note-meta 区块，不会叠加。
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE = 'https://xiaoqing-t.github.io'
const FEED_TITLE = 'Zhao Yunzhe · 学习笔记'
const FEED_DESC = '读论文、做推导、踩坑排查的笔记，按主题编成书。'
const OG_FALLBACK = `${SITE}/og-image.png`

const data = JSON.parse(readFileSync(join(root, 'public/notes.json'), 'utf8'))

const notes = data.books.flatMap((book) =>
  book.notes.map((note) => ({ ...note, book: book.title, date: parseDate(note.meta) })),
)

notes.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))

function parseDate(meta) {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(meta ?? '')
  if (!m) return null
  return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, m[3] ? Number(m[3]) : 1))
}

const xml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const attr = (s) => xml(s).replace(/"/g, '&quot;')

function feedItem(note) {
  const url = `${SITE}/${note.href}`
  return [
    '    <item>',
    `      <title>${xml(note.title)}</title>`,
    `      <link>${url}</link>`,
    `      <guid isPermaLink="true">${url}</guid>`,
    note.date ? `      <pubDate>${note.date.toUTCString()}</pubDate>` : null,
    `      <category>${xml(note.book)}</category>`,
    `      <description>${xml(note.desc)}</description>`,
    '    </item>',
  ]
    .filter(Boolean)
    .join('\n')
}

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${FEED_TITLE}</title>
    <link>${SITE}/</link>
    <description>${xml(FEED_DESC)}</description>
    <language>zh-CN</language>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
${notes.map(feedItem).join('\n')}
  </channel>
</rss>
`

function metaBlock(note, image) {
  const url = `${SITE}/${note.href}`
  return `<!-- note-meta:start -->
<link rel="canonical" href="${url}" />
<meta property="og:type" content="article" />
<meta property="og:locale" content="zh_CN" />
<meta property="og:site_name" content="Zhao Yunzhe" />
<meta property="og:title" content="${attr(note.title)}" />
<meta property="og:description" content="${attr(note.desc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${attr(note.title)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${attr(note.title)}" />
<meta name="twitter:description" content="${attr(note.desc)}" />
<meta name="twitter:image" content="${image}" />
<link rel="alternate" type="application/rss+xml" title="${attr(FEED_TITLE)}" href="${SITE}/feed.xml" />
<!-- note-meta:end -->`
}

let injected = 0
let missing = 0

for (const note of notes) {
  const file = join(dist, note.href)
  if (!existsSync(file)) {
    console.warn(`[note-meta] 找不到 ${note.href}，跳过`)
    missing += 1
    continue
  }

  let html = readFileSync(file, 'utf8')
  html = html.replace(/<!-- note-meta:start -->[\s\S]*?<!-- note-meta:end -->\n?/g, '')

  const imageName = note.href.replace(/\.html$/, '.png')
  const localImage = join(root, 'public/og', imageName)
  const image = existsSync(localImage) ? `${SITE}/og/${imageName}` : OG_FALLBACK
  if (!existsSync(localImage)) {
    console.warn(`[note-meta] 缺少 public/og/${imageName}，暂用站点 og-image.png`)
  }

  if (!html.includes('</head>')) {
    console.warn(`[note-meta] ${note.href} 没有 </head>，跳过`)
    missing += 1
    continue
  }

  html = html.replace('</head>', `${metaBlock(note, image)}\n</head>`)
  writeFileSync(file, html)
  injected += 1
}

writeFileSync(join(dist, 'feed.xml'), feed)
console.log(`[note-meta] feed.xml 写入 ${notes.length} 条；OG 标签注入 ${injected} 页${missing ? `，跳过 ${missing} 页` : ''}`)
