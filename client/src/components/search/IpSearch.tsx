import { useState, useRef, type FormEvent } from 'react'
import { useAutoSuggest } from '../../hooks/useAutoSuggest'

interface Props {
  onSearch: (ip: string) => void
  loading: boolean
  recentIps?: string[]
  onMyLocation?: () => void
  locationLoading?: boolean
}

function isValidIp(ip: string) {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every(p => {
    const n = Number(p)
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p
  })
}

export default function IpSearch({ onSearch, loading, recentIps = [], onMyLocation, locationLoading }: Props) {
  const [ip, setIp] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const { suggestions, activeIndex, selected, onKeyDown, updateQuery, close } = useAutoSuggest(recentIps)

  function submitIp(value: string) {
    setError('')
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Please enter an IP address')
      return
    }
    if (!isValidIp(trimmed)) {
      setError('Invalid IP address (e.g. 8.8.8.8)')
      return
    }
    close()
    onSearch(trimmed)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (selected) {
      setIp(selected)
      close()
      submitIp(selected)
    } else {
      submitIp(ip)
    }
  }

  function handleChange(val: string) {
    setIp(val)
    setError('')
    updateQuery(val)
  }

  function selectSuggestion(s: string) {
    setIp(s)
    close()
    submitIp(s)
    inputRef.current?.focus()
  }

  return (
    <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 sm:p-6 shadow-sm">
      <h2 className="text-base sm:text-lg font-semibold text-stone-800 dark:text-zinc-100 mb-3 sm:mb-4">Search IP Address</h2>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={ip}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => setTimeout(close, 150)}
            placeholder="e.g. 8.8.8.8"
            aria-label="IP address"
            aria-haspopup="listbox"
            aria-expanded={suggestions.length > 0}
            aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
            autoComplete="off"
            className="w-full border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-stone-900 dark:text-zinc-100 rounded-lg pl-3 sm:pl-4 pr-8 py-2.5 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none placeholder:text-stone-400 dark:placeholder:text-zinc-500"
          />
          {ip.length > 0 && (
            <button
              type="button"
              onClick={() => { setIp(''); setError(''); close(); inputRef.current?.focus() }}
              aria-label="Clear input"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
          {suggestions.length > 0 && (
            <ul role="listbox" className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-700 border border-stone-200 dark:border-zinc-600 rounded-lg shadow-lg overflow-hidden">
              {suggestions.map((s, i) => (
                <li
                  key={s}
                  id={`suggestion-${i}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onMouseDown={() => selectSuggestion(s)}
                  className={`px-3 sm:px-4 py-2 text-sm font-mono cursor-pointer ${
                    i === activeIndex
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-stone-700 dark:text-zinc-200 hover:bg-stone-50 dark:hover:bg-zinc-600'
                  }`}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex gap-2 sm:gap-3">
          {onMyLocation && (
            <button
              type="button"
              onClick={onMyLocation}
              disabled={locationLoading}
              title="My Location"
              aria-label="Detect my location"
              className="border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-stone-600 dark:text-zinc-300 rounded-lg px-2.5 py-2.5 hover:bg-stone-50 dark:hover:bg-zinc-700 hover:text-stone-800 dark:hover:text-zinc-100 disabled:opacity-50 transition inline-flex items-center justify-center"
            >
              {locationLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0ZM10 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="flex-1 sm:flex-none bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg px-4 sm:px-5 py-2.5 hover:bg-blue-700 disabled:opacity-50 transition inline-flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Searching' : 'Search'}
          </button>
        </div>
      </form>
      {error && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div aria-live="polite" className="sr-only">
        {suggestions.length > 0 ? `${suggestions.length} suggestion${suggestions.length > 1 ? 's' : ''} available` : ''}
      </div>
    </div>
  )
}
