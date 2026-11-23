/**
 * 普通笔记页的公共外壳。
 *
 * 只保留一份：head 的图标 / CSS、顶部导航、页脚、脚本。
 * 每篇笔记自己的 <style> 与 <main> 放在 notes/<文件名>.html 里。
 * book-shell / 交互图页面不走这里，仍由 public/ 原样提供。
 */

const BODY_START = `<body>
  <a class="skip-link" href="#main">跳到主要内容</a>
  <nav class="nav" id="nav">
    <div class="nav-inner">
      <a class="nav-brand" href="index.html">ZY <span class="nav-brand-en">/ Zhao Yunzhe</span></a>
      <button class="nav-toggle" id="navToggle" type="button" aria-label="打开菜单" aria-expanded="false" aria-controls="navLinks">
        <span></span><span></span><span></span>
      </button>
      <ul class="nav-links" id="navLinks">
        <li><a href="index.html#about">关于</a></li>
        <li><a href="index.html#work">项目</a></li>
        <li><a href="index.html#notes">笔记</a></li>
        <li><a href="resume.html">简历</a></li>
        <li><a href="index.html#contact" class="nav-cta">联系我</a></li>
      </ul>
    </div>
  </nav>

  `

function bodyEnd(katex) {
  const katexScripts = katex
    ? '  <script defer src="katex/katex.min.js"></script>\n' +
      '  <script defer src="katex/auto-render.min.js"></script>\n' +
      '  <script defer src="katex/render-math.js"></script>\n'
    : ''

  return `

  <footer class="footer">
    <div class="container">
      <p>© <span id="year"></span> Zhao Yunzhe · 用 HTML/CSS/JS 手写构建</p>
    </div>
  </footer>
  <script src="script.js?v=3"></script>
  <script defer src="book-shell.js?v=3"></script>
${katexScripts}</body>
</html>
`
}

export function renderNotePage({ title, description, style, content, katex }) {
  const katexLink = katex
    ? '  <link rel="stylesheet" href="katex/katex.min.css" />\n'
    : ''

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <link rel="icon" href="/favicon.ico" sizes="32x32" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="stylesheet" href="legacy-v1.css?v=3" />
  <link rel="stylesheet" href="notes.css?v=3" />
  <link rel="stylesheet" href="book-shell.css" />
${katexLink}  <style>
${style}
  </style>
</head>
${BODY_START}${content}${bodyEnd(katex)}`
}