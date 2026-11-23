/**
 * 从 git 历史推导笔记的发布/更新时间，写到 dist/note-dates.json。
 *
 * 为什么要过滤：站点经常有「全站统一图标」「侧栏加版本号」这类批量提交，
 * 它们只改到笔记页的两三行，不能算这篇笔记的内容更新。这里只认改动行数
 * 不少于 MIN_CHANGE_LINES 的提交，避免把所有笔记的 modified time 都刷成
 * 同一天。
 *
 * 日期来源优先级：
 *   published = notes.json 的 date → 最早一次实质提交 → 最早一次提交
 *   updated   = notes.json 的 updated → 最新一次实质提交 → published
 *
 * 输出只进 dist/，不回写 public/notes.json；构建可重复，不会把仓库弄脏。
 *
 * 用法：node scripts/note-dates.mjs
 * 位置：vite build 之后、sitemap / note-meta 之前。
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const data = JSON.parse(readFileSync(join(root, 'public/notes.json'), 'utf8'))

const notes = data.books.flatMap((book) =>
  book.notes.map((note) => ({ ...note, book: book.title })),
)

const MIN_CHANGE_LINES = 5
/** 一次改动超过这么多文件，视为全站性提交，不拿它当单篇笔记的更新时间。 */
const BULK_FILES = 12

function git(args) {
  try {
    return execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      windowsHide: true,
    }).trim()
  } catch {
    return ''
  }
}

/** 该文件被哪些提交碰过；--follow 让重命名后的笔记还能接上旧历史。 */
function commitsFor(href) {
  return git([
    '-c',
    'core.quotepath=false',
    'log',
    '--follow',
    '--format=%H%x09%cs',
    '--',
    href,
  ])
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash, date] = line.split('\t')
      return hash && date ? { hash, date } : null
    })
    .filter(Boolean)
}

/** 这次提交一共碰了多少个文件，用来识别全站性提交。 */
function changedFiles(hash) {
  return git(['show', '--numstat', '--format=', hash])
    .split('\n')
    .filter(Boolean).length
}

/** 这次提交实际改了这个文件多少行；重命名提交可能取不到，返回 0。 */
function changedLines(hash, href) {
  const out = git(['show', '--numstat', '--format=', hash, '--', href])
  let total = 0
  for (const line of out.split('\n')) {
    const [added, deleted] = line.split('\t')
    if (!added || added === '-') continue
    total += (Number(added) || 0) + (Number(deleted) || 0)
  }
  return total
}

function isoDay(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') ? value : null
}

const dates = {}
let withGit = 0
let fallback = 0

for (const note of notes) {
  // 模板化之后，正文在 notes/，交互图仍在 public/。两个路径都查一遍：
  // 提交前后、以及重命名还没被 git 认出来时，都能接上旧历史。
  const candidates = [`notes/${note.href}`, `public/${note.href}`]
  const analyses = candidates.map((file) => {
    const commits = commitsFor(file)
    return {
      commits,
      substantive: commits.filter(
        (commit) =>
          changedFiles(commit.hash) <= BULK_FILES &&
          changedLines(commit.hash, file) >= MIN_CHANGE_LINES,
      ),
    }
  })

  const uniqueByHash = (items) => {
    const map = new Map()
    for (const item of items) map.set(item.hash, item)
    return [...map.values()].sort((a, b) => b.date.localeCompare(a.date))
  }

  const commits = uniqueByHash(analyses.flatMap((item) => item.commits))
  const substantive = uniqueByHash(
    analyses.flatMap((item) => item.substantive),
  )

  const newest = substantive[0]?.date
  const oldest = substantive.at(-1)?.date
  const anyCommit = commits[0]?.date

  const published =
    isoDay(note.date) ?? oldest ?? anyCommit ?? newest ?? null
  const updated =
    isoDay(note.updated) ??
    (newest && published && newest > published ? newest : null) ??
    published

  if (published) {
    dates[note.href] = { published, updated }
    if (newest) withGit += 1
  } else {
    fallback += 1
  }
}

mkdirSync(dist, { recursive: true })
writeFileSync(
  join(dist, 'note-dates.json'),
  `${JSON.stringify(dates, null, 2)}\n`,
)

console.log(
  `[note-dates] 写入 ${Object.keys(dates).length} 篇` +
    `（${withGit} 篇有实质 git 提交${fallback ? `，${fallback} 篇没有日期` : ''}）`,
)