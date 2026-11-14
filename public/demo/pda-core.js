/**
 * PDA / DPDA 核心：三台只读预设 + 单步模拟。
 *
 * 约定：
 * - 栈底符号是 $，初始栈只有它。
 * - 输入末尾自动补结束标记 ⊣，把「输入结束」变成一个可读符号；
 *   DPDA 因此可以严格满足「每步最多一个动作」。
 * - 读完整串（含 ⊣）后停在接受状态才算接受。
 * - top: 'ε' 表示不检查栈顶、也不弹栈（对应笔记里的「任意」）。
 * - push 是弹栈之后压入的串，第一个字符成为新的栈顶。
 */
(function (global) {
'use strict'

const END = '⊣'
const MAX_STEPS = 120
const MAX_CONFIGS = 200

const MACHINES = [
  {
    id: 'zeros',
    name: '0ⁿ1ⁿ',
    kind: 'DPDA',
    word: '0011',
    alphabet: ['0', '1'],
    states: ['q0', 'q1', 'q2'],
    start: 'q0',
    accept: ['q2'],
    bottom: '$',
    note: '0 全部压栈；遇到 1 开始弹。末尾读 ⊣，弹出栈底 $ 后进入 q2。',
    transitions: [
      { from: 'q0', read: '0', top: 'ε', to: 'q0', push: '0' },
      { from: 'q0', read: '1', top: '0', to: 'q1', push: '' },
      { from: 'q1', read: '1', top: '0', to: 'q1', push: '' },
      { from: 'q0', read: END, top: '$', to: 'q2', push: '' },
      { from: 'q1', read: END, top: '$', to: 'q2', push: '' },
    ],
  },
  {
    id: 'paren',
    name: '括号匹配',
    kind: 'DPDA',
    word: '(())',
    alphabet: ['(', ')'],
    states: ['q0', 'q1'],
    start: 'q0',
    accept: ['q1'],
    bottom: '$',
    note: '左括号压 A，右括号弹 A；读 ⊣ 时栈顶必须是 $，否则卡住。',
    transitions: [
      { from: 'q0', read: '(', top: 'ε', to: 'q0', push: 'A' },
      { from: 'q0', read: ')', top: 'A', to: 'q0', push: '' },
      { from: 'q0', read: END, top: '$', to: 'q1', push: '' },
    ],
  },
  {
    id: 'pal',
    name: '偶数回文',
    kind: 'NPDA',
    word: '0110',
    alphabet: ['0', '1'],
    states: ['q0', 'q1', 'q2'],
    start: 'q0',
    accept: ['q2'],
    bottom: '$',
    note: '在任意位置猜中点：q0 压栈，ε 转到 q1 开始弹；只有完全配对的分支能读到 ⊣。',
    transitions: [
      { from: 'q0', read: '0', top: 'ε', to: 'q0', push: 'A' },
      { from: 'q0', read: '1', top: 'ε', to: 'q0', push: 'B' },
      { from: 'q0', read: 'ε', top: 'ε', to: 'q1', push: '' },
      { from: 'q1', read: '0', top: 'A', to: 'q1', push: '' },
      { from: 'q1', read: '1', top: 'B', to: 'q1', push: '' },
      { from: 'q1', read: END, top: '$', to: 'q2', push: '' },
    ],
  },
]

function keyOf(config) {
  return `${config.state}|${config.stack.join(' ')}|${config.index}`
}

function applicable(machine, config, symbol) {
  const top = config.stack.length > 0 ? config.stack[config.stack.length - 1] : null
  return machine.transitions.filter(
    (t) => (t.read === 'ε' || t.read === symbol) && (t.top === 'ε' || t.top === top),
  )
}

function applyTransition(config, transition) {
  const stack = config.stack.slice()
  if (transition.top !== 'ε') stack.pop()
  for (let i = transition.push.length - 1; i >= 0; i--) stack.push(transition.push[i])
  return {
    state: transition.to,
    stack,
    index: config.index + (transition.read === 'ε' ? 0 : 1),
  }
}

function dedupe(configs) {
  const seen = new Map()
  for (const config of configs) {
    const key = keyOf(config)
    if (!seen.has(key)) seen.set(key, config)
  }
  return [...seen.values()]
}

function isAccepting(machine, config, inputLength) {
  return config.index === inputLength && machine.accept.includes(config.state)
}

function simulatePDA(machine, word) {
  const input = [...word, END]
  let current = [{ state: machine.start, stack: [machine.bottom], index: 0 }]
  const steps = [{ configs: current, accepted: false, dead: false }]
  let accepted = false

  for (let step = 0; step < MAX_STEPS; step++) {
    const next = []
    for (const config of current) {
      for (const transition of applicable(machine, config, input[config.index])) {
        next.push(applyTransition(config, transition))
      }
    }

    const unique = dedupe(next)
    if (unique.length === 0) {
      steps.push({ configs: [], accepted: false, dead: true })
      break
    }
    if (unique.length > MAX_CONFIGS) {
      throw new Error(`分支超过 ${MAX_CONFIGS} 条，换一个短一点的串`)
    }

    accepted = unique.some((config) => isAccepting(machine, config, input.length))
    if (accepted) {
      steps.push({ configs: unique, accepted: true, dead: false })
      break
    }

    const signature = unique.map(keyOf).sort().join(';')
    const previous = current.map(keyOf).sort().join(';')
    if (signature === previous) {
      steps.push({ configs: [], accepted: false, dead: true })
      break
    }

    steps.push({ configs: unique, accepted: false, dead: false })
    current = unique
  }

  if (!accepted && !steps[steps.length - 1].dead) {
    steps[steps.length - 1].limit = true
  }

  return { steps, accepted, input, wordLength: word.length }
}

global.PDA = { END, MACHINES, simulatePDA }
})(typeof globalThis !== 'undefined' ? globalThis : window)
