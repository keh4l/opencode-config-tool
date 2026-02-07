import { redactConfig } from '@/lib/sensitiveRedaction'

export function buildJsonText(raw: unknown, options: { includeSensitive: boolean; formatted: boolean }): string {
  const data = options.includeSensitive ? raw : redactConfig(raw)
  return options.formatted ? JSON.stringify(data, null, 2) : JSON.stringify(data)
}
