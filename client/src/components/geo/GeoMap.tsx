import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useTheme } from '../../hooks/useTheme'
import { useDistanceUnit, type DistanceUnit } from '../../hooks/useDistanceUnit'
import type { GeoData, HistoryEntry } from '../../types'

const TILE_LAYERS = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
} as const

type TileMode = keyof typeof TILE_LAYERS

const primaryIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const historyIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [16, 26],
  iconAnchor: [8, 26],
  popupAnchor: [1, -22],
  shadowSize: [26, 26],
  className: 'opacity-60',
})

L.Marker.prototype.options.icon = primaryIcon

function haversineDistance(a: [number, number], b: [number, number]): number {
  const R = 6371
  const dLat = ((b[0] - a[0]) * Math.PI) / 180
  const dLng = ((b[1] - a[1]) * Math.PI) / 180
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * sinLng * sinLng
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

const KM_TO_MI = 0.621371

function formatDistance(km: number, unit: DistanceUnit): string {
  if (unit === 'mi') {
    const mi = km * KM_TO_MI
    if (mi < 0.1) return `${Math.round(mi * 5280)} ft`
    if (mi < 100) return `${mi.toFixed(1)} mi`
    return `${Math.round(mi).toLocaleString()} mi`
  }
  if (km < 1) return `${Math.round(km * 1000)} m`
  if (km < 100) return `${km.toFixed(1)} km`
  return `${Math.round(km).toLocaleString()} km`
}

function FlyTo({ center }: { center: [number, number] }) {
  const map = useMap()
  const lastCenter = useRef<string>('')

  useEffect(() => {
    const key = `${center[0]},${center[1]}`
    if (key === lastCenter.current) return
    lastCenter.current = key
    map.flyTo(center, 12, { duration: 1.5 })
  }, [map, center])

  return null
}

function FitBounds({ bounds }: { bounds: [number, number][] }) {
  const map = useMap()
  const lastKey = useRef<string>('')

  useEffect(() => {
    const key = bounds.map(b => `${b[0]},${b[1]}`).join('|')
    if (key === lastKey.current) return
    lastKey.current = key
    map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 12 })
  }, [map, bounds])

  return null
}

function FullscreenControl() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const wrapper = container.parentElement
    if (!wrapper) return

    const btn = L.DomUtil.create('div', 'leaflet-bar leaflet-control')
    btn.style.cssText = 'cursor:pointer;background:white;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:4px;'
    btn.title = 'Toggle fullscreen'
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#333" width="18" height="18"><path d="M4.25 2A2.25 2.25 0 002 4.25v2a.75.75 0 001.5 0v-2a.75.75 0 01.75-.75h2a.75.75 0 000-1.5h-2zM13.75 2a.75.75 0 000 1.5h2a.75.75 0 01.75.75v2a.75.75 0 001.5 0v-2A2.25 2.25 0 0015.75 2h-2zM3.5 13.75a.75.75 0 00-1.5 0v2A2.25 2.25 0 004.25 18h2a.75.75 0 000-1.5h-2a.75.75 0 01-.75-.75v-2zM18 13.75a.75.75 0 00-1.5 0v2a.75.75 0 01-.75.75h-2a.75.75 0 000 1.5h2A2.25 2.25 0 0018 15.75v-2z"/></svg>'

    const controlContainer = container.querySelector('.leaflet-control-container .leaflet-top.leaflet-right')
    if (controlContainer) {
      controlContainer.appendChild(btn)
    }

    let isFullscreen = false

    function toggleFullscreen() {
      if (!wrapper) return
      isFullscreen = !isFullscreen
      if (isFullscreen) {
        wrapper.style.cssText = 'position:fixed;inset:0;z-index:999;border-radius:0;'
        container.style.height = '100dvh'
      } else {
        wrapper.style.cssText = ''
        container.style.height = ''
      }
      map.invalidateSize()
    }

    btn.addEventListener('click', toggleFullscreen)

    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen()
      }
    }
    document.addEventListener('keydown', onEsc)

    return () => {
      btn.removeEventListener('click', toggleFullscreen)
      document.removeEventListener('keydown', onEsc)
      btn.remove()
      if (isFullscreen && wrapper) {
        wrapper.style.cssText = ''
        container.style.height = ''
        map.invalidateSize()
      }
    }
  }, [map])

  return null
}

function parseLatLng(loc: string): [number, number] | null {
  if (!loc) return null
  const [lat, lng] = loc.split(',').map(Number)
  if (isNaN(lat) || isNaN(lng)) return null
  return [lat, lng]
}

interface Props {
  data: GeoData | null
  historyEntries?: HistoryEntry[]
  showAllPins?: boolean
  onTogglePins?: () => void
}

export default function GeoMap({ data, historyEntries = [], showAllPins = false, onTogglePins }: Props) {
  const { theme } = useTheme()
  const { unit } = useDistanceUnit()
  const [tileMode, setTileMode] = useState<TileMode>('street')

  const activeTile = tileMode === 'street' && theme === 'dark' ? TILE_LAYERS.dark : TILE_LAYERS[tileMode]

  const coords = useMemo(
    () => (data?.loc ? parseLatLng(data.loc) : null),
    [data?.loc]
  )

  const historyPins = useMemo(() => {
    if (!showAllPins) return []
    const seen = new Set<string>()
    if (data?.ip) seen.add(data.ip)
    return historyEntries.reduce<{ ip: string; coords: [number, number]; city: string; country: string }[]>((acc, e) => {
      if (!seen.has(e.ipAddress)) {
        seen.add(e.ipAddress)
        const c = parseLatLng(e.geoData.loc)
        if (c) {
          acc.push({ ip: e.ipAddress, coords: c, city: e.geoData.city, country: e.geoData.country })
        }
      }
      return acc
    }, [])
  }, [showAllPins, historyEntries, data?.ip])

  const allCoords = useMemo(() => {
    const points: [number, number][] = []
    if (coords) points.push(coords)
    for (const p of historyPins) points.push(p.coords)
    return points
  }, [coords, historyPins])

  const distanceInfo = useMemo(() => {
    if (!showAllPins || !coords || historyPins.length === 0) return null
    const nearest = historyPins.reduce<{ ip: string; dist: number } | null>((best, pin) => {
      const d = haversineDistance(coords, pin.coords)
      if (!best || d < best.dist) return { ip: pin.ip, dist: d }
      return best
    }, null)
    return nearest
  }, [showAllPins, coords, historyPins])

  if (!coords) {
    return (
      <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-700 shadow-sm bg-stone-100 dark:bg-zinc-800 flex items-center justify-center h-[250px] sm:h-[350px] md:h-[400px]">
        <p className="text-stone-400 dark:text-zinc-500 text-sm">Map will appear when location is available</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Map controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {(['street', 'satellite'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setTileMode(mode)}
                className={`text-[10px] sm:text-xs font-medium rounded-md px-2 py-1 transition ${
                  tileMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-stone-100 dark:bg-zinc-700 text-stone-500 dark:text-zinc-400 hover:bg-stone-200 dark:hover:bg-zinc-600'
                }`}
              >
                {mode === 'street' ? 'Street' : 'Satellite'}
              </button>
            ))}
          </div>
          {onTogglePins && (
            <label className="flex items-center gap-1.5 text-[10px] sm:text-xs text-stone-500 dark:text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAllPins}
                onChange={onTogglePins}
                className="w-3.5 h-3.5 rounded border-stone-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
              />
              History pins
            </label>
          )}
        </div>
        {distanceInfo && (
          <span className="text-[10px] sm:text-xs text-stone-500 dark:text-zinc-400">
            Nearest: {distanceInfo.ip} ({formatDistance(distanceInfo.dist, unit)})
          </span>
        )}
      </div>

      <div className="rounded-xl overflow-hidden border border-stone-200 dark:border-zinc-700 shadow-sm">
        <MapContainer center={coords} zoom={12} scrollWheelZoom className="h-[250px] sm:h-[350px] md:h-[400px]">
          <TileLayer
            key={`${tileMode}-${theme}`}
            attribution={activeTile.attribution}
            url={activeTile.url}
          />
          <Marker position={coords} icon={primaryIcon}>
            <Popup>
              <strong>{data?.ip}</strong><br />
              {data?.city}, {data?.region}, {data?.country}
            </Popup>
          </Marker>
          {showAllPins && historyPins.length > 0 && (
            <MarkerClusterGroup chunkedLoading>
              {historyPins.map(pin => (
                <Marker key={pin.ip} position={pin.coords} icon={historyIcon}>
                  <Popup>
                    <strong>{pin.ip}</strong><br />
                    {pin.city}, {pin.country}
                    {coords && (
                      <><br /><em>{formatDistance(haversineDistance(coords, pin.coords), unit)} away</em></>
                    )}
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          )}
          {showAllPins && historyPins.length > 0 && coords && (
            <Polyline
              positions={[coords, ...historyPins.map(p => p.coords)]}
              pathOptions={{ color: '#3b82f6', weight: 2, opacity: 0.4, dashArray: '6 4' }}
            />
          )}
          {showAllPins && allCoords.length > 1
            ? <FitBounds bounds={allCoords} />
            : <FlyTo center={coords} />
          }
          <FullscreenControl />
        </MapContainer>
      </div>
    </div>
  )
}
