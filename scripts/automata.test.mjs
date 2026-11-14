import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

vm.runInThisContext(
  readFileSync(new URL('../public/demo/automata-core.js', import.meta.url), 'utf8'),
  { filename: 'automata-core.js' },
)

const { AutomatonError, RegexSyntaxError, compile, parseRegex, simulateDFA } = globalThis.AutomataCore

function run(source, word) {
  const { dfa } = compile(source)
  return simulateDFA(dfa, word)
}

function accepts(source, word) {
  return run(source, word).accepted
}

test('(a|b)*abb 的经典语言', () => {
  for (const word of ['abb', 'aababb', 'babb', 'bbabb']) {
    assert.equal(accepts('(a|b)*abb', word), true, word)
  }
  for (const word of ['', 'ab', 'bba', 'abba']) {
    assert.equal(accepts('(a|b)*abb', word), false, word)
  }
})

test('连接与星号', () => {
  assert.equal(accepts('ab*c', 'ac'), true)
  assert.equal(accepts('ab*c', 'abbbc'), true)
  assert.equal(accepts('ab*c', 'ab'), false)
  assert.equal(accepts('ab*c', 'abcc'), false)
})

test('加号至少一次', () => {
  assert.equal(accepts('(ab)+', 'ab'), true)
  assert.equal(accepts('(ab)+', 'abab'), true)
  assert.equal(accepts('(ab)+', ''), false)
  assert.equal(accepts('(ab)+', 'aba'), false)
})

test('问号零次或一次', () => {
  assert.equal(accepts('a?b', 'b'), true)
  assert.equal(accepts('a?b', 'ab'), true)
  assert.equal(accepts('a?b', 'aab'), false)
})

test('并集与空串', () => {
  assert.equal(accepts('a|b', 'a'), true)
  assert.equal(accepts('a|b', 'b'), true)
  assert.equal(accepts('a|b', 'ab'), false)
  assert.equal(accepts('a*', ''), true)
  assert.equal(accepts('a*', 'aaa'), true)
  assert.equal(accepts('a*', 'b'), false)
})

test('空正则表示只接受空串', () => {
  assert.equal(accepts('', ''), true)
  assert.equal(accepts('', 'a'), false)
  const { dfa } = compile('')
  assert.equal(dfa.states.length, 1)
  assert.equal(dfa.states[0].accepting, true)
})

test('转义特殊字符', () => {
  assert.equal(accepts('a\\*b', 'a*b'), true)
  assert.equal(accepts('a\\*b', 'aab'), false)
})

test('字母表按字符排序且去重', () => {
  const { dfa } = compile('ba*')
  assert.deepEqual(dfa.alphabet, ['a', 'b'])
})

test('步数与被读字符数', () => {
  const { steps, accepted } = run('ab', 'ab')
  assert.equal(accepted, true)
  assert.equal(steps.length, 3)
  assert.deepEqual(steps.map((s) => s.index), [0, 1, 2])
})

test('卡住时停在出错的字符上', () => {
  const result = run('ab', 'ac')
  assert.equal(result.accepted, false)
  assert.equal(result.blockedAt, 1)
  const last = result.steps.at(-1)
  assert.equal(last.dead, true)
  assert.equal(last.index, 1)
  assert.equal(last.symbol, 'c')
})

test('语法错误给出位置', () => {
  for (const source of ['a|', '|a', '(a', 'a)', '()', '*a', 'a||b']) {
    assert.throws(() => compile(source), RegexSyntaxError, source)
  }
  try {
    parseRegex('a|')
  } catch (error) {
    assert.equal(error.name, 'RegexSyntaxError')
    assert.equal(typeof error.position, 'number')
  }
})

test('不支持的写法明确报错', () => {
  for (const source of ['.', '[ab]', 'a{2}', '^a', 'a$']) {
    assert.throws(() => compile(source), RegexSyntaxError, source)
  }
})

test('状态爆炸有上限', () => {
  const source = '(a|b)*a(a|b)(a|b)(a|b)(a|b)(a|b)(a|b)'
  assert.throws(() => compile(source), AutomatonError)
})
