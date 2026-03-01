import { useCallback } from 'react'
import { useToast } from '../components/ui/Toast'

export function useClipboard() {
  const { showToast } = useToast()

  const copy = useCallback(async (text: string, label = 'Value') => {
    try {
      await navigator.clipboard.writeText(text)
      showToast(`${label} copied`, 'success')
    } catch {
      showToast('Failed to copy')
    }
  }, [showToast])

  return copy
}
