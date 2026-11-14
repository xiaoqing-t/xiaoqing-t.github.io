/**
 * 从 Obsidian 的「活跃线」目录同步 /now 页面的数据。
 *
 * 真相源：<vault>/活跃线/*.md 的 frontmatter（tags、status、updated），
 * 以及 00_活跃线看板.md 里的复盘日期。
 * 输出：public/now.json（提交进仓库，线上构建直接用它）。
 *
 * 只导出 scripts/now-lines.json 白名单里的线；摘要用白名单里的公开版本，
 * 不直接搬运线卡里的 next，避免把团队/保研等内部细节发到公网。
 *
 * 用法：npm run sync:now
 * 在 GitHub Actions 里没有 vault，脚本会提示后保持现有 now.json 不变。
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseNoteDate } from './lib/note-date.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const vault = resolve(root, '../..')
const linesDir = join(vault, '活跃线')
const configPath = join(root, 'scripts/now-lines.json')
const outPath = join(root, 'public/now.json')

if (!existsSync(linesDir)) {
  console.warn('[sync-now] 找不到活跃线目录，保持现有 public/now.json 不变')
  process.exit(0)
}

const config = JSON.parse(readFileSync(configPath, 'utf8'))

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('.md')) out.push(full)
  }
  return out
}

function frontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  if (!match) return {}
  const fields = {}
  for (const line of match[1].split(/\r?\n/)) {
    const m = /^([A-Za-z_]+):\s*(.*)$/.exec(line)
    if (m) fields[m[1]] = m[2].trim().replace(/^"(.*)"$/, '$1')
  }
  return fields
}

const cards = new Map()
for (const file of walk(linesDir)) {
  cards.set(basename(file, '.md'), file)
}

const lines = []
for (const item of config.lines) {
  const file = cards.get(item.file)
  if (!file) {
    console.warn(`[sync-now] 找不到线卡 ${item.file}，跳过`)
    continue
  }
  const fields = frontmatter(readFileSync(file, 'utf8'))
  lines.push({
    title: item.file,
    status: item.status ?? fields.status ?? 'active',
    updated: fields.updated ?? '',
    summary: item.summary,
  })
}

let review = {}
const dashboard = join(linesDir, '00_活跃线看板.md')
if (existsSync(dashboard)) {
  const text = readFileSync(dashboard, 'utf8')
  review = {
    last: /上次复盘：\*\*(\d{4}-\d{2}-\d{2})/.exec(text)?.[1] ?? '',
    next: /下次：\*\*(\d{4}-\d{2}-\d{2})/.exec(text)?.[1] ?? '',
  }
}

const now = new Date()
const generatedAt = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-')

writeFileSync(
  outPath,
  `${JSON.stringify({ generatedAt, review, focus: config.focus, lines }, null, 2)}\n`,
)

// 页面数据直接内嵌进 now.html：本地双击（file://）也能看，不依赖 fetch。
function injectJSON(html, id, value) {
  const json = JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
  const re = new RegExp(`(<script[^>]*id="${id}"[^>]*>)[\\s\\S]*?(</script>)`)
  if (!re.test(html)) {
    console.warn(`[sync-now] now.html 里找不到 #${id}，跳过内嵌`)
    return html
  }
  return html.replace(re, (_, open, close) => open + json + close)
}

const nowHtmlPath = join(root, 'public/now.html')
if (existsSync(nowHtmlPath)) {
  const noteData = JSON.parse(readFileSync(join(root, 'public/notes.json'), 'utf8'))
  const recent = noteData.books
    .flatMap((book) => book.notes)
    .map((note) => ({
      title: note.title,
      href: note.href,
      meta: note.meta,
      date: parseNoteDate(note.meta)?.getTime() ?? 0,
    }))
    .filter((note) => note.date)
    .sort((a, b) => b.date - a.date)
    .slice(0, 3)
    .map(({ date, ...note }) => note)

  let html = readFileSync(nowHtmlPath, 'utf8')
  html = injectJSON(html, 'now-data', { generatedAt, review, focus: config.focus, lines })
  html = injectJSON(html, 'recent-data', recent)
  writeFileSync(nowHtmlPath, html)
}

console.log(`[sync-now] 写入 ${lines.length} 张线卡 → public/now.json，并内嵌进 public/now.html`)
