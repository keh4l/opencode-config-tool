export type ImportIssueLevel = 'error' | 'warning'

export type ImportIssue = {
  level: ImportIssueLevel
  message: string
  path?: string
}

export type ImportValidationResult<T> = {
  ok: boolean
  parsed: T | null
  jsonError?: string
  issues: ImportIssue[]
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

const positionToLineCol = (raw: string, pos: number): { line: number; col: number } => {
  const upto = raw.slice(0, Math.max(0, Math.min(raw.length, pos)))
  const lines = upto.split(/\r?\n/)
  const line = lines.length
  const col = lines[lines.length - 1].length + 1
  return { line, col }
}

const extractJsonPosition = (message: string): number | null => {
  const m = message.match(/position\s+(\d+)/i)
  if (!m) return null
  const n = Number.parseInt(m[1], 10)
  return Number.isFinite(n) ? n : null
}

const collectSensitiveKeyWarnings = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(collectSensitiveKeyWarnings)
  if (isPlainObject(value)) {
    for (const [k, v] of Object.entries(value)) {
      if (/(api\s*key|apikey|token|secret|password)/i.test(k) && typeof v === 'string' && v.trim()) {
        return true
      }
      if (collectSensitiveKeyWarnings(v)) return true
    }
  }
  return false
}

export function importValidator<T extends Record<string, unknown>>(
  raw: string,
  options: { knownTopLevelKeys?: string[] } = {}
): ImportValidationResult<T> {
  const issues: ImportIssue[] = []

  const trimmed = raw.trim()
  if (!trimmed) {
    issues.push({ level: 'error', message: '内容为空' })
    return { ok: false, parsed: null, jsonError: '内容为空', issues }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'JSON 解析失败'
    const pos = e instanceof Error ? extractJsonPosition(e.message) : null
    const where = typeof pos === 'number' ? positionToLineCol(trimmed, pos) : null
    const jsonError = where ? `JSON 语法错误：第 ${where.line} 行，第 ${where.col} 列附近` : `JSON 语法错误：${msg}`
    issues.push({ level: 'error', message: jsonError })
    return { ok: false, parsed: null, jsonError, issues }
  }

  if (!isPlainObject(parsed)) {
    issues.push({ level: 'error', message: '配置必须是 JSON 对象（object）' })
    return { ok: false, parsed: null, jsonError: '配置必须是 JSON 对象（object）', issues }
  }

  const obj = parsed as Record<string, unknown>

  if (obj.$schema !== undefined && typeof obj.$schema !== 'string') {
    issues.push({ level: 'warning', path: '$schema', message: '$schema 应为字符串（schema URL）' })
  }

  if (options.knownTopLevelKeys && options.knownTopLevelKeys.length > 0) {
    for (const k of Object.keys(obj)) {
      if (k.startsWith('$')) continue
      if (!options.knownTopLevelKeys.includes(k)) {
        issues.push({ level: 'warning', path: k, message: `未知字段：${k}` })
      }
    }
  }

  if (collectSensitiveKeyWarnings(obj)) {
    issues.push({
      level: 'warning',
      message: '检测到可能包含敏感字段（如 apiKey/token/secret）。导入前请确认来源可信。',
    })
  }

  return { ok: true, parsed: obj as T, issues }
}
