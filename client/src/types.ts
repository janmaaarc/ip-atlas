export interface GeoData {
  ip: string
  city: string
  region: string
  country: string
  loc: string
  org: string
  timezone: string
}

export interface HistoryEntry {
  id: string
  ipAddress: string
  geoData: GeoData
  createdAt: string
}

export interface User {
  id: string
  email: string
}

export interface FavoriteIp {
  id: string
  ipAddress: string
  label: string | null
  createdAt: string
}

export interface AnalyticsData {
  summary: {
    totalSearches: number
    uniqueIps: number
    uniqueCountries: number
  }
  countryCounts: Array<{ country: string; count: number }>
  orgCounts: Array<{ org: string; count: number }>
  searchTrend: Array<{ date: string; count: number }>
}
