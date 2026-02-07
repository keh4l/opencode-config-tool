type Override = boolean | null

const parseBoolean = (raw: string | null): Override => {
  if (raw === null) return null
  const v = raw.trim().toLowerCase()
  if (!v) return null
  if (v === '1' || v === 'true' || v === 'on' || v === 'yes') return true
  if (v === '0' || v === 'false' || v === 'off' || v === 'no') return false
  return null
}

/**
 * URL 参数覆盖（开发者入口）：`?ff_<flagKey>=0|1`
 * - 仅覆盖 UI 行为（不影响配置文件内容）
 * - 优先级高于 localStorage 持久化值
 */
export function getUrlFeatureFlagOverride(flagKey: string): Override {
  if (typeof window === 'undefined') return null
  try {
    const v = new URLSearchParams(window.location.search).get(`ff_${flagKey}`)
    return parseBoolean(v)
  } catch {
    return null
  }
}

export function getEffectiveFeatureFlag(flagKey: string, storedValue: boolean): boolean {
  const override = getUrlFeatureFlagOverride(flagKey)
  return override === null ? storedValue : override
}
