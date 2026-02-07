import assert from 'node:assert/strict'

import { configDiff } from '../src/lib/configDiff'
import { importValidator } from '../src/lib/importValidator'
import { hasPostApplyEdits } from '../src/lib/hasPostApplyEdits'
import { isSensitivePath, redactConfig, redactDiff, redactValue } from '../src/lib/sensitiveRedaction'

type TestCase = {
  name: string
  fn: () => void
}

const tests: TestCase[] = []

function test(name: string, fn: () => void) {
  tests.push({ name, fn })
}

function getSingleDiff(diff: ReturnType<typeof configDiff>, type: string, path: string) {
  assert.equal(diff.length, 1)
  assert.equal(diff[0].type, type)
  assert.equal(diff[0].path, path)
  return diff[0]
}

// configDiff
test('configDiff: add root value', () => {
  const diff = configDiff(undefined, 'x')
  const item = getSingleDiff(diff, 'add', '')
  assert.equal(item.newValue, 'x')
})

test('configDiff: remove root value', () => {
  const diff = configDiff('x', undefined)
  const item = getSingleDiff(diff, 'remove', '')
  assert.equal(item.oldValue, 'x')
})

test('configDiff: modify primitive field', () => {
  const diff = configDiff({ a: 1 }, { a: 2 })
  const item = getSingleDiff(diff, 'modify', 'a')
  assert.equal(item.oldValue, 1)
  assert.equal(item.newValue, 2)
})

test('configDiff: add field', () => {
  const diff = configDiff({ a: 1 }, { a: 1, b: 2 })
  const item = getSingleDiff(diff, 'add', 'b')
  assert.equal(item.newValue, 2)
})

test('configDiff: remove field', () => {
  const diff = configDiff({ a: 1, b: 2 }, { a: 1 })
  const item = getSingleDiff(diff, 'remove', 'b')
  assert.equal(item.oldValue, 2)
})

test('configDiff: nested modify path', () => {
  const diff = configDiff({ a: { b: 1 } }, { a: { b: 2 } })
  const item = getSingleDiff(diff, 'modify', 'a.b')
  assert.equal(item.oldValue, 1)
  assert.equal(item.newValue, 2)
})

test('configDiff: arrays treated as modify', () => {
  const diff = configDiff({ a: [1] }, { a: [1, 2] })
  const item = getSingleDiff(diff, 'modify', 'a')
  assert.deepEqual(item.oldValue, [1])
  assert.deepEqual(item.newValue, [1, 2])
})

// importValidator
test('importValidator: empty content is error', () => {
  const res = importValidator('   ')
  assert.equal(res.ok, false)
  assert.equal(res.parsed, null)
  assert.ok(res.jsonError)
})

test('importValidator: invalid JSON yields jsonError', () => {
  const res = importValidator('{\n  "a": 1,\n  \n}')
  assert.equal(res.ok, false)
  assert.equal(res.parsed, null)
  assert.ok(res.jsonError)
  assert.equal(res.issues[0]?.level, 'error')
})

test('importValidator: non-object JSON is error', () => {
  const res = importValidator('[1,2,3]')
  assert.equal(res.ok, false)
  assert.equal(res.parsed, null)
  assert.equal(res.issues[0]?.level, 'error')
})

test('importValidator: unknown top-level key warns (ignores $-keys)', () => {
  const res = importValidator('{"$schema":"x","unknown":1}', { knownTopLevelKeys: ['model'] })
  assert.equal(res.ok, true)
  assert.ok(res.issues.some((i) => i.level === 'warning' && i.path === 'unknown'))
  assert.ok(!res.issues.some((i) => i.path === '$schema' && i.message.includes('未知字段')))
})

test('importValidator: $schema non-string warns', () => {
  const res = importValidator('{"$schema":123,"model":"x"}')
  assert.equal(res.ok, true)
  assert.ok(res.issues.some((i) => i.level === 'warning' && i.path === '$schema'))
})

test('importValidator: sensitive key warning', () => {
  const res = importValidator('{"provider":{"x":{"options":{"apiKey":"sk-123"}}}}')
  assert.equal(res.ok, true)
  assert.ok(res.issues.some((i) => i.level === 'warning' && i.message.includes('敏感')))
})

// hasPostApplyEdits
test('hasPostApplyEdits: no applied snapshot -> false', () => {
  assert.equal(hasPostApplyEdits({ a: 1 }, null), false)
})

test('hasPostApplyEdits: same config -> false', () => {
  assert.equal(hasPostApplyEdits({ a: 1 }, { a: 1 }), false)
})

test('hasPostApplyEdits: different config -> true', () => {
  assert.equal(hasPostApplyEdits({ a: 1, b: 2 }, { a: 1 }), true)
})

// sensitiveRedaction
test('isSensitivePath: typical sensitive paths are detected', () => {
  assert.equal(isSensitivePath('provider.anthropic.options.apiKey'), true)
  assert.equal(isSensitivePath('provider.openai.options.headers.Authorization'), true)
  assert.equal(isSensitivePath('mcp.github.environment.GITHUB_TOKEN'), true)
})

test('isSensitivePath: non-sensitive paths are not misclassified', () => {
  assert.equal(isSensitivePath('model'), false)
  assert.equal(isSensitivePath('keybinds.session_new'), false)
})

test('redactValue: fixed mask does not leak content', () => {
  assert.equal(redactValue('sk-123456'), '******')
  assert.equal(redactValue('Bearer abc.def.ghi'), '******')
})

test('redactDiff: sensitive old/new are redacted', () => {
  const out = redactDiff({
    path: 'provider.x.options.apiKey',
    oldValue: 'sk-old',
    newValue: 'sk-new',
  })
  assert.equal(out.oldValue, '******')
  assert.equal(out.newValue, '******')
})

test('redactDiff: nested sensitive values in objects are redacted', () => {
  const out = redactDiff({
    path: 'provider',
    newValue: { x: { options: { apiKey: 'sk-123' } } },
  })
  const json = JSON.stringify(out.newValue)
  assert.ok(!json.includes('sk-123'))
  assert.ok(json.includes('******'))
})

test('redactConfig: default export redaction does not contain secrets', () => {
  const cfg = {
    provider: {
      x: {
        options: {
          apiKey: 'sk-123',
          baseURL: 'https://api.example.com',
        },
      },
    },
    headers: {
      Authorization: 'Bearer TOPSECRET',
    },
  }
  const out = redactConfig(cfg)
  const json = JSON.stringify(out)
  assert.ok(!json.includes('sk-123'))
  assert.ok(!json.includes('TOPSECRET'))
})

test('JSON 预览/复制：基于 redactConfig 的字符串不包含敏感片段', () => {
  const cfg = {
    provider: {
      openai: {
        options: {
          apiKey: 'sk-live-abcdef',
          headers: {
            Authorization: 'Bearer VERY_SECRET_TOKEN',
          },
        },
      },
    },
    mcp: {
      github: {
        env: {
          GITHUB_TOKEN: 'ghp_1234567890',
        },
      },
    },
    list: [{ token: 't-123' }],
  }
  const json = JSON.stringify(redactConfig(cfg), null, 2)
  assert.ok(!json.includes('sk-live-abcdef'))
  assert.ok(!json.includes('VERY_SECRET_TOKEN'))
  assert.ok(!json.includes('ghp_1234567890'))
  assert.ok(!json.includes('Bearer '))
  assert.ok(json.includes('******'))
})

let passed = 0
for (const t of tests) {
  try {
    t.fn()
    passed += 1
  } catch (err) {
    console.error(`FAIL: ${t.name}`)
    console.error(err)
    process.exitCode = 1
    break
  }
}

if (process.exitCode !== 1) {
  console.log(`OK: ${passed}/${tests.length} smoke checks passed`)
}
