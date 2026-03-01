import { useEffect, useCallback, useRef } from 'react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useDistanceUnit } from '../../hooks/useDistanceUnit'
import ChangePasswordForm from './ChangePasswordForm'
import DeleteAccountSection from './DeleteAccountSection'

interface Props {
  open: boolean
  onClose: () => void
  onAccountDeleted: () => void
}

export default function SettingsModal({ open, onClose, onAccountDeleted }: Props) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { unit, setUnit } = useDistanceUnit()
  useFocusTrap(contentRef, open)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

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

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-md rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 id="settings-title" className="text-lg font-semibold text-stone-800 dark:text-zinc-100">Settings</h2>
            <button
              onClick={onClose}
              className="text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 transition"
              aria-label="Close settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-800 dark:text-zinc-100 mb-3">Display Preferences</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-600 dark:text-zinc-400">Distance unit</span>
              <div className="flex gap-1">
                {(['km', 'mi'] as const).map(u => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    className={`text-xs font-medium rounded-md px-3 py-1.5 transition ${
                      unit === u
                        ? 'bg-blue-600 text-white'
                        : 'bg-stone-100 dark:bg-zinc-700 text-stone-500 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-600'
                    }`}
                  >
                    {u === 'km' ? 'Kilometers' : 'Miles'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-stone-200 dark:border-zinc-700" />

          <ChangePasswordForm onSuccess={onClose} />

          <hr className="border-stone-200 dark:border-zinc-700" />

          <DeleteAccountSection onDeleted={onAccountDeleted} />
        </div>
      </div>
    </div>
  )
}
