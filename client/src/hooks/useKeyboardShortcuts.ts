import { useEffect } from 'react'

interface Shortcut {
  key: string
  handler: () => void
  condition?: boolean
  metaKey?: boolean
  global?: boolean
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

      for (const s of shortcuts) {
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase()
        const metaMatch = s.metaKey ? (e.metaKey || e.ctrlKey) : true
        const conditionMatch = s.condition === undefined || s.condition
        const canFire = s.global || !isInput

        if (keyMatch && metaMatch && conditionMatch && canFire) {
          e.preventDefault()
          s.handler()
          return
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcuts])
}
