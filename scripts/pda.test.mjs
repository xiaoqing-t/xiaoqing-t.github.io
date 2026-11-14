import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

vm.runInThisContext(
  readFileSync(new URL('../public/demo/pda-core.js', import.meta.url), 'utf8'),
  { filename: 'pda-core.js' },
)

const { END, MACHINES, simulatePDA } = globalThis.PDA
const machine = (id) => MACHINES.find((m) => m.id === id)

function run(id, word) {
  return simulatePDA(machine(id), word)
}

function accepts(id, word) {
  return run(id, word).accepted
}

test('0ⁿ1ⁿ 接受相等数量的 0 和 1', () => {
  for (const word of ['', '01', '0011', '000111']) {
    assert.equal(accepts('zeros', word), true, word)
  }
  for (const word of ['0', '1', '001', '011', '0110', '10']) {
    assert.equal(accepts('zeros', word), false, word)
  }
})

test('0ⁿ1ⁿ 是 DPDA，每步只有一条配置', () => {
  const result = run('zeros', '0011')
  for (const step of result.steps) {
    assert.ok(step.configs.length <= 1)
  }
})

test('括号匹配', () => {
  for (const word of ['', '()', '(())', '()()', '((()))']) {
    assert.equal(accepts('paren', word), true, word)
  }
  for (const word of ['(', ')', '(()', '())', ')(', '(()))']) {
    assert.equal(accepts('paren', word), false, word)
  }
})

test('括号匹配是 DPDA', () => {
  const result = run('paren', '(())')
  for (const step of result.steps) {
    assert.ok(step.configs.length <= 1)
  }
})

test('偶数回文', () => {
  for (const word of ['', '00', '0110', '1001', '0000', '011110']) {
    assert.equal(accepts('pal', word), true, word)
  }
  for (const word of ['0', '01', '011', '010', '0101', '01101']) {
    assert.equal(accepts('pal', word), false, word)
  }
})

test('回文机是非确定的，会出现多条配置', () => {
  const result = run('pal', '0110')
  assert.ok(result.steps.some((step) => step.configs.length > 1))
})

test('结束标记自动补在输入末尾', () => {
  const result = run('zeros', '01')
  assert.equal(result.input.at(-1), END)
  assert.equal(result.input.join(''), `01${END}`)
})

test('卡住的分支会给出 dead 快照', () => {
  const result = run('zeros', '0')
  const last = result.steps.at(-1)
  assert.equal(result.accepted, false)
  assert.equal(last.dead, true)
  assert.equal(last.configs.length, 0)
})

test('非回文不会误接受', () => {
  assert.equal(accepts('pal', '0101'), false)
  assert.equal(accepts('pal', '0110'), true)
})
