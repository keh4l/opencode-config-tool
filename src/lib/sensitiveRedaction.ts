const REDACTED = '******'

const normalizeToken = (s: string): string => {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function isSensitivePath(path: string): boolean {
  if (!path) return false

  // Keep original dot-segments so we don't misclassify compound keys like `session_new`.
  const parts = path
    .split('.')
    .map((p) => p.trim())
    .filter(Boolean)
    .map(normalizeToken)

  // NOTE: Keep this conservative to avoid false positives (e.g. keybinds like session_new).
  const contains = (token: string) => parts.some((p) => p.includes(token))
  const equals = (token: string) => parts.some((p) => p === token)

  if (contains('apikey')) return true
  if (contains('token')) return true
  if (contains('secret')) return true
  if (contains('authorization')) return true
  if (contains('password')) return true
  if (contains('privatekey')) return true
  if (contains('accesskey')) return true
  if (equals('session') || equals('sessionid')) return true

  return false
}

export function redactValue(_value: unknown): string {
  // Fixed mask to avoid leaking length/prefix/suffix.
  return REDACTED
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function redactDiff<T extends { path: string; oldValue?: unknown; newValue?: unknown }>(diffItem: T): T {
  if (isSensitivePath(diffItem.path)) {
    return {
      ...diffItem,
      oldValue: diffItem.oldValue === undefined ? undefined : redactValue(diffItem.oldValue),
      newValue: diffItem.newValue === undefined ? undefined : redactValue(diffItem.newValue),
    }
  }

  const redactNested = (value: unknown): unknown => {
    if (Array.isArray(value) || isPlainObject(value)) return redactConfig(value)
    return value
  }

  const nextOld = diffItem.oldValue === undefined ? undefined : redactNested(diffItem.oldValue)
  const nextNew = diffItem.newValue === undefined ? undefined : redactNested(diffItem.newValue)

  if (nextOld === diffItem.oldValue && nextNew === diffItem.newValue) return diffItem
  return { ...diffItem, oldValue: nextOld, newValue: nextNew }
}

type RedactMode = 'redact' | 'remove'

export function redactConfig<T>(config: T, options: { mode?: RedactMode } = {}): T {
  const mode: RedactMode = options.mode || 'redact'

  const walk = (value: unknown, path: string): unknown => {
    if (Array.isArray(value)) {
      return value.map((v, idx) => walk(v, path ? `${path}.${idx}` : String(idx)))
    }

    if (isPlainObject(value)) {
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value)) {
        const nextPath = path ? `${path}.${k}` : k
        if (isSensitivePath(nextPath)) {
          if (mode === 'remove') continue
          out[k] = redactValue(v)
          continue
        }
        out[k] = walk(v, nextPath)
      }
      return out
    }

    return value
  }

  return walk(config as unknown, '') as T
}
