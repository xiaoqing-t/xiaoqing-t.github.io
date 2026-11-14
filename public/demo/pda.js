const pdaCore = globalThis.PDA

if (!pdaCore) {
  const box = document.getElementById('build-error')
  box.hidden = false
  box.textContent = 'PDA 核心没有加载成功，请刷新页面。'
  document.getElementById('status').textContent = '脚本加载失败。'
  throw new Error('PDA core is missing')
}

const { END, MACHINES, simulatePDA } = pdaCore
const $ = (id) => document.getElementById(id)
const SVG_NS = 'http://www.w3.org/2000/svg'
const NODE_R = 26

const els = {
  machines: $('machines'),
  word: $('word'),
  kind: $('kind'),
  note: $('machine-note'),
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
  stack: $('stack'),
  branches: $('branches'),
  branchesPanel: $('branches-panel'),
  rulesTable: $('rules-table'),
  buildInfo: $('build-info'),
}

const model = {
  machine: MACHINES[0],
  word: MACHINES[0].word,
  sim: null,
  step: 0,
  selected: 0,
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

function currentStep() {
  return model.sim?.steps[model.step]
}

function currentConfigs() {
  return currentStep()?.configs ?? []
}

function selectedConfig() {
  const configs = currentConfigs()
  return configs[model.selected] ?? configs[0] ?? null
}

function atEnd() {
  return model.sim !== null && model.step >= model.sim.steps.length - 1
}

function isAccepting(config) {
  return (
    config.index === model.sim.input.length && model.machine.accept.includes(config.state)
  )
}

function pickSelection() {
  const step = currentStep()
  if (!step) return
  const configs = step.configs
  if (configs.length === 0) {
    model.selected = 0
    return
  }
  if (step.accepted) {
    const found = configs.findIndex((config) => isAccepting(config))
    model.selected = found >= 0 ? found : 0
  } else {
    model.selected = 0
  }
}

function rebuild() {
  stopTimer()
  model.error = null
  model.sim = null
  model.step = 0
  model.selected = 0

  try {
    model.sim = simulatePDA(model.machine, model.word)
  } catch (error) {
    model.error = error
  }

  pickSelection()
  renderAll()
  updateURL()
}

function updateWord() {
  stopTimer()
  model.word = els.word.value
  model.step = 0
  model.selected = 0
  model.sim = null
  model.error = null
  try {
    model.sim = simulatePDA(model.machine, model.word)
  } catch (error) {
    model.error = error
  }
  pickSelection()
  renderAll()
  updateURL()
}

function updateURL() {
  try {
    const params = new URLSearchParams()
    params.set('m', model.machine.id)
    params.set('w', model.word)
    history.replaceState(null, '', `${location.pathname}?${params}`)
  } catch {
    // file:// 下 replaceState 可能被拒绝，不影响模拟
  }
}

function renderAll() {
  renderError()
  renderMachineMeta()

  if (model.error || !model.sim) {
    clearApp()
    return
  }

  renderStatus()
  renderCurrent()
  renderTape()
  renderStack()
  renderBranches()
  renderGraph()
  renderRules()
  renderButtons()
}

function renderError() {
  if (model.error) {
    els.error.hidden = false
    els.error.textContent = model.error.message ?? '构建失败'
  } else {
    els.error.hidden = true
    els.error.textContent = ''
  }
}

function renderMachineMeta() {
  const { machine } = model
  els.kind.textContent = machine.kind
  els.kind.className = `kind-badge${machine.kind === 'NPDA' ? ' is-npda' : ''}`
  els.note.textContent = machine.note
  document.querySelectorAll('[data-machine]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.machine === machine.id)
  })
}

function clearApp() {
  els.status.textContent = model.error ? '这台机器跑不动，先把输入改短一点。' : '正在构建……'
  els.status.className = 'demo-status is-rejected'
  els.currentState.textContent = '—'
  els.currentState.className = 'now-state'
  els.currentDetail.textContent = '没有可运行的配置。'
  els.accepting.textContent = ''
  els.tape.replaceChildren()
  els.stack.replaceChildren()
  els.branches.replaceChildren()
  els.rulesTable.replaceChildren()
  els.buildInfo.textContent = ''
  els.graph.replaceChildren()
  els.graph.setAttribute('aria-label', '暂无 PDA 状态图')
  els.branchesPanel.hidden = true
  els.step.disabled = true
  els.run.disabled = true
  els.reset.disabled = true
  els.run.textContent = '运行'
}

function renderStatus() {
  const step = currentStep()
  let text = ''
  let tone = ''

  if (step.accepted) {
    const config = currentConfigs().find((c) => isAccepting(c)) ?? currentConfigs()[0]
    text = `接受：${config.state} · 读完 ${model.word.length} 个字符（含 ⊣）`
    tone = 'is-accepted'
  } else if (step.dead) {
    const previous = model.sim.steps[model.step - 1]?.configs ?? []
    const consumedAll = previous.length > 0 && previous.every((c) => c.index === model.sim.input.length)
    text = consumedAll
      ? '读完了，但没有停在接受状态 · 拒绝'
      : previous.length > 1
        ? '所有分支都停住了 · 拒绝'
        : '没有匹配的转移 · 拒绝'
    tone = 'is-rejected'
  } else if (step.limit) {
    text = '到达步数上限，停在当前配置'
    tone = 'is-rejected'
  } else {
    const config = selectedConfig()
    const branch = model.machine.kind === 'DPDA' ? '1 条路径' : `${currentConfigs().length} 条分支`
    let where = ''
    if (config.index >= model.sim.input.length) {
      where = '已读完（含 ⊣）'
    } else if (config.index === model.word.length) {
      where = `已读完 ${model.word.length} 个字符 · 下一个 ⊣`
    } else {
      where = `已读 ${config.index} / ${model.word.length} · 下一个 "${model.sim.input[config.index]}"`
    }
    const lead = model.step === 0 ? '起点' : `第 ${model.step} 步`
    text = `${lead} · ${branch} · ${where} · 当前 ${config.state}`
  }

  els.status.textContent = text
  els.status.className = `demo-status ${tone}`.trim()
}

function renderCurrent() {
  const step = currentStep()
  const config = selectedConfig()

  if (!config) {
    els.currentState.textContent = '—'
    els.currentState.className = 'now-state'
    els.currentDetail.textContent = '没有存活的分支。'
    els.accepting.textContent = `接受状态：${model.machine.accept.join('、')}`
    return
  }

  els.currentState.textContent = config.state
  els.currentState.className = 'now-state'

  const top = config.stack.length > 0 ? config.stack[config.stack.length - 1] : '空'
  const total = model.sim.input.length
  let next = '结束'
  if (config.index < total) {
    const symbol = model.sim.input[config.index]
    next = symbol === END ? '⊣' : `"${symbol}"`
  }
  const status = step.accepted ? '接受分支 · ' : ''
  els.currentDetail.textContent = `${status}栈顶 ${top} · 栈深 ${config.stack.length} · 下一步 ${next}`
  els.accepting.textContent = `接受状态：${model.machine.accept.join('、')} · 栈底 $`
}

function renderTape() {
  const step = currentStep()
  const config = selectedConfig()
  const previous = model.sim.steps[model.step - 1]?.configs ?? []
  const pointer = config?.index ?? previous[0]?.index ?? 0
  const input = model.sim.input

  els.tape.replaceChildren()
  for (let i = 0; i < input.length; i++) {
    const cell = document.createElement('span')
    const classes = ['tape-cell']
    if (i < pointer) classes.push('is-done')
    if (i === pointer && !step.dead) classes.push('is-current')
    if (i === input.length - 1) classes.push('is-endmarker')
    cell.className = classes.join(' ')
    cell.textContent = input[i]
    if (i === input.length - 1) cell.title = '结束标记'
    els.tape.append(cell)
  }

  const shown = Math.min(pointer, model.word.length)
  els.tape.setAttribute(
    'aria-label',
    `输入 ${model.word}，末尾补结束标记；指针在已读 ${shown} 个字符之后`,
  )
}

function renderStack() {
  const config = selectedConfig()
  els.stack.replaceChildren()

  if (!config) {
    const empty = document.createElement('p')
    empty.className = 'stack-empty'
    empty.textContent = '没有存活的配置'
    els.stack.append(empty)
    return
  }
  if (config.stack.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'stack-empty'
    empty.textContent = '∅ 空栈'
    els.stack.append(empty)
    return
  }

  const stack = [...config.stack].reverse()
  stack.forEach((symbol, index) => {
    const cell = document.createElement('span')
    const classes = ['stack-cell']
    if (index === 0) classes.push('is-top')
    if (symbol === model.machine.bottom) classes.push('is-bottom')
    cell.className = classes.join(' ')
    cell.textContent = symbol
    els.stack.append(cell)
  })

  els.stack.setAttribute('aria-label', `栈，从上到下：${stack.join('、')}`)
}

function renderBranches() {
  const isNpda = model.machine.kind === 'NPDA'
  els.branchesPanel.hidden = !isNpda
  if (!isNpda) return

  const configs = currentConfigs()
  els.branches.replaceChildren()

  if (configs.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'branch-note'
    empty.textContent = '没有存活的分支。'
    els.branches.append(empty)
    return
  }

  const limit = 40
  configs.slice(0, limit).forEach((config, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'branch'
    if (index === model.selected) button.classList.add('is-active')
    if (isAccepting(config)) button.classList.add('is-accept')

    const head = document.createElement('span')
    head.textContent =
      `${index + 1}. ${config.state} · 已读 ${Math.min(config.index, model.word.length)}` +
      (isAccepting(config) ? ' · 接受' : '')
    const sub = document.createElement('span')
    sub.className = 'branch-sub'
    sub.textContent = ` · 栈 ${config.stack.length ? config.stack.join('') : '∅'}`
    button.append(head, sub)
    button.addEventListener('click', () => {
      model.selected = index
      renderAll()
    })
    els.branches.append(button)
  })

  if (configs.length > limit) {
    const note = document.createElement('p')
    note.className = 'branch-note'
    note.textContent = `还有 ${configs.length - limit} 条分支未列出。`
    els.branches.append(note)
  }
}

function renderRules() {
  const caption = document.createElement('caption')
  caption.className = 'sr-only'
  caption.textContent = 'PDA 转移规则'
  els.rulesTable.replaceChildren(caption)

  const config = selectedConfig()
  const symbol = config ? model.sim.input[config.index] : undefined
  const top = config && config.stack.length > 0 ? config.stack[config.stack.length - 1] : null

  const thead = document.createElement('thead')
  const headRow = document.createElement('tr')
  for (const label of ['状态', '读入', '栈顶', '动作', '下一状态']) {
    const th = document.createElement('th')
    th.textContent = label
    headRow.append(th)
  }
  thead.append(headRow)

  const tbody = document.createElement('tbody')
  for (const transition of model.machine.transitions) {
    const row = document.createElement('tr')
    const applicable =
      config !== null &&
      transition.from === config.state &&
      (transition.read === 'ε' || transition.read === symbol) &&
      (transition.top === 'ε' || transition.top === top)
    if (applicable) row.className = 'is-next'

    const values = [
      transition.from,
      transition.read === 'ε' ? 'ε' : transition.read,
      transition.top === 'ε' ? '任意' : transition.top,
      actionOf(transition),
      transition.to,
    ]
    for (const value of values) {
      const td = document.createElement('td')
      td.textContent = value
      row.append(td)
    }
    tbody.append(row)
  }

  els.rulesTable.append(thead, tbody)
  els.buildInfo.textContent =
    `${model.machine.states.length} 个状态 · ${model.machine.transitions.length} 条转移 · ` +
    `${model.machine.kind} · 栈底 ${model.machine.bottom}`
}

function actionOf(transition) {
  if (transition.push) {
    return transition.top === 'ε' ? `压 ${transition.push}` : `弹 ${transition.top}，压 ${transition.push}`
  }
  if (transition.top === 'ε') return '空转移'
  return `弹 ${transition.top}`
}

function renderButtons() {
  const available = model.sim !== null && !model.error
  els.step.disabled = !available || atEnd()
  els.run.disabled = !available
  els.reset.disabled = !available
  els.run.textContent = model.timer !== null ? '暂停' : atEnd() ? '重跑' : '运行'
}

function layout(n) {
  const cx = 380
  const cy = 260
  if (n === 1) return [{ x: cx, y: cy }]
  if (n === 2) return [{ x: cx - 130, y: cy }, { x: cx + 130, y: cy }]

  const radius = 155
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
  const marker = svgEl('marker', {
    id: 'pda-arrow',
    markerWidth: 9,
    markerHeight: 9,
    refX: 7,
    refY: 4.5,
    orient: 'auto',
  })
  marker.append(svgEl('path', { d: 'M0,0 L9,4.5 L0,9 z', class: 'g-arrow' }))
  defs.append(marker)
  svg.append(defs)

  const positions = layout(model.machine.states.length)
  const active = new Set(currentConfigs().map((config) => config.state))

  const groups = new Map()
  for (const transition of model.machine.transitions) {
    const key = `${transition.from}|${transition.to}`
    if (!groups.has(key)) groups.set(key, { from: transition.from, to: transition.to, symbols: [] })
    const group = groups.get(key)
    const symbol = transition.read === 'ε' ? 'ε' : transition.read
    if (!group.symbols.includes(symbol)) group.symbols.push(symbol)
  }

  const labels = []
  for (const group of groups.values()) {
    const a = positions[model.machine.states.indexOf(group.from)]
    const b = positions[model.machine.states.indexOf(group.to)]
    const text = group.symbols.join(',')

    if (group.from === group.to) {
      const d =
        `M${a.x - 12} ${a.y - NODE_R + 2} ` +
        `C${a.x - 40} ${a.y - NODE_R - 42} ${a.x + 40} ${a.y - NODE_R - 42} ${a.x + 12} ${a.y - NODE_R + 2}`
      svg.append(svgEl('path', { d, class: 'g-edge', 'marker-end': 'url(#pda-arrow)' }))
      labels.push({ x: a.x, y: a.y - NODE_R - 46, text })
      continue
    }

    const curved = groups.has(`${group.to}|${group.from}`)
    const geometry = edgeGeometry(a, b, curved)
    svg.append(svgEl('path', { d: geometry.d, class: 'g-edge', 'marker-end': 'url(#pda-arrow)' }))
    labels.push({ ...geometry.label, text })
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
      class: 'g-label',
    })
    text.textContent = label.text
    svg.append(text)
  }

  const start = positions[model.machine.states.indexOf(model.machine.start)]
  svg.append(
    svgEl('line', {
      x1: start.x - 62,
      y1: start.y,
      x2: start.x - NODE_R - 5,
      y2: start.y,
      class: 'g-start',
      'marker-end': 'url(#pda-arrow)',
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

  for (const state of model.machine.states) {
    const point = positions[model.machine.states.indexOf(state)]
    const classes = ['g-node']
    if (model.machine.accept.includes(state)) classes.push('is-accept')
    if (active.has(state)) classes.push('is-active')

    const group = svgEl('g', { class: classes.join(' ') })
    const title = svgEl('title')
    title.textContent = `状态 ${state}${model.machine.accept.includes(state) ? '，接受状态' : ''}`
    group.append(title)

    group.append(svgEl('circle', { cx: point.x, cy: point.y, r: NODE_R, class: 'g-circle' }))
    if (model.machine.accept.includes(state)) {
      group.append(svgEl('circle', { cx: point.x, cy: point.y, r: NODE_R - 6, class: 'g-inner' }))
    }
    const text = svgEl('text', { x: point.x, y: point.y + 4.5, 'text-anchor': 'middle' })
    text.textContent = state
    group.append(text)
    svg.append(group)
  }

  const activeNames = [...active].join('、')
  svg.setAttribute(
    'aria-label',
    `PDA 状态图，共 ${model.machine.states.length} 个状态；当前 ${activeNames || '无'}`,
  )
}

function stepOnce() {
  if (!model.sim || atEnd()) return
  model.step += 1
  pickSelection()
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
    pickSelection()
    renderAll()
    if (atEnd()) {
      stopTimer()
      renderAll()
    }
  }, 800)
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
    model.selected = 0
    renderAll()
  }
  startRun()
}

function resetSim() {
  stopTimer()
  if (!model.sim) return
  model.step = 0
  model.selected = 0
  renderAll()
}

els.word.addEventListener('input', updateWord)
els.word.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return
  event.preventDefault()
  if (!atEnd()) stepOnce()
})

document.querySelectorAll('[data-machine]').forEach((button) => {
  button.addEventListener('click', () => {
    const machine = MACHINES.find((item) => item.id === button.dataset.machine)
    if (!machine) return
    model.machine = machine
    model.word = machine.word
    els.word.value = machine.word
    rebuild()
  })
})

els.step.addEventListener('click', stepOnce)
els.run.addEventListener('click', toggleRun)
els.reset.addEventListener('click', resetSim)

const params = new URLSearchParams(location.search)
const requested = MACHINES.find((machine) => machine.id === params.get('m'))
if (requested) model.machine = requested
if (params.has('w')) model.word = params.get('w')
else model.word = model.machine.word
els.word.value = model.word

renderAll()
rebuild()
