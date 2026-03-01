import { useState, useEffect, useCallback } from 'react'
import api from '../../lib/api'
import type { AnalyticsData } from '../../types'
import StatCard from './StatCard'
import CountryChart from './CountryChart'
import OrgChart from './OrgChart'
import TrendChart from './TrendChart'

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data: res } = await api.get('/api/analytics')
      setData(res.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-stone-200 dark:bg-zinc-700" />
                <div className="space-y-1.5">
                  <div className="h-6 bg-stone-200 dark:bg-zinc-700 rounded w-16" />
                  <div className="h-3 bg-stone-100 dark:bg-zinc-600 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-stone-200 dark:bg-zinc-700 rounded w-32 mb-4" />
              <div className="h-48 bg-stone-100 dark:bg-zinc-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-6 text-center">
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={load}
          className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Searches"
          value={data.summary.totalSearches}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          label="Unique IPs"
          value={data.summary.uniqueIps}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M4.632 3.533A2 2 0 016.577 2h6.846a2 2 0 011.945 1.533l1.976 8.234A3.489 3.489 0 0016 11.5H4c-.476 0-.93.095-1.344.267l1.976-8.234z" />
              <path fillRule="evenodd" d="M4 13a2 2 0 100 4h12a2 2 0 100-4H4zm11.24 2a.75.75 0 01.75-.75H16a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75V15zm-2.25-.75a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75H13a.75.75 0 00.75-.75V15a.75.75 0 00-.75-.75h-.01z" clipRule="evenodd" />
            </svg>
          }
        />
        <StatCard
          label="Countries"
          value={data.summary.uniqueCountries}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
            </svg>
          }
        />
      </div>

      <TrendChart data={data.searchTrend} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CountryChart data={data.countryCounts} />
        <OrgChart data={data.orgCounts} />
      </div>
    </div>
  )
}
