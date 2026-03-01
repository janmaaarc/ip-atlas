import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useToast } from '../components/ui/Toast'
import api from '../lib/api'
import axios from 'axios'
import GeoDisplay from '../components/geo/GeoDisplay'
import IpSearch from '../components/search/IpSearch'
import SearchHistory from '../components/history/SearchHistory'
import ThemeToggle from '../components/ui/ThemeToggle'
import SettingsModal from '../components/settings/SettingsModal'
import FavoritesList from '../components/history/FavoritesList'
import BatchIpLookup from '../components/search/BatchIpLookup'
import IpCompare from '../components/search/IpCompare'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import type { GeoData, HistoryEntry, FavoriteIp } from '../types'

const GeoMap = lazy(() => import('../components/geo/GeoMap'))
const AnalyticsDashboard = lazy(() => import('../components/analytics/AnalyticsDashboard'))

function MapSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 sm:p-6 shadow-sm">
      <div className="h-64 sm:h-80 bg-stone-100 dark:bg-zinc-700 rounded-lg animate-pulse" />
    </div>
  )
}

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [geoData, setGeoData] = useState<GeoData | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [historyMeta, setHistoryMeta] = useState<{ total: number; page: number; totalPages: number } | null>(null)
  const [searching, setSearching] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showAllPins, setShowAllPins] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [favorites, setFavorites] = useState<FavoriteIp[]>([])
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'compare' | 'analytics'>('single')
  const [confirmState, setConfirmState] = useState<{ type: 'logout' | 'deleteHistory' | 'deleteFavorites'; ids?: string[] } | null>(null)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [historyFilters, setHistoryFilters] = useState<{ search?: string; dateFrom?: string; dateTo?: string }>({})

  const loadFavorites = useCallback(async () => {
    try {
      const { data } = await api.get('/api/favorites')
      setFavorites(data.data)
    } catch { /* ignore */ }
  }, [])

  const loadHistory = useCallback(async (page = 1) => {
    if (page === 1) setHistoryLoading(true)
    else setLoadingMore(true)
    try {
      const { data } = await api.get('/api/history', { params: { page, limit: 50, ...historyFilters } })
      if (page === 1) {
        setHistory(data.data)
      } else {
        setHistory(prev => [...prev, ...data.data])
      }
      setHistoryMeta(data.meta ? {
        total: data.meta.total,
        page: data.meta.page,
        totalPages: data.meta.total_pages,
      } : null)
    } catch {
      showToast('Could not load search history')
    } finally {
      if (page === 1) setHistoryLoading(false)
      else setLoadingMore(false)
    }
  }, [showToast, historyFilters])

  const filtersRef = useRef(historyFilters)

  useEffect(() => {
    if (filtersRef.current === historyFilters) return
    filtersRef.current = historyFilters
    loadHistory()
  }, [historyFilters, loadHistory])

  const initRef = useRef(false)

  const fetchMyGeo = useCallback(async () => {
    const ipRes = await fetch('https://api.ipify.org?format=json')
    const { ip } = await ipRes.json()
    const { data } = await api.get('/api/geo', { params: { ip } })
    return data.data
  }, [])

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    setLoading(false)
    loadHistory()
    loadFavorites()
  }, [loadHistory, loadFavorites])

  async function handleSearch(ip: string) {
    setSearching(true)
    try {
      const { data } = await api.get('/api/geo', { params: { ip } })
      setGeoData(data.data)
      showToast(`Found ${data.data.city || data.data.country || ip}`, 'success')
      loadHistory()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        showToast(err.response?.data?.error?.message || 'Could not look up that IP')
      } else {
        showToast('Could not look up that IP')
      }
    } finally {
      setSearching(false)
    }
  }

  function handleClearGeo() {
    setGeoData(null)
  }

  async function handleMyLocation() {
    setLoading(true)
    try {
      const geo = await fetchMyGeo()
      setGeoData(geo)
      showToast(`Your IP: ${geo.ip}`, 'success')
    } catch {
      showToast('Could not detect your location')
    } finally {
      setLoading(false)
    }
  }

  function handleHistoryClick(entry: HistoryEntry) {
    setGeoData(entry.geoData)
    setActiveTab('single')
  }

  function handleDeleteHistory(ids: string[]) {
    setConfirmState({ type: 'deleteHistory', ids })
  }

  async function executeDeleteHistory(ids: string[]) {
    setDeleting(true)
    try {
      await api.delete('/api/history', { data: { ids } })
      showToast(`Deleted ${ids.length} item${ids.length > 1 ? 's' : ''}`, 'success')
      loadHistory()
    } catch {
      showToast('Failed to delete history')
    } finally {
      setDeleting(false)
      setConfirmState(null)
    }
  }

  const recentIps = useMemo(() => {
    const seen = new Set<string>()
    return history.reduce<string[]>((acc, e) => {
      if (!seen.has(e.ipAddress)) {
        seen.add(e.ipAddress)
        acc.push(e.ipAddress)
      }
      return acc
    }, [])
  }, [history])

  const hasMore = historyMeta ? historyMeta.page < historyMeta.totalPages : false

  const loadMoreHistory = useCallback(() => {
    if (!historyMeta || !hasMore) return
    loadHistory(historyMeta.page + 1)
  }, [historyMeta, hasMore, loadHistory])

  function handleLogout() {
    setConfirmState({ type: 'logout' })
  }

  async function executeLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const currentFavorite = useMemo(
    () => favorites.find(f => f.ipAddress === geoData?.ip),
    [favorites, geoData?.ip]
  )

  async function handleToggleFavorite() {
    if (!geoData || favoriteLoading) return
    setFavoriteLoading(true)
    try {
      if (currentFavorite) {
        await api.delete(`/api/favorites/${currentFavorite.id}`)
        showToast('Removed from favorites', 'success')
      } else {
        await api.post('/api/favorites', { ipAddress: geoData.ip })
        showToast('Added to favorites', 'success')
      }
      loadFavorites()
    } catch {
      showToast('Failed to update favorites')
    } finally {
      setFavoriteLoading(false)
    }
  }

  async function handleRemoveFavorite(id: string) {
    try {
      await api.delete(`/api/favorites/${id}`)
      showToast('Removed from favorites', 'success')
      loadFavorites()
    } catch {
      showToast('Failed to remove favorite')
    }
  }

  function handleFavoriteSelect(ip: string) {
    handleSearch(ip)
  }

  function handleAccountDeleted() {
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  function handleDateFilterChange(dateFrom: string | undefined, dateTo: string | undefined) {
    setHistoryFilters(prev => ({ ...prev, dateFrom, dateTo }))
  }

  async function handleUpdateFavoriteLabel(id: string, label: string | null) {
    try {
      await api.patch(`/api/favorites/${id}`, { label })
      showToast(label ? 'Label updated' : 'Label removed', 'success')
      loadFavorites()
    } catch {
      showToast('Failed to update label')
    }
  }

  function handleBulkDeleteFavorites(ids: string[]) {
    setConfirmState({ type: 'deleteFavorites', ids })
  }

  async function executeBulkDeleteFavorites(ids: string[]) {
    try {
      await api.delete('/api/favorites/bulk', { data: { ids } })
      showToast(`Deleted ${ids.length} favorite${ids.length > 1 ? 's' : ''}`, 'success')
      loadFavorites()
    } catch {
      showToast('Failed to delete favorites')
    } finally {
      setConfirmState(null)
    }
  }

  async function handleShare() {
    if (!geoData) return
    try {
      const { data } = await api.post('/api/share', { geoData })
      const url = `${window.location.origin}/shared/${data.data.token}`
      try {
        await navigator.clipboard.writeText(url)
        showToast('Link copied! Expires in 24 hours', 'success')
      } catch {
        showToast(`Share link created: ${url}`, 'success')
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        showToast(err.response?.data?.error?.message || 'Failed to create share link')
      } else {
        showToast('Failed to create share link')
      }
    }
  }

  const shortcuts = useMemo(() => [
    {
      key: 'k',
      metaKey: true,
      global: true,
      handler: () => {
        setActiveTab('single')
        setTimeout(() => {
          const input = document.querySelector<HTMLInputElement>('[aria-label="IP address"]')
          input?.focus()
        }, 0)
      },
    },
    {
      key: 'Enter',
      metaKey: true,
      global: true,
      condition: activeTab === 'single',
      handler: () => {
        const form = document.querySelector<HTMLFormElement>('form')
        form?.requestSubmit()
      },
    },
  ], [activeTab])

  useKeyboardShortcuts(shortcuts)

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border-b border-stone-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4.5 h-4.5 text-white">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433a19.695 19.695 0 002.683-2.006c1.9-1.702 3.945-4.211 3.945-7.343a7 7 0 00-14 0c0 3.132 2.045 5.641 3.945 7.343a19.695 19.695 0 002.683 2.006 10.58 10.58 0 00.757.433l.12.064.04.021.013.006.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-stone-800 dark:text-zinc-100">IP Atlas</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-stone-500 dark:text-zinc-400 hidden md:inline max-w-[160px] truncate">
              {user?.email}
            </span>
            <ThemeToggle />
            <button
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className="p-2 rounded-lg text-stone-500 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-700 hover:text-stone-700 dark:hover:text-zinc-200 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.993 6.993 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="bg-stone-100 dark:bg-zinc-700 text-stone-600 dark:text-zinc-300 text-xs sm:text-sm font-medium rounded-lg px-3 sm:px-4 py-2 hover:bg-stone-200 dark:hover:bg-zinc-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-4 sm:gap-x-6 gap-y-4 sm:gap-y-5">
          {/* Left Column — Tabs + Tab Content */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-5 order-1">
            {/* Tab Bar */}
            <div className="flex gap-1 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-1 shadow-sm">
              {(['single', 'batch', 'compare', 'analytics'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className={`flex-1 text-sm font-medium rounded-lg py-3 transition-all ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  {tab === 'single' ? 'Search' : tab === 'batch' ? 'Batch Lookup' : tab === 'compare' ? 'Compare' : 'Analytics'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'single' && (
              <div className="animate-fade-in space-y-4 sm:space-y-5">
                <IpSearch
                  onSearch={handleSearch}
                  loading={searching}
                  recentIps={recentIps}
                  onMyLocation={handleMyLocation}
                  locationLoading={loading}
                />
                <GeoDisplay
                  data={geoData}
                  loading={loading}
                  isFavorited={!!currentFavorite}
                  onToggleFavorite={handleToggleFavorite}
                  favoriteLoading={favoriteLoading}
                  onClear={handleClearGeo}
                  onShare={handleShare}
                />
              </div>
            )}

            {activeTab === 'batch' && (
              <div className="animate-fade-in">
                <BatchIpLookup
                  onSelect={(data) => { setGeoData(data); setActiveTab('single') }}
                  onDone={loadHistory}
                />
              </div>
            )}

            {activeTab === 'compare' && (
              <div className="animate-fade-in">
                <IpCompare
                  onResults={(a) => { setGeoData(a) }}
                />
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="animate-fade-in">
                <Suspense fallback={<div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-6 animate-pulse"><div className="h-64 bg-stone-100 dark:bg-zinc-700 rounded-lg" /></div>}>
                  <AnalyticsDashboard />
                </Suspense>
              </div>
            )}
          </div>

          {/* Right Column — Sidebar (row-span-2 so it doesn't stretch row 1 height on desktop) */}
          <div className="lg:col-span-4 lg:row-span-2 order-2">
            <div className="lg:sticky lg:top-[73px] space-y-4 sm:space-y-5">
              <SearchHistory
                history={history}
                onSelect={handleHistoryClick}
                onDelete={handleDeleteHistory}
                deleting={deleting}
                loading={historyLoading}
                hasMore={hasMore}
                onLoadMore={loadMoreHistory}
                loadingMore={loadingMore}
                total={historyMeta?.total}
                onDateFilterChange={handleDateFilterChange}
              />
              <FavoritesList
                favorites={favorites}
                onSelect={handleFavoriteSelect}
                onRemove={handleRemoveFavorite}
                onUpdateLabel={handleUpdateFavoriteLabel}
                onBulkDelete={handleBulkDeleteFavorites}
              />
            </div>
          </div>

          {/* Map — after sidebar on mobile (order-3), under left column on desktop */}
          {activeTab === 'single' && (
            <div className="lg:col-span-8 order-3 animate-fade-in">
              <Suspense fallback={<MapSkeleton />}>
                <GeoMap data={geoData} historyEntries={history} showAllPins={showAllPins} onTogglePins={() => setShowAllPins(prev => !prev)} />
              </Suspense>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 dark:border-zinc-800 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-stone-400 dark:text-zinc-600">IP Atlas</span>
          <span className="text-xs text-stone-400 dark:text-zinc-600">v1.0</span>
        </div>
      </footer>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onAccountDeleted={handleAccountDeleted}
      />

      <ConfirmDialog
        open={confirmState?.type === 'logout'}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmLabel="Logout"
        onConfirm={executeLogout}
        onCancel={() => setConfirmState(null)}
      />

      <ConfirmDialog
        open={confirmState?.type === 'deleteHistory'}
        title="Delete History"
        message={`Delete ${confirmState?.ids?.length ?? 0} item${(confirmState?.ids?.length ?? 0) > 1 ? 's' : ''}? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => confirmState?.ids && executeDeleteHistory(confirmState.ids)}
        onCancel={() => setConfirmState(null)}
        loading={deleting}
      />

      <ConfirmDialog
        open={confirmState?.type === 'deleteFavorites'}
        title="Delete Favorites"
        message={`Delete ${confirmState?.ids?.length ?? 0} favorite${(confirmState?.ids?.length ?? 0) > 1 ? 's' : ''}? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => confirmState?.ids && executeBulkDeleteFavorites(confirmState.ids)}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  )
}
