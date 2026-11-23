/**
 * 构建后产出两样东西（都在 dist/ 里，public/ 源文件不动）：
 *
 *   1. dist/feed.xml —— 由 public/notes.json 生成的 RSS 2.0，
 *      按首次发布日倒序，条目链接指向对应的 note-*.html。
 *   2. 每个笔记页 <head> 里的 canonical / OG / Twitter / article 标签，
 *      以及 BlogPosting JSON-LD。标题、摘要、标签、日期取自 notes.json；
 *      图片用 public/og/ 下对应的笔记图。
 *
 * 日期优先读 dist/note-dates.json（由 scripts/note-dates.mjs 从 git 推导），
 * 缺失时回退到 notes.json 的 date / meta 里的月份。
 *
 * 用法：node scripts/note-meta.mjs
 * 位置：必须放在 note-dates / sitemap 之后、inline-build 之前（dist 已存在，入口还没内联）。
 * 幂等：重复执行会先删掉上一次注入的 note-meta 区块，不会叠加。
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseNoteDate } from './lib/note-date.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const SITE = 'https://xiaoqing-t.github.io'
const FEED_TITLE = 'Zhao Yunzhe · 学习笔记'
const FEED_DESC = '读论文、做推导、踩坑排查的笔记，按主题编成书。'
const OG_FALLBACK = `${SITE}/og-image.png`

const data = JSON.parse(readFileSync(join(root, 'public/notes.json'), 'utf8'))
const dateFile = join(dist, 'note-dates.json')
const dates = existsSync(dateFile) ? JSON.parse(readFileSync(dateFile, 'utf8')) : {}

const notes = data.books.flatMap((book) =>
  book.notes.map((note) => ({ ...note, book: book.title })),
)

function day(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') ? value : null
}

function publishedDay(note) {
  return (
    day(dates[note.href]?.published) ??
    day(note.date) ??
    parseNoteDate(note.meta)?.toISOString().slice(0, 10) ??
    null
  )
}

function updatedDay(note) {
  return day(dates[note.href]?.updated) ?? day(note.updated) ?? publishedDay(note)
}

function dateObject(note) {
  const published = publishedDay(note)
  return published ? new Date(`${published}T00:00:00Z`) : null
}

notes.sort((a, b) => {
  const left = publishedDay(a)
  const right = publishedDay(b)
  if (left && right) return right.localeCompare(left)
  if (left) return -1
  if (right) return 1
  return 0
})

const xml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const attr = (s) => xml(s).replace(/"/g, '&quot;')

function feedItem(note) {
  const url = `${SITE}/${note.href}`
  const date = dateObject(note)
  return [
    '    <item>',
    `      <title>${xml(note.title)}</title>`,
    `      <link>${url}</link>`,
    `      <guid isPermaLink="true">${url}</guid>`,
    date ? `      <pubDate>${date.toUTCString()}</pubDate>` : null,
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
  const published = publishedDay(note)
  const updated = updatedDay(note)
  const keywords = Array.isArray(note.tags) ? note.tags.filter(Boolean) : []

  const articleMeta = [
    published
      ? `<meta property="article:published_time" content="${published}T00:00:00.000Z" />`
      : null,
    updated
      ? `<meta property="article:modified_time" content="${updated}T00:00:00.000Z" />`
      : null,
    `<meta property="article:section" content="${attr(note.book)}" />`,
    keywords.length
      ? `<meta name="keywords" content="${attr(keywords.join(','))}" />`
      : null,
  ]
    .filter(Boolean)
    .join('\n')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: note.title,
    description: note.desc,
    image: [image],
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(published ? { datePublished: published } : {}),
    ...(updated ? { dateModified: updated } : {}),
    inLanguage: 'zh-CN',
    author: {
      '@type': 'Person',
      name: 'Zhao Yunzhe',
      url: `${SITE}/`,
    },
    publisher: {
      '@type': 'Person',
      name: 'Zhao Yunzhe',
      url: `${SITE}/`,
    },
    articleSection: note.book,
    keywords,
    isPartOf: {
      '@type': 'Book',
      name: note.book,
      url: `${SITE}/#notes`,
    },
  }
  const json = JSON.stringify(jsonLd)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')

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
${articleMeta}
<script type="application/ld+json">${json}</script>
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
