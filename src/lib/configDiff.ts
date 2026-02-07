export type DiffType = 'add' | 'remove' | 'modify'

export type DiffItem = {
  type: DiffType
  path: string
  oldValue?: unknown
  newValue?: unknown
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

const isEqualShallow = (a: unknown, b: unknown): boolean => {
  // Conservative: arrays/objects are compared via JSON stringification only when needed.
  // For v1, it's acceptable to treat complex mismatches as modify.
  if (a === b) return true
  const ta = typeof a
  const tb = typeof b
  if (ta !== tb) return false
  if (ta === 'number' && Number.isNaN(a) && Number.isNaN(b)) return true
  return false
}

export function configDiff(current: unknown, next: unknown): DiffItem[] {
  const out: DiffItem[] = []

  const walk = (cur: unknown, nxt: unknown, path: string) => {
    if (isEqualShallow(cur, nxt)) return

    // Added / removed
    if (cur === undefined && nxt !== undefined) {
      out.push({ type: 'add', path, newValue: nxt })
      return
    }
    if (cur !== undefined && nxt === undefined) {
      out.push({ type: 'remove', path, oldValue: cur })
      return
    }

    // Arrays: treat as whole-value modify in v1
    if (Array.isArray(cur) || Array.isArray(nxt)) {
      const curStr = JSON.stringify(cur)
      const nxtStr = JSON.stringify(nxt)
      if (curStr !== nxtStr) {
        out.push({ type: 'modify', path, oldValue: cur, newValue: nxt })
      }
      return
    }

    // Objects
    if (isPlainObject(cur) && isPlainObject(nxt)) {
      const keys = new Set([...Object.keys(cur), ...Object.keys(nxt)])
      for (const k of keys) {
        const childPath = path ? `${path}.${k}` : k
        walk(cur[k], nxt[k], childPath)
      }
      return
    }

    // Primitive modify
    out.push({ type: 'modify', path, oldValue: cur, newValue: nxt })
  }

  walk(current, next, '')
  return out
}
