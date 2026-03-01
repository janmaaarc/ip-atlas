import { useEffect, useCallback, useRef } from 'react'
import { useFocusTrap } from '../../hooks/useFocusTrap'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  confirmVariant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'default',
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  const contentRef = useRef<HTMLDivElement>(null)
  useFocusTrap(contentRef, open)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onCancel()
  }, [onCancel])

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  const confirmClass = confirmVariant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-blue-600 hover:bg-blue-700 text-white'

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        ref={contentRef}
        className="w-full max-w-sm rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-2xl p-5 sm:p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-base font-semibold text-stone-800 dark:text-zinc-100">{title}</h2>
        <p className="text-sm text-stone-500 dark:text-zinc-400">{message}</p>
        <div className="flex gap-3 justify-end pt-1">
          <button
            onClick={onCancel}
            className="text-sm font-medium rounded-lg px-4 py-2.5 bg-stone-100 dark:bg-zinc-700 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`text-sm font-medium rounded-lg px-4 py-2.5 disabled:opacity-50 transition ${confirmClass}`}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
