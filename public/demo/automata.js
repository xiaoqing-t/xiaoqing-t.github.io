const core = globalThis.AutomataCore

if (!core) {
  const box = document.getElementById('build-error')
  box.hidden = false
  box.textContent = '自动机核心没有加载成功，请刷新页面。'
  document.getElementById('status').textContent = '脚本加载失败。'
  throw new Error('AutomataCore is missing')
}

const { AutomatonError, RegexSyntaxError, compile, simulateDFA } = core

const $ = (id) => document.getElementById(id)
const SVG_NS = 'http://www.w3.org/2000/svg'
const NODE_R = 24

const els = {
  regex: $('regex'),
  word: $('word'),
  error: $('build-error'),
  status: $('status'),
  step: $('btn-step'),
  run: $('btn-run'),
  reset: $('btn-reset'),
  graph: $('graph'),
  currentState: $('current-state'),
  currentDetail: $('current-detail'),
  accepting: $('accepting'),
  tape: $('tape'),
  dfaTable: $('dfa-table'),
  subsetTable: $('subset-table'),
  alphabet: $('alphabet'),
  buildInfo: $('build-info'),
}

const model = {
  source: els.regex.value,
  word: els.word.value,
  dfa: null,
  nfa: null,
  sim: null,
  step: 0,
  timer: null,
  error: null,
}

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag)
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value)
  return node
}

function stopTimer() {
  if (model.timer !== null) {
    clearInterval(model.timer)
    model.timer = null
  }
}

function atEnd() {
  return model.sim !== null && model.step >= model.sim.steps.length - 1
}

function currentStep() {
  return model.sim.steps[model.step]
}

function stateName(id) {
  return model.dfa.states[id].name
}

function compileNow() {
  stopTimer()
  model.error = null
  model.dfa = null
  model.nfa = null
  model.sim = null
  model.step = 0

  try {
    const built = compile(model.source)
    model.nfa = built.nfa
    model.dfa = built.dfa
    model.sim = simulateDFA(built.dfa, model.word)
  } catch (error) {
    model.error = error
  }

  renderAll()
  updateURL()
}

function updateWord() {
  stopTimer()
  model.word = els.word.value
  model.step = 0
  if (model.dfa) model.sim = simulateDFA(model.dfa, model.word)
  renderAll()
  updateURL()
}

function updateURL() {
  try {
    const params = new URLSearchParams()
    params.set('re', model.source)
    params.set('w', model.word)
    history.replaceState(null, '', `${location.pathname}?${params}`)
  } catch {
    // file:// 下 replaceState 可能被拒绝，不影响模拟
  }
}

function errorText(error) {
  if (error instanceof RegexSyntaxError) {
    const where = error.position >= model.source.length ? '末尾' : `第 ${error.position + 1} 个字符`
    return `正则错误（${where}）：${error.message}`
  }
  if (error instanceof AutomatonError) return error.message
  return error?.message ?? '构建失败'
}

function renderAll() {
  renderError()
  if (!model.dfa || !model.sim) {
    clearApp()
    return
  }
  renderStatus()
  renderCurrent()
  renderTape()
  renderTable()
  renderSubset()
  renderGraph()
  renderAlphabet()
  renderButtons()
}

function renderError() {
  if (model.error) {
    els.error.hidden = false
    els.error.textContent = errorText(model.error)
  } else {
    els.error.hidden = true
    els.error.textContent = ''
  }
}

function clearApp() {
  els.status.textContent = model.error ? '正则有误，先把上面那行改好。' : '正在构建……'
  els.status.className = 'demo-status is-rejected'
  els.currentState.textContent = '—'
  els.currentState.className = 'now-state'
  els.currentDetail.textContent = '没有可运行的自动机。'
  els.accepting.textContent = ''
  els.tape.replaceChildren()
  els.dfaTable.replaceChildren()
  els.subsetTable.replaceChildren()
  els.alphabet.textContent = ''
  els.buildInfo.textContent = ''
  els.graph.replaceChildren()
  els.graph.setAttribute('aria-label', '暂无 DFA 状态图')
  els.step.disabled = true
  els.run.disabled = true
  els.reset.disabled = true
  els.run.textContent = '运行'
}

function renderStatus() {
  const step = currentStep()
  let text = ''
  let tone = ''

  if (step.dead) {
    text = `卡住：δ(${stateName(step.from)}, "${step.symbol}") 未定义 · 拒绝`
    tone = 'is-rejected'
  } else if (step.index >= model.word.length) {
    const state = model.dfa.states[step.states[0]]
    const verdict = state.accepting ? '接受' : '拒绝'
    const note = state.accepting ? '接受' : '非接受'
    text = `读完 ${model.word.length} 个字符 · 停在 ${state.name}（${note}）· ${verdict}`
    tone = state.accepting ? 'is-accepted' : 'is-rejected'
  } else {
    text = `已读 ${step.index} / ${model.word.length} · 当前 ${stateName(step.states[0])} · 下一个 "${model.word[step.index]}"`
  }

  els.status.textContent = text
  els.status.className = `demo-status ${tone}`.trim()
}

function renderCurrent() {
  const step = currentStep()
  const id = step.dead ? step.from : step.states[0]
  const state = model.dfa.states[id]

  els.currentState.textContent = state.name
  els.currentState.className = `now-state${step.dead ? ' is-blocked' : ''}`

  if (step.dead) {
    els.currentDetail.textContent = `试图从 ${state.name} 读 "${step.symbol}"，这条边不存在。`
  } else {
    const next = step.index < model.word.length ? ` · 下一个 "${model.word[step.index]}"` : ' · 已读完全部字符'
    els.currentDetail.textContent = `NFA 集合 {${state.set.join(', ')}}${next}`
  }

  const accepting = model.dfa.states.filter((s) => s.accepting).map((s) => s.name)
  els.accepting.textContent = `接受状态：${accepting.join('、')}`
}

function renderTape() {
  const step = currentStep()
  els.tape.replaceChildren()

  if (model.word.length === 0) {
    const cell = document.createElement('span')
    cell.className = 'tape-cell is-empty is-current'
    cell.textContent = 'ε'
    cell.title = '空串'
    els.tape.append(cell)
    els.tape.setAttribute('aria-label', '输入为空串，指针在开头')
    return
  }

  const pointer = step.index
  for (let i = 0; i < model.word.length; i++) {
    const cell = document.createElement('span')
    const classes = ['tape-cell']
    if (i < pointer) classes.push('is-done')
    if (i === pointer) classes.push('is-current')
    if (step.dead && i === pointer) classes.push('is-blocked')
    cell.className = classes.join(' ')
    cell.textContent = model.word[i]
    els.tape.append(cell)
  }
  els.tape.setAttribute(
    'aria-label',
    `输入 ${model.word}，指针在已读 ${pointer} 个字符之后${step.dead ? '，当前字符卡住' : ''}`,
  )
}

function renderTable() {
  const step = currentStep()
  const activeId = step.dead ? step.from : step.states[0]
  const nextSymbol = !step.dead && step.index < model.word.length ? model.word[step.index] : null
  const blockedSymbol = step.dead ? step.symbol : null

  const caption = document.createElement('caption')
  caption.className = 'sr-only'
  caption.textContent = 'DFA 转移表'
  els.dfaTable.replaceChildren(caption)

  const thead = document.createElement('thead')
  const headRow = document.createElement('tr')
  const first = document.createElement('th')
  first.textContent = '状态'
  headRow.append(first)
  if (model.dfa.alphabet.length === 0) {
    const th = document.createElement('th')
    th.textContent = '—'
    headRow.append(th)
  } else {
    for (const symbol of model.dfa.alphabet) {
      const th = document.createElement('th')
      th.textContent = symbol
      headRow.append(th)
    }
  }
  thead.append(headRow)

  const tbody = document.createElement('tbody')
  for (const state of model.dfa.states) {
    const row = document.createElement('tr')
    if (state.id === activeId) row.className = 'is-active'

    const name = document.createElement('td')
    name.textContent = state.accepting ? `${state.name}*` : state.name
    name.title = `NFA 集合 {${state.set.join(', ')}}`
    row.append(name)

    const symbols = model.dfa.alphabet.length === 0 ? [null] : model.dfa.alphabet
    for (const symbol of symbols) {
      const cell = document.createElement('td')
      if (symbol === null) {
        cell.textContent = '—'
        cell.className = 'is-missing'
        row.append(cell)
        continue
      }
      const edge = model.dfa.transitions.find((t) => t.from === state.id && t.symbol === symbol)
      cell.textContent = edge ? stateName(edge.to) : '—'
      if (!edge) cell.classList.add('is-missing')
      if (state.id === activeId && symbol === nextSymbol) cell.classList.add('is-next')
      if (state.id === activeId && symbol === blockedSymbol) cell.classList.add('is-blocked')
      row.append(cell)
    }
    tbody.append(row)
  }

  els.dfaTable.append(thead, tbody)
}

function renderSubset() {
  const caption = document.createElement('caption')
  caption.className = 'sr-only'
  caption.textContent = 'DFA 状态与对应的 NFA 状态集合'
  els.subsetTable.replaceChildren(caption)

  const thead = document.createElement('thead')
  const headRow = document.createElement('tr')
  for (const label of ['DFA', 'NFA 集合', '接受']) {
    const th = document.createElement('th')
    th.textContent = label
    headRow.append(th)
  }
  thead.append(headRow)

  const tbody = document.createElement('tbody')
  for (const state of model.dfa.states) {
    const row = document.createElement('tr')
    const name = document.createElement('td')
    name.textContent = state.name
    const set = document.createElement('td')
    set.textContent = `{${state.set.join(', ')}}`
    const accept = document.createElement('td')
    accept.textContent = state.accepting ? '是' : '—'
    row.append(name, set, accept)
    tbody.append(row)
  }

  els.subsetTable.append(thead, tbody)

  const epsilonCount = model.nfa.transitions.filter((t) => t.symbol === 'ε').length
  els.buildInfo.textContent =
    `NFA：${model.nfa.states.length} 个状态、${epsilonCount} 条 ε 转移；` +
    `子集构造得到 ${model.dfa.states.length} 个 DFA 状态。`
}

function renderAlphabet() {
  if (model.dfa.alphabet.length === 0) {
    els.alphabet.textContent = '字母表：空（只接受空串）'
  } else {
    els.alphabet.textContent = `字母表：${model.dfa.alphabet.join(' ')} · * 表示接受状态`
  }
}

function renderButtons() {
  const available = model.dfa !== null && model.sim !== null
  els.step.disabled = !available || atEnd()
  els.run.disabled = !available
  els.reset.disabled = !available
  els.run.textContent = model.timer !== null ? '暂停' : atEnd() ? '重跑' : '运行'
}

function layout(n) {
  const cx = 380
  const cy = 260
  if (n === 1) return [{ x: cx, y: cy }]
  if (n === 2) return [{ x: cx - 125, y: cy }, { x: cx + 125, y: cy }]

  const radius = n <= 6 ? 150 : n <= 10 ? 165 : 175
  return Array.from({ length: n }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / n
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
  })
}

function labelWidth(text) {
  let width = 0
  for (const ch of text) width += /[\u3400-\u9fff]/.test(ch) ? 11 : 6.8
  return Math.max(16, width + 12)
}

function edgeGeometry(a, b, curved) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  const start = { x: a.x + ux * (NODE_R + 5), y: a.y + uy * (NODE_R + 5) }
  const end = { x: b.x - ux * (NODE_R + 9), y: b.y - uy * (NODE_R + 9) }

  if (!curved) {
    return {
      d: `M${start.x} ${start.y} L${end.x} ${end.y}`,
      label: { x: (start.x + end.x) / 2 - uy * 11, y: (start.y + end.y) / 2 + ux * 11 },
    }
  }

  const mx = (start.x + end.x) / 2
  const my = (start.y + end.y) / 2
  const cx = mx - uy * 30
  const cy = my + ux * 30
  return {
    d: `M${start.x} ${start.y} Q${cx} ${cy} ${end.x} ${end.y}`,
    label: {
      x: 0.25 * start.x + 0.5 * cx + 0.25 * end.x - uy * 7,
      y: 0.25 * start.y + 0.5 * cy + 0.25 * end.y + ux * 7,
    },
  }
}

function renderGraph() {
  const svg = els.graph
  svg.replaceChildren()

  const defs = svgEl('defs')
  for (const [id, cls] of [
    ['arrow', 'g-arrow'],
    ['arrow-active', 'g-arrow-active'],
  ]) {
    const marker = svgEl('marker', {
      id,
      markerWidth: 9,
      markerHeight: 9,
      refX: 7,
      refY: 4.5,
      orient: 'auto',
    })
    marker.append(svgEl('path', { d: 'M0,0 L9,4.5 L0,9 z', class: cls }))
    defs.append(marker)
  }
  svg.append(defs)

  const step = currentStep()
  const positions = layout(model.dfa.states.length)
  const active = new Set(step.dead ? [step.from] : step.states)
  const blockedId = step.dead ? step.from : null

  let activeEdge = null
  if (!step.dead && model.step > 0) {
    const previous = model.sim.steps[model.step - 1].states[0]
    const symbol = model.word[model.step - 1]
    const edge = model.dfa.transitions.find((t) => t.from === previous && t.symbol === symbol)
    if (edge) activeEdge = { from: edge.from, to: edge.to }
  }

  const groups = new Map()
  for (const edge of model.dfa.transitions) {
    const key = `${edge.from}|${edge.to}`
    if (!groups.has(key)) groups.set(key, { from: edge.from, to: edge.to, symbols: [] })
    const group = groups.get(key)
    if (!group.symbols.includes(edge.symbol)) group.symbols.push(edge.symbol)
  }

  const labels = []
  for (const group of groups.values()) {
    const a = positions[group.from]
    const b = positions[group.to]
    const isActive = activeEdge !== null && activeEdge.from === group.from && activeEdge.to === group.to
    const marker = isActive ? 'arrow-active' : 'arrow'
    const text = group.symbols.join(',')

    if (group.from === group.to) {
      const d =
        `M${a.x - 12} ${a.y - NODE_R + 2} ` +
        `C${a.x - 38} ${a.y - NODE_R - 40} ${a.x + 38} ${a.y - NODE_R - 40} ${a.x + 12} ${a.y - NODE_R + 2}`
      svg.append(
        svgEl('path', {
          d,
          class: `g-edge${isActive ? ' is-active' : ''}`,
          'marker-end': `url(#${marker})`,
        }),
      )
      labels.push({ x: a.x, y: a.y - NODE_R - 46, text, active: isActive })
      continue
    }

    const curved = groups.has(`${group.to}|${group.from}`)
    const geometry = edgeGeometry(a, b, curved)
    svg.append(
      svgEl('path', {
        d: geometry.d,
        class: `g-edge${isActive ? ' is-active' : ''}`,
        'marker-end': `url(#${marker})`,
      }),
    )
    labels.push({ ...geometry.label, text, active: isActive })
  }

  for (const label of labels) {
    const width = labelWidth(label.text)
    svg.append(
      svgEl('rect', {
        x: label.x - width / 2,
        y: label.y - 8,
        width,
        height: 16,
        rx: 3,
        class: 'g-label-bg',
      }),
    )
    const text = svgEl('text', {
      x: label.x,
      y: label.y + 4,
      'text-anchor': 'middle',
      class: `g-label${label.active ? ' is-active' : ''}`,
    })
    text.textContent = label.text
    svg.append(text)
  }

  const start = positions[model.dfa.start]
  svg.append(
    svgEl('line', {
      x1: start.x - 62,
      y1: start.y,
      x2: start.x - NODE_R - 5,
      y2: start.y,
      class: 'g-start',
      'marker-end': 'url(#arrow)',
    }),
  )
  const startLabel = svgEl('text', {
    x: start.x - 66,
    y: start.y + 4,
    'text-anchor': 'end',
    class: 'g-start-label',
  })
  startLabel.textContent = 'start'
  svg.append(startLabel)

  for (const state of model.dfa.states) {
    const point = positions[state.id]
    const classes = ['g-node']
    if (state.accepting) classes.push('is-accept')
    if (active.has(state.id)) classes.push('is-active')
    if (blockedId === state.id) classes.push('is-blocked')

    const group = svgEl('g', { class: classes.join(' ') })
    const title = svgEl('title')
    title.textContent = `状态 ${state.name}，NFA 集合 {${state.set.join(', ')}}${state.accepting ? '，接受状态' : ''}`
    group.append(title)

    const halo = svgEl('circle', {
      cx: point.x,
      cy: point.y,
      r: NODE_R + 9,
      fill: 'transparent',
    })
    group.append(halo)
    group.append(svgEl('circle', { cx: point.x, cy: point.y, r: NODE_R, class: 'g-circle' }))
    if (state.accepting) {
      group.append(svgEl('circle', { cx: point.x, cy: point.y, r: NODE_R - 6, class: 'g-inner' }))
    }
    const text = svgEl('text', {
      x: point.x,
      y: point.y + 4.5,
      'text-anchor': 'middle',
    })
    text.textContent = state.name
    group.append(text)
    svg.append(group)
  }

  const activeNames = [...active].map((id) => stateName(id)).join('、')
  svg.setAttribute(
    'aria-label',
    `DFA 状态图，共 ${model.dfa.states.length} 个状态；当前 ${activeNames || '无'}`,
  )
}

function stepOnce() {
  if (!model.sim || atEnd()) return
  model.step += 1
  renderAll()
  if (atEnd()) stopTimer()
}

function startRun() {
  if (!model.sim) return
  stopTimer()
  model.timer = setInterval(() => {
    if (atEnd()) {
      stopTimer()
      renderAll()
      return
    }
    model.step += 1
    renderAll()
    if (atEnd()) {
      stopTimer()
      renderAll()
    }
  }, 600)
  renderButtons()
}

function toggleRun() {
  if (!model.sim) return
  if (model.timer !== null) {
    stopTimer()
    renderButtons()
    return
  }
  if (atEnd()) {
    model.step = 0
    renderAll()
  }
  startRun()
}

function resetSim() {
  stopTimer()
  if (!model.sim) return
  model.step = 0
  renderAll()
}

els.regex.addEventListener('input', () => {
  model.source = els.regex.value
  compileNow()
})

els.word.addEventListener('input', updateWord)

els.word.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return
  event.preventDefault()
  if (!atEnd()) stepOnce()
})

document.querySelectorAll('.preset').forEach((button) => {
  button.addEventListener('click', () => {
    els.regex.value = button.dataset.re
    els.word.value = button.dataset.w
    model.source = els.regex.value
    model.word = els.word.value
    compileNow()
  })
})

els.step.addEventListener('click', stepOnce)
els.run.addEventListener('click', toggleRun)
els.reset.addEventListener('click', resetSim)

const params = new URLSearchParams(location.search)
if (params.has('re')) els.regex.value = params.get('re')
if (params.has('w')) els.word.value = params.get('w')
model.source = els.regex.value
model.word = els.word.value

renderAll()
compileNow()
