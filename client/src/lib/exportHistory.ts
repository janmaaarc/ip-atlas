import type { HistoryEntry } from '../types'

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportAsCSV(entries: HistoryEntry[]) {
  const header = 'IP,City,Region,Country,Coords,Organization,Timezone,Date'
  const rows = entries.map(e => [
    e.ipAddress,
    e.geoData.city || '',
    e.geoData.region || '',
    e.geoData.country || '',
    e.geoData.loc || '',
    `"${(e.geoData.org || '').replace(/"/g, '""')}"`,
    e.geoData.timezone || '',
    new Date(e.createdAt).toISOString(),
  ].join(','))

  const date = new Date().toISOString().slice(0, 10)
  downloadFile([header, ...rows].join('\n'), `search-history-${date}.csv`, 'text/csv')
}

export function exportAsJSON(entries: HistoryEntry[]) {
  const data = entries.map(e => {
    const { ip: _ip, ...rest } = e.geoData
    return { ip: e.ipAddress, ...rest, searchedAt: e.createdAt }
  })

  const date = new Date().toISOString().slice(0, 10)
  downloadFile(JSON.stringify(data, null, 2), `search-history-${date}.json`, 'application/json')
}
