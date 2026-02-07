export function hasPostApplyEdits(current: unknown, applied: unknown | null): boolean {
  if (!applied) return false
  return JSON.stringify(current) !== JSON.stringify(applied)
}
