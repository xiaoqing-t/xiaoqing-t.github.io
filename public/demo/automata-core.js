(function (global) {
'use strict'

/**
 * 自动机核心：正则解析 → Thompson NFA → 子集构造 DFA → 单步模拟。
 * 纯函数，不碰 DOM，方便用 node --test 直接测。
 *
 * 支持的语法：字母（任意字符）、连接、|、*、+、?、括号、\ 转义。
 * 不支持的写法（.、字符类等）会报错，而不是悄悄按普通字符处理。
 */

const MAX_DFA_STATES = 16
const MAX_NFA_STATES = 160
const EPSILON = 'ε'

class RegexSyntaxError extends Error {
  constructor(message, position) {
    super(message)
    this.name = 'RegexSyntaxError'
    this.position = position
  }
}

class AutomatonError extends Error {
  constructor(message) {
    super(message)
    this.name = 'AutomatonError'
  }
}

class Parser {
  constructor(source) {
    this.source = source
    this.i = 0
  }

  peek() {
    return this.source[this.i]
  }

  take() {
    return this.source[this.i++]
  }

  fail(message) {
    throw new RegexSyntaxError(message, this.i)
  }

  parse() {
    const node = this.parseAlt()
    if (this.i < this.source.length) {
      this.fail(`无法解析的字符 "${this.peek()}"`)
    }
    return node ?? { type: 'epsilon' }
  }

  parseAlt() {
    let left = this.parseConcat()
    while (this.peek() === '|') {
      if (left === null) this.fail('| 左边缺少表达式')
      this.take()
      const right = this.parseConcat()
      if (right === null) this.fail('| 右边缺少表达式')
      left = { type: 'alt', left, right }
    }
    return left
  }

  parseConcat() {
    const parts = []
    while (this.i < this.source.length && this.peek() !== '|' && this.peek() !== ')') {
      parts.push(this.parseRepeat())
    }
    if (parts.length === 0) return null
    return parts.reduce((left, right) => ({ type: 'concat', left, right }))
  }

  parseRepeat() {
    let node = this.parseAtom()
    for (;;) {
      const c = this.peek()
      if (c !== '*' && c !== '+' && c !== '?') break
      this.take()
      node = { type: c === '*' ? 'star' : c === '+' ? 'plus' : 'opt', node }
    }
    return node
  }

  parseAtom() {
    const c = this.peek()
    if (c === undefined) this.fail('表达式不完整')
    if (c === '(') {
      this.take()
      const inner = this.parseAlt()
      if (inner === null) this.fail('空括号')
      if (this.peek() !== ')') this.fail('缺少右括号')
      this.take()
      return inner
    }
    if (c === ')') this.fail('多余的右括号')
    if (c === '|') this.fail('| 左边缺少表达式')
    if (c === '*' || c === '+' || c === '?') this.fail(`"${c}" 前面缺少表达式`)
    if (c === '\\') {
      this.take()
      const escaped = this.take()
      if (escaped === undefined) this.fail('转义符后面缺少字符')
      return { type: 'char', value: escaped }
    }
    if ('.^$[]{}'.includes(c)) {
      this.fail(`暂不支持 "${c}"，请用字母、连接、|、*、+、? 和括号`)
    }
    this.take()
    return { type: 'char', value: c }
  }
}

function parseRegex(source) {
  return new Parser(source).parse()
}

function buildNFA(ast) {
  const states = []
  const transitions = []

  const addState = () => {
    states.push({ id: states.length, accepting: false })
    return states.length - 1
  }
  const addEdge = (from, symbol, to) => transitions.push({ from, symbol, to })

  function fragment(node) {
    switch (node.type) {
      case 'char': {
        const start = addState()
        const accept = addState()
        addEdge(start, node.value, accept)
        return { start, accept }
      }
      case 'epsilon': {
        const start = addState()
        const accept = addState()
        addEdge(start, EPSILON, accept)
        return { start, accept }
      }
      case 'concat': {
        const left = fragment(node.left)
        const right = fragment(node.right)
        addEdge(left.accept, EPSILON, right.start)
        return { start: left.start, accept: right.accept }
      }
      case 'alt': {
        const start = addState()
        const accept = addState()
        const left = fragment(node.left)
        const right = fragment(node.right)
        addEdge(start, EPSILON, left.start)
        addEdge(start, EPSILON, right.start)
        addEdge(left.accept, EPSILON, accept)
        addEdge(right.accept, EPSILON, accept)
        return { start, accept }
      }
      case 'star': {
        const start = addState()
        const accept = addState()
        const body = fragment(node.node)
        addEdge(start, EPSILON, body.start)
        addEdge(start, EPSILON, accept)
        addEdge(body.accept, EPSILON, body.start)
        addEdge(body.accept, EPSILON, accept)
        return { start, accept }
      }
      case 'plus': {
        const start = addState()
        const accept = addState()
        const body = fragment(node.node)
        addEdge(start, EPSILON, body.start)
        addEdge(body.accept, EPSILON, body.start)
        addEdge(body.accept, EPSILON, accept)
        return { start, accept }
      }
      case 'opt': {
        const start = addState()
        const accept = addState()
        const body = fragment(node.node)
        addEdge(start, EPSILON, body.start)
        addEdge(start, EPSILON, accept)
        addEdge(body.accept, EPSILON, accept)
        return { start, accept }
      }
      default:
        throw new AutomatonError(`未知的语法节点：${node.type}`)
    }
  }

  const root = fragment(ast)
  states[root.accept].accepting = true

  if (states.length > MAX_NFA_STATES) {
    throw new AutomatonError(`正则太长：NFA 超过 ${MAX_NFA_STATES} 个状态`)
  }

  return { states, transitions, start: root.start, accept: root.accept, alphabet: alphabetOf(transitions) }
}

function alphabetOf(transitions) {
  const symbols = new Set()
  for (const t of transitions) {
    if (t.symbol !== EPSILON) symbols.add(t.symbol)
  }
  return [...symbols].sort()
}

function indexTransitions(transitions) {
  const epsilon = new Map()
  const moves = new Map()
  for (const t of transitions) {
    const target = t.symbol === EPSILON ? epsilon : moves
    const bySymbol = target.get(t.from) ?? new Map()
    const list = bySymbol.get(t.symbol) ?? []
    list.push(t.to)
    bySymbol.set(t.symbol, list)
    target.set(t.from, bySymbol)
  }
  return { epsilon, moves }
}

function epsilonClosure(seeds, epsilon) {
  const seen = new Set(seeds)
  const stack = [...seeds]
  while (stack.length > 0) {
    const state = stack.pop()
    for (const to of epsilon.get(state)?.get(EPSILON) ?? []) {
      if (seen.has(to)) continue
      seen.add(to)
      stack.push(to)
    }
  }
  return [...seen].sort((a, b) => a - b)
}

function move(states, symbol, moves) {
  const seen = new Set()
  for (const state of states) {
    for (const to of moves.get(state)?.get(symbol) ?? []) seen.add(to)
  }
  return [...seen].sort((a, b) => a - b)
}

function determinize(nfa) {
  const { epsilon, moves } = indexTransitions(nfa.transitions)
  const alphabet = nfa.alphabet
  const keyOf = (set) => set.join(',')

  const startSet = epsilonClosure([nfa.start], epsilon)
  const ids = new Map([[keyOf(startSet), 0]])
  const sets = [startSet]
  const queue = [startSet]
  const transitions = []

  while (queue.length > 0) {
    const set = queue.shift()
    const from = ids.get(keyOf(set))

    for (const symbol of alphabet) {
      const next = epsilonClosure(move(set, symbol, moves), epsilon)
      if (next.length === 0) continue

      const key = keyOf(next)
      let to = ids.get(key)
      if (to === undefined) {
        if (sets.length >= MAX_DFA_STATES) {
          throw new AutomatonError(`子集构造超过 ${MAX_DFA_STATES} 个状态，换一条短一点的正则`)
        }
        to = sets.length
        ids.set(key, to)
        sets.push(next)
        queue.push(next)
      }
      transitions.push({ from, symbol, to })
    }
  }

  const states = sets.map((set, id) => ({
    id,
    set,
    accepting: set.includes(nfa.accept),
    name: String.fromCharCode(65 + id),
  }))

  return { states, transitions, alphabet, start: 0, kind: 'dfa' }
}

/**
 * 返回逐步快照。steps[k].index 是“已经成功读掉的字符数”；
 * 卡住时会追加一条 dead 快照，index 停在出错的那个字符上。
 */
function simulateDFA(dfa, input) {
  const steps = [{ index: 0, states: [dfa.start], dead: false }]
  let state = dfa.start

  for (let i = 0; i < input.length; i++) {
    const symbol = input[i]
    const edge = dfa.transitions.find((t) => t.from === state && t.symbol === symbol)
    if (!edge) {
      steps.push({ index: i, states: [], dead: true, symbol, from: state })
      return { steps, accepted: false, blockedAt: i, lastState: state }
    }
    state = edge.to
    steps.push({ index: i + 1, states: [state], dead: false })
  }

  return { steps, accepted: dfa.states[state].accepting, blockedAt: null, lastState: state }
}

function compile(source) {
  const ast = parseRegex(source)
  const nfa = buildNFA(ast)
  const dfa = determinize(nfa)
  return { ast, nfa, dfa }
}

global.AutomataCore = {
  MAX_DFA_STATES,
  RegexSyntaxError,
  AutomatonError,
  parseRegex,
  buildNFA,
  determinize,
  simulateDFA,
  compile,
}
})(typeof globalThis !== 'undefined' ? globalThis : window)
