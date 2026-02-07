import { useCallback, useRef, useState } from 'react'
import type { ConfirmDialogProps } from '@/components/ConfirmDialog'

export type SensitiveConsentType = 'revealSensitive' | 'copySensitive' | 'exportSensitive'

type ConsentCopy = {
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
}

const CONSENT_KEY_PREFIX = 'config-tool:sensitive-consent:'

const getKey = (type: SensitiveConsentType) => `${CONSENT_KEY_PREFIX}${type}`

export function hasConsent(type: SensitiveConsentType): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.sessionStorage.getItem(getKey(type)) === '1'
  } catch {
    return false
  }
}

export function useSensitiveConsent() {
  const [open, setOpen] = useState(false)
  const pending = useRef<{
    type: SensitiveConsentType
    copy: ConsentCopy
    resolve: (ok: boolean) => void
  } | null>(null)

  const ensureConsent = useCallback((type: SensitiveConsentType, copy: ConsentCopy) => {
    if (hasConsent(type)) return Promise.resolve(true)

    return new Promise<boolean>((resolve) => {
      pending.current = { type, copy, resolve }
      setOpen(true)
    })
  }, [])

  const closeAndResolve = (ok: boolean) => {
    const current = pending.current
    pending.current = null
    setOpen(false)
    if (!current) return

    if (ok && typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(getKey(current.type), '1')
      } catch {
        // ignore
      }
    }

    current.resolve(ok)
  }

  const dialogProps: ConfirmDialogProps = {
    open,
    title: pending.current?.copy.title || '',
    description: pending.current?.copy.description || '',
    confirmLabel: pending.current?.copy.confirmLabel || '继续',
    cancelLabel: pending.current?.copy.cancelLabel || '取消',
    confirmVariant: 'destructive',
    onCancel: () => closeAndResolve(false),
    onConfirm: () => closeAndResolve(true),
  }

  return {
    ensureConsent,
    dialogProps,
  }
}
