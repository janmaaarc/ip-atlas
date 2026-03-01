import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { GeoData } from '../types'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export default function SharedResultPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<GeoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/shared/${token}`)
        if (res.status === 404) {
          setError('This shared link has expired or does not exist.')
          return
        }
        if (!res.ok) throw new Error('Failed to load shared result')
        const json = await res.json()
        setData(json.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }

    if (token) load()
  }, [token])

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-stone-800 dark:text-zinc-100">IP Atlas</h1>
          <p className="text-sm text-stone-500 dark:text-zinc-400">Shared Geolocation Result</p>
        </div>

        {loading && (
          <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-6 animate-pulse">
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
        )}

        {error && (
          <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 text-stone-300 dark:text-zinc-600 mx-auto mb-2">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <p className="text-stone-600 dark:text-zinc-400 text-sm">{error}</p>
          </div>
        )}

        {data && (
          <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 sm:p-6 shadow-sm">
            <h2 className="text-base sm:text-lg font-semibold text-stone-800 dark:text-zinc-100 mb-4">Geolocation Info</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
              <div className="col-span-2 sm:col-span-3">
                <span className="text-[11px] sm:text-xs font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wide">IP Address</span>
                <div className="mt-1 inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-lg px-3 py-1.5">
                  <p className="text-stone-800 dark:text-zinc-100 font-mono text-base sm:text-lg font-semibold">{data.ip}</p>
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
                <p className="text-stone-800 dark:text-zinc-200 font-medium text-sm sm:text-base mt-0.5">{data.loc || 'N/A'}</p>
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
        )}

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Try IP Atlas yourself
          </Link>
        </div>
      </div>
    </div>
  )
}
