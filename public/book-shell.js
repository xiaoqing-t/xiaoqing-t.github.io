/* 笔记页的「本书」侧栏 + 上下篇。
 *
 * 数据来自 notes.json（首页那份是同一个文件）：按当前文件名找到所属的书和章节位置。
 * 找不到、或者取不到数据，就什么都不做 —— 侧栏只是增强，正文本身照常可读。
 */
;(() => {
  'use strict'

  const main = document.querySelector('main.article')
  if (!main) return

  const fileName = decodeURIComponent(location.pathname.split('/').pop() || '')
  if (!fileName) return

  fetch('notes.json')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data && Array.isArray(data.books)) build(data.books)
    })
    .catch(() => {})

  function el(tag, className, text) {
    const node = document.createElement(tag)
    if (className) node.className = className
    if (text !== undefined) node.textContent = text
    return node
  }

  /** 标题里的公式已经由 KaTeX 渲染过，textContent 会把隐藏 MathML 里的 TeX 源码
   *  和可见字形拼在一起（∑\sum∑），所以先去掉 MathML 副本再取文字。 */
  function headingText(heading) {
    const clone = heading.cloneNode(true)
    clone.querySelectorAll('.katex-mathml').forEach((node) => node.remove())
    return clone.textContent.replace(/\s+/g, ' ').trim()
  }

  function chapterList(book, current) {
    const list = el('ol', 'rail-list')
    book.notes.forEach((note, i) => {
      const link = el('a')
      link.href = note.href
      link.append(
        el('span', 'rail-num', String(i + 1).padStart(2, '0')),
        el('span', 'rail-title', note.title),
      )
      if (i === current) link.setAttribute('aria-current', 'page')
      const item = el('li')
      item.append(link)
      list.append(item)
    })
    return list
  }

  function pagerLink(note, dir) {
    if (!note) {
      return el('span', 'pager-link pager-empty', dir === 'prev' ? '已是本书第一篇' : '已是本书最后一篇')
    }
    const link = el('a', `pager-link pager-${dir}`)
    link.href = note.href
    link.append(
      el('span', 'pager-label', dir === 'prev' ? '← 本书上一篇' : '本书下一篇 →'),
      el('span', 'pager-title', note.title),
    )
    return link
  }

  /** 读屏和滚动高亮都靠它：当前读到哪个小节，目录里就点亮哪一条 */
  function spy(rail) {
    const links = Array.from(rail.querySelectorAll('.rail-list-sub a'))
    if (!links.length) return
    const targets = links.map((link) => document.getElementById(link.dataset.target))

    let queued = false
    const update = () => {
      queued = false
      const line = window.scrollY + 120
      let active = -1
      targets.forEach((heading, i) => {
        if (heading && heading.getBoundingClientRect().top + window.scrollY <= line) active = i
      })
      links.forEach((link, i) => {
        const on = i === active
        link.classList.toggle('on', on)
        if (on) link.setAttribute('aria-current', 'true')
        else link.removeAttribute('aria-current')
      })
    }

    window.addEventListener(
      'scroll',
      () => {
        if (queued) return
        queued = true
        requestAnimationFrame(update)
      },
      { passive: true },
    )
    update()
  }

  function build(books) {
    let book
    let current = -1
    for (const candidate of books) {
      const i = candidate.notes.findIndex((note) => note.href === fileName)
      if (i !== -1) {
        book = candidate
        current = i
        break
      }
    }
    if (!book) return

    document.documentElement.classList.add('book-page')

    // 正文整体挪进 .article-body：宽屏下正文占右列，目录占左列
    const body = el('div', 'article-body')
    while (main.firstChild) body.append(main.firstChild)

    const rail = el('aside', 'book-rail')
    rail.setAttribute('aria-label', `本书目录：${book.title}`)
    rail.append(
      el('p', 'rail-kicker', `书 · ${String(books.indexOf(book) + 1).padStart(2, '0')}`),
      el('p', 'rail-book', book.title),
      chapterList(book, current),
    )

    const headings = Array.from(body.querySelectorAll('h2[id]'))
    if (headings.length > 1) {
      rail.append(el('p', 'rail-sec-title', '本页'))
      const sub = el('ol', 'rail-list rail-list-sub')
      headings.forEach((heading) => {
        const link = el('a', null, headingText(heading))
        link.href = `#${heading.id}`
        link.dataset.target = heading.id
        const item = el('li')
        item.append(link)
        sub.append(item)
      })
      rail.append(sub)
    }

    const back = el('a', null, '← 全部笔记')
    back.href = 'index.html#notes'
    const foot = el('p', 'rail-foot')
    foot.append(back)
    rail.append(foot)

    // 窄屏：侧栏不显示，改在正文开头放一个可展开的目录
    const toc = document.createElement('details')
    toc.className = 'book-toc'
    toc.append(
      el('summary', null, `本书目录 · ${book.title}（第 ${current + 1} / ${book.notes.length} 篇）`),
      chapterList(book, current),
    )
    // 放在「← 返回学习笔记」后面：返回链接还是页面第一个可点的东西
    const backLink = body.querySelector('.back-link')
    if (backLink) backLink.after(toc)
    else body.prepend(toc)

    const pager = el('nav', 'book-pager')
    pager.setAttribute('aria-label', '本书上下篇')
    pager.append(pagerLink(book.notes[current - 1], 'prev'), pagerLink(book.notes[current + 1], 'next'))
    body.append(pager)

    main.append(rail, body)
    spy(rail)
  }
})()
