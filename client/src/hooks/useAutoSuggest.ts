import { useState, useMemo, useCallback } from 'react'

export function useAutoSuggest(allIps: string[]) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [open, setOpen] = useState(false)

  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    return allIps.filter(ip => ip.startsWith(query.trim())).slice(0, 5)
  }, [allIps, query])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev <= 0 ? suggestions.length - 1 : prev - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }, [open, suggestions.length])

  const selected = activeIndex >= 0 ? suggestions[activeIndex] : null

  const updateQuery = useCallback((val: string) => {
    setQuery(val)
    setActiveIndex(-1)
    setOpen(val.trim().length > 0)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    setActiveIndex(-1)
  }, [])

  return { query, suggestions: open ? suggestions : [], activeIndex, selected, onKeyDown, updateQuery, close }
}
