import { useState, useRef, type FormEvent } from 'react'
import type { FavoriteIp } from '../../types'

interface Props {
  favorites: FavoriteIp[]
  onSelect: (ip: string) => void
  onRemove: (id: string) => void
  onUpdateLabel?: (id: string, label: string | null) => void
  onBulkDelete?: (ids: string[]) => void
}

export default function FavoritesList({ favorites, onSelect, onRemove, onUpdateLabel, onBulkDelete }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)

  function toggle(id: string) {
    const next = new Set(checked)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setChecked(next)
  }

  function toggleAll() {
    if (checked.size === favorites.length) {
      setChecked(new Set())
    } else {
      setChecked(new Set(favorites.map(f => f.id)))
    }
  }

  function handleBulkDelete() {
    onBulkDelete?.([...checked])
    setChecked(new Set())
  }

  function startEdit(fav: FavoriteIp) {
    setEditingId(fav.id)
    setEditValue(fav.label || '')
  }

  function submitEdit(e: FormEvent) {
    e.preventDefault()
    if (editingId) {
      onUpdateLabel?.(editingId, editValue.trim() || null)
      setEditingId(null)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-semibold text-stone-800 dark:text-zinc-100 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5 text-yellow-500 shrink-0">
            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
          </svg>
          Favorites
          {favorites.length > 0 && (
            <span className="text-xs font-normal text-stone-400 dark:text-zinc-500">({favorites.length})</span>
          )}
        </h2>
        {checked.size > 0 && onBulkDelete && (
          <button
            onClick={handleBulkDelete}
            className="bg-red-600 text-white text-xs font-medium rounded-lg px-2.5 py-1 hover:bg-red-700 transition"
          >
            Delete ({checked.size})
          </button>
        )}
      </div>
      {favorites.length === 0 ? (
        <div className="py-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-stone-300 dark:text-zinc-600 mx-auto mb-2">
            <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
          </svg>
          <p className="text-stone-400 dark:text-zinc-500 text-sm">No favorites yet</p>
          <p className="text-stone-400 dark:text-zinc-500 text-xs mt-1">Click the star on any IP to bookmark it</p>
        </div>
      ) : (
        <>
          {onBulkDelete && (
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-stone-100 dark:border-zinc-700">
              <input
                type="checkbox"
                id="select-all-favs"
                checked={checked.size === favorites.length && favorites.length > 0}
                onChange={toggleAll}
                className="w-4 h-4 rounded border-stone-300 dark:border-zinc-600"
              />
              <label htmlFor="select-all-favs" className="text-xs text-stone-500 dark:text-zinc-400">
                Select all
              </label>
            </div>
          )}
          <ul className="space-y-1">
            {favorites.map(fav => (
              <li
                key={fav.id}
                className="flex items-center gap-2 p-2 sm:p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-700/50 group"
              >
                {onBulkDelete && (
                  <input
                    type="checkbox"
                    checked={checked.has(fav.id)}
                    onChange={() => toggle(fav.id)}
                    aria-label={`Select ${fav.ipAddress}`}
                    className="w-4 h-4 rounded border-stone-300 dark:border-zinc-600 shrink-0"
                  />
                )}
                {editingId === fav.id ? (
                  <form onSubmit={submitEdit} className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      maxLength={50}
                      placeholder="Add label..."
                      className="flex-1 text-xs border border-stone-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-stone-900 dark:text-zinc-100 rounded px-2 py-1 focus:border-blue-500 outline-none placeholder:text-stone-400 dark:placeholder:text-zinc-500"
                      onKeyDown={e => { if (e.key === 'Escape') setEditingId(null) }}
                      autoFocus
                    />
                    <button type="submit" className="text-xs text-blue-600 dark:text-blue-400 hover:underline shrink-0">Save</button>
                  </form>
                ) : (
                  <>
                    <button
                      onClick={() => onSelect(fav.ipAddress)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <span className="font-mono text-xs sm:text-sm font-medium text-stone-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {fav.ipAddress}
                      </span>
                      {fav.label && (
                        <span className="ml-2 text-[11px] sm:text-xs text-stone-400 dark:text-zinc-500">
                          {fav.label}
                        </span>
                      )}
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      {onUpdateLabel && (
                        <button
                          onClick={() => startEdit(fav)}
                          aria-label={`Edit label for ${fav.ipAddress}`}
                          className="text-stone-300 dark:text-zinc-600 hover:text-blue-500 dark:hover:text-blue-400 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => onRemove(fav.id)}
                        aria-label={`Remove ${fav.ipAddress} from favorites`}
                        className="text-stone-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
