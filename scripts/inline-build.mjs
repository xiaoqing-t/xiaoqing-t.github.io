/**
 * 构建后把 JS/CSS 内联进 index.html，产出一个「自包含的单文件页面」。
 *
 * 用法：node scripts/inline-build.mjs     （package.json 的 build 里接在 vite build 之后）
 *
 * ── 为什么不用 vite-plugin-singlefile ────────────────────────────────────────
 * 2026-09-29 实测：装的是 2.3.3，它的 peerDependencies 也声明支持 vite ^8，
 * 但在 Vite 8（rolldown 内核）下**静默不生效** —— 构建跑完，产物里 JS/CSS
 * 仍然是独立的 assets/ 文件，HTML 里也还是 <script src>。
 * 所以改成自己内联：逻辑只有几十行，可控、可读，也不怕插件跟内核版本赛跑。
 *
 * ── 这个脚本只做四件事 ─────────────────────────────────────────────────────
 *   1. 读 dist/index.html
 *   2. 把 <script … src="/assets/x.js"></script> 换成内联的 <script type="module">…</script>
 *   3. 把 <link rel="stylesheet" … href="/assets/x.css"> 换成内联的 <style>…</style>
 *   4. 删掉已经被内联的那几个 assets 文件
 *
 * ── 边界（重要）────────────────────────────────────────────────────────────
 * 只处理「被 index.html 引用到的 js/css」。public/ 拷出来的东西
 * （简历 PDF、四篇笔记 HTML、legacy-v1.css、v1-index.html…）**一律不碰**。
 */
import { existsSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const htmlPath = join(dist, 'index.html')

if (!existsSync(htmlPath)) {
  console.error('[inline] 找不到 dist/index.html —— 请先跑 vite build')
  process.exit(1)
}

let html = readFileSync(htmlPath, 'utf8')
const inlined = []

/** HTML 里写的是 /assets/x.js（base 是 '/'），换成磁盘路径就得到 dist 下 */
const toDiskPath = (url) => join(dist, url.replace(/^\//, ''))

/**
 * 挡住「JS/CSS 内容里恰好出现 </script> 或 </style>」把 HTML 截断的情况。
 * 打包产物里出现这种字符串的概率很低，但一旦出现就是页面直接坏掉，必须防。
 */
const guard = (code, tag) => code.replaceAll(`</${tag}`, `<\\/${tag}`)

const sizeKb = (file) => (statSync(file).size / 1024).toFixed(1)

// ① 内联 <script type="module" crossorigin src="…"></script>
html = html.replace(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g, (whole, src) => {
  const file = toDiskPath(src)
  if (!existsSync(file)) return whole
  const code = guard(readFileSync(file, 'utf8'), 'script')
  inlined.push(file)
  console.log(`[inline] <script>  ${src}  ${sizeKb(file)} KB`)
  return `<script type="module">\n${code}\n</script>`
})

// ② 内联 <link rel="stylesheet" … href="…">
html = html.replace(/<link\b[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"[^>]*>/g, (whole, href) => {
  const file = toDiskPath(href)
  if (!existsSync(file)) return whole
  const css = guard(readFileSync(file, 'utf8'), 'style')
  inlined.push(file)
  console.log(`[inline] <style>   ${href}  ${sizeKb(file)} KB`)
  return `<style>\n${css}\n</style>`
})

writeFileSync(htmlPath, html)

for (const file of inlined) {
  try {
    unlinkSync(file)
  } catch {
    // 删不掉也不影响页面：HTML 已经不再引用它了
  }
}

console.log(`[inline] 完成：内联 ${inlined.length} 个文件，删掉对应的独立产物`)
console.log(`[inline] dist/index.html 现在 ${sizeKb(htmlPath)} KB`)
console.log('[inline] assets/ 若是空的，可以手动删掉该目录（脚本不自动删，免得误伤）')
