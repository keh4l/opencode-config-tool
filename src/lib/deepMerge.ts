export type DeepMergeOptions = {
  /** Treat arrays as replace-only (v1 default). */
  arrayStrategy?: 'replace'
  /** If true, `null` in source deletes the key from result. */
  nullDeletes?: boolean
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  )
}

export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
  options: DeepMergeOptions = {}
): T {
  const { arrayStrategy = 'replace', nullDeletes = true } = options
  const out: Record<string, unknown> = { ...target }

  for (const [k, sv] of Object.entries(source)) {
    if (sv === undefined) continue

    if (sv === null && nullDeletes) {
      delete out[k]
      continue
    }

    const tv = (target as Record<string, unknown>)[k]

    if (isPlainObject(tv) && isPlainObject(sv)) {
      out[k] = deepMerge(tv, sv, options)
      continue
    }

    if (Array.isArray(tv) && Array.isArray(sv) && arrayStrategy === 'replace') {
      out[k] = sv
      continue
    }

    out[k] = sv
  }

  return out as T
}
