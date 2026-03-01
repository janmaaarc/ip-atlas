import type { GeoData } from '../../types'
import { useClipboard } from '../../hooks/useClipboard'

interface Props {
  data: GeoData | null
  loading: boolean
  isFavorited?: boolean
  onToggleFavorite?: () => void
  favoriteLoading?: boolean
  onClear?: () => void
  onShare?: () => void
}

function CopyBtn({ text, label }: { text: string; label: string }) {
  const copy = useClipboard()

  return (
    <button
      onClick={() => copy(text, label)}
      aria-label={`Copy ${label}`}
      className="ml-1.5 text-stone-400 dark:text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 transition"
      title={`Copy ${label}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
        <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
      </svg>
    </button>
  )
}

function formatAllGeo(data: GeoData): string {
  return [
    `IP: ${data.ip}`,
    `City: ${data.city || 'N/A'}`,
    `Region: ${data.region || 'N/A'}`,
    `Country: ${data.country || 'N/A'}`,
    `Coords: ${data.loc || 'N/A'}`,
    `Org: ${data.org || 'N/A'}`,
    `Timezone: ${data.timezone || 'N/A'}`,
  ].join('\n')
}

export default function GeoDisplay({ data, loading, isFavorited = false, onToggleFavorite, favoriteLoading = false, onClear, onShare }: Props) {
  const copy = useClipboard()

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 sm:p-6 animate-pulse">
        <div className="h-5 bg-stone-200 dark:bg-zinc-700 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="space-y-1">
              <div className="h-3 bg-stone-100 dark:bg-zinc-700 rounded w-16" />
              <div className="h-4 bg-stone-200 dark:bg-zinc-600 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-stone-800 dark:text-zinc-100">Geolocation Info</h2>
        <div className="flex items-center gap-2">
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              disabled={favoriteLoading}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              className="transition disabled:opacity-50"
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${isFavorited ? 'text-yellow-500' : 'text-stone-300 dark:text-zinc-600 hover:text-yellow-400'}`}>
                <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
              </svg>
            </button>
          )}
          <button
            onClick={() => copy(formatAllGeo(data), 'All info')}
            className="text-xs text-stone-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
              <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
            </svg>
            Copy All
          </button>
          {onShare && (
            <button
              onClick={onShare}
              className="text-xs text-stone-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition flex items-center gap-1"
              title="Share this result"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M13 4.5a2.5 2.5 0 11.702 1.737L6.97 9.604a2.518 2.518 0 010 .792l6.733 3.367a2.5 2.5 0 11-.671 1.341l-6.733-3.367a2.5 2.5 0 110-3.474l6.733-3.367A2.52 2.52 0 0113 4.5z" />
              </svg>
              Share
            </button>
          )}
          {onClear && (
            <button
              onClick={onClear}
              aria-label="Reset to your IP"
              className="text-xs text-stone-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition flex items-center gap-1"
              title="Reset to your IP"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
              Reset
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
        <div className="col-span-2 sm:col-span-3">
          <span className="text-[11px] sm:text-xs font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wide">IP Address</span>
          <div className="mt-1 inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-lg px-3 py-1.5">
            <p className="text-stone-800 dark:text-zinc-100 font-mono text-base sm:text-lg font-semibold flex items-center">
              {data.ip}
              <CopyBtn text={data.ip} label="IP" />
            </p>
          </div>
        </div>
        <div>
          <span className="text-[11px] sm:text-xs font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wide">City</span>
          <p className="text-stone-800 dark:text-zinc-200 font-medium text-sm sm:text-base mt-0.5">{data.city || 'N/A'}</p>
        </div>
        <div>
          <span className="text-[11px] sm:text-xs font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Region</span>
          <p className="text-stone-800 dark:text-zinc-200 font-medium text-sm sm:text-base mt-0.5">{data.region || 'N/A'}</p>
        </div>
        <div>
          <span className="text-[11px] sm:text-xs font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Country</span>
          <p className="text-stone-800 dark:text-zinc-200 font-medium text-sm sm:text-base mt-0.5">{data.country || 'N/A'}</p>
        </div>
        <div>
          <span className="text-[11px] sm:text-xs font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Coords</span>
          <p className="text-stone-800 dark:text-zinc-200 font-medium text-sm sm:text-base mt-0.5 flex items-center">
            {data.loc || 'N/A'}
            {data.loc && <CopyBtn text={data.loc} label="Coordinates" />}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <span className="text-[11px] sm:text-xs font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Organization</span>
          <p className="text-stone-800 dark:text-zinc-200 font-medium text-sm sm:text-base mt-0.5 truncate">{data.org || 'N/A'}</p>
        </div>
        <div>
          <span className="text-[11px] sm:text-xs font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Timezone</span>
          <p className="text-stone-800 dark:text-zinc-200 font-medium text-sm sm:text-base mt-0.5">{data.timezone || 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}
