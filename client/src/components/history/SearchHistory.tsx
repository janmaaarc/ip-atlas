import { useState, useMemo } from 'react'
import type { HistoryEntry } from '../../types'
import { exportAsCSV, exportAsJSON } from '../../lib/exportHistory'

function timeAgo(date: string | Date): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

type DatePreset = '7d' | '30d' | 'all'

interface Props {
  history: HistoryEntry[]
  onSelect: (entry: HistoryEntry) => void
  onDelete: (ids: string[]) => void
  deleting: boolean
  loading: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  loadingMore?: boolean
  total?: number
  onDateFilterChange?: (dateFrom: string | undefined, dateTo: string | undefined) => void
}

export default function SearchHistory({ history, onSelect, onDelete, deleting, loading, hasMore, onLoadMore, loadingMore, total, onDateFilterChange }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState('')
  const [datePreset, setDatePreset] = useState<DatePreset>('all')

  const filtered = useMemo(() => {
    if (!filter.trim()) return history
    const q = filter.toLowerCase()
    return history.filter(e =>
      e.ipAddress.includes(q) ||
      (e.geoData.city || '').toLowerCase().includes(q) ||
      (e.geoData.country || '').toLowerCase().includes(q)
    )
  }, [history, filter])

  function toggle(id: string) {
    const next = new Set(checked)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setChecked(next)
  }

  function toggleAll() {
    if (checked.size === filtered.length) {
      setChecked(new Set())
    } else {
      setChecked(new Set(filtered.map(h => h.id)))
    }
  }

  function handleDelete() {
    onDelete([...checked])
    setChecked(new Set())
  }

  function handleDatePreset(preset: DatePreset) {
    setDatePreset(preset)
    const now = new Date()
    if (preset === '7d') {
      const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      onDateFilterChange?.(from.toISOString(), now.toISOString())
    } else if (preset === '30d') {
      const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      onDateFilterChange?.(from.toISOString(), now.toISOString())
    } else {
      onDateFilterChange?.(undefined, undefined)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="h-5 bg-stone-200 dark:bg-zinc-700 rounded w-1/2 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-4 h-4 bg-stone-200 dark:bg-zinc-700 rounded" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-stone-200 dark:bg-zinc-700 rounded w-3/4" />
                <div className="h-3 bg-stone-100 dark:bg-zinc-600 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-semibold text-stone-800 dark:text-zinc-100">
          Search History
          {history.length > 0 && (
            <span className="ml-2 text-xs font-normal text-stone-400 dark:text-zinc-500">
              ({total && total > history.length ? `${history.length} of ${total}` : history.length})
            </span>
          )}
        </h2>
        <div className="flex items-center gap-1.5">
          {checked.size > 0 && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              aria-busy={deleting}
              className="bg-red-600 text-white text-xs font-medium rounded-lg px-2.5 py-1 hover:bg-red-700 disabled:opacity-50 transition"
            >
              Delete ({checked.size})
            </button>
          )}
          {history.length > 0 && (
            <>
              <button
                onClick={() => exportAsCSV(filtered)}
                className="text-[11px] sm:text-xs text-stone-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition px-2 py-1 bg-stone-50 dark:bg-zinc-700/50 rounded-md"
                title="Export as CSV"
              >
                CSV
              </button>
              <button
                onClick={() => exportAsJSON(filtered)}
                className="text-[11px] sm:text-xs text-stone-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition px-2 py-1 bg-stone-50 dark:bg-zinc-700/50 rounded-md"
                title="Export as JSON"
              >
                JSON
              </button>
            </>
          )}
        </div>
      </div>

      {history.length === 0 && datePreset === 'all' ? (
        <div className="py-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-stone-300 dark:text-zinc-600 mx-auto mb-2">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
          </svg>
          <p className="text-stone-400 dark:text-zinc-500 text-sm">No searches yet</p>
          <p className="text-stone-400 dark:text-zinc-500 text-xs mt-1">Your search history will appear here</p>
        </div>
      ) : (
        <>
          <div className="relative mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500 pointer-events-none">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              value={filter}
              onChange={e => { setFilter(e.target.value); setChecked(new Set()) }}
              placeholder="Filter by IP, city, or country..."
              aria-label="Filter history"
              className="w-full border border-stone-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-stone-900 dark:text-zinc-100 rounded-lg pl-9 pr-8 py-2 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none placeholder:text-stone-400 dark:placeholder:text-zinc-500"
            />
            {filter.length > 0 && (
              <button
                onClick={() => { setFilter(''); setChecked(new Set()) }}
                aria-label="Clear filter"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>

          {onDateFilterChange && (
            <div className="flex items-center gap-1.5 mb-3">
              {(['7d', '30d', 'all'] as const).map(preset => (
                <button
                  key={preset}
                  onClick={() => handleDatePreset(preset)}
                  className={`text-xs font-medium rounded-md px-2.5 py-1 transition ${
                    datePreset === preset
                      ? 'bg-blue-600 text-white'
                      : 'bg-stone-50 dark:bg-zinc-700/50 text-stone-500 dark:text-zinc-400 hover:text-blue-500'
                  }`}
                >
                  {preset === '7d' ? '7 days' : preset === '30d' ? '30 days' : 'All'}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-stone-100 dark:border-zinc-700">
            <input
              type="checkbox"
              id="select-all"
              checked={checked.size === filtered.length && filtered.length > 0}
              onChange={toggleAll}
              className="w-4 h-4 rounded border-stone-300 dark:border-zinc-600"
            />
            <label htmlFor="select-all" className="text-xs text-stone-500 dark:text-zinc-400">
              Select all{filter.trim() ? ` (${filtered.length} filtered)` : ''}
            </label>
          </div>

          {filtered.length === 0 ? (
            <p className="text-stone-400 dark:text-zinc-500 text-sm py-4 text-center">No matches</p>
          ) : (
            <ul className="space-y-1 max-h-[60vh] lg:max-h-80 overflow-y-auto -mx-1">
              {filtered.map(entry => (
                <li
                  key={entry.id}
                  className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 mx-1 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-700/50 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={checked.has(entry.id)}
                    onChange={e => { e.stopPropagation(); toggle(entry.id) }}
                    aria-label={`Select ${entry.ipAddress}`}
                    className="w-4 h-4 rounded border-stone-300 dark:border-zinc-600 shrink-0"
                  />
                  <button
                    type="button"
                    className="flex-1 min-w-0 text-left"
                    onClick={() => onSelect(entry)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs sm:text-sm font-medium text-stone-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                        {entry.ipAddress}
                      </span>
                      <span
                        className="text-[11px] sm:text-xs text-stone-500 dark:text-zinc-400 shrink-0"
                        title={new Date(entry.createdAt).toLocaleString()}
                      >
                        {timeAgo(entry.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-zinc-400 truncate mt-0.5">
                      {entry.geoData.city}, {entry.geoData.region}, {entry.geoData.country}
                    </p>
                  </button>
                </li>
              ))}
              {hasMore && !filter.trim() && (
                <li className="pt-2 pb-1 mx-1">
                  <button
                    onClick={onLoadMore}
                    disabled={loadingMore}
                    className="w-full text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium disabled:opacity-50 transition bg-stone-50 dark:bg-zinc-700/50 rounded-lg py-2"
                  >
                    {loadingMore ? 'Loading...' : 'Load more...'}
                  </button>
                </li>
              )}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
