import { useState, type FormEvent } from 'react'
import api from '../../lib/api'
import axios from 'axios'
import { useToast } from '../ui/Toast'
import type { GeoData } from '../../types'

interface Props {
  onResults: (a: GeoData, b: GeoData) => void
}

function isValidIp(ip: string) {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every(p => {
    const n = Number(p)
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p
  })
}

function CompareDisplay({ a, b }: { a: GeoData; b: GeoData }) {
  const fields: { label: string; key: keyof GeoData }[] = [
    { label: 'IP', key: 'ip' },
    { label: 'City', key: 'city' },
    { label: 'Region', key: 'region' },
    { label: 'Country', key: 'country' },
    { label: 'Coords', key: 'loc' },
    { label: 'Org', key: 'org' },
    { label: 'Timezone', key: 'timezone' },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="text-left text-stone-500 dark:text-zinc-400 border-b border-stone-200 dark:border-zinc-700">
            <th className="pb-2 pr-3 font-medium">Field</th>
            <th className="pb-2 pr-3 font-medium">IP A</th>
            <th className="pb-2 font-medium">IP B</th>
          </tr>
        </thead>
        <tbody>
          {fields.map(({ label, key }) => {
            const diff = a[key] !== b[key]
            return (
              <tr key={key}>
                <td className="py-1.5 pr-3 font-medium text-stone-500 dark:text-zinc-400">{label}</td>
                <td className={`py-1.5 pr-3 ${diff ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 rounded' : 'text-stone-700 dark:text-zinc-300'}`}>
                  {a[key] || 'N/A'}
                </td>
                <td className={`py-1.5 ${diff ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 rounded' : 'text-stone-700 dark:text-zinc-300'}`}>
                  {b[key] || 'N/A'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function IpCompare({ onResults }: Props) {
  const { showToast } = useToast()
  const [ipA, setIpA] = useState('')
  const [ipB, setIpB] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<[GeoData, GeoData] | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const a = ipA.trim()
    const b = ipB.trim()

    if (!a || !b) { setError('Enter both IP addresses'); return }
    if (!isValidIp(a)) { setError(`Invalid IP A: ${a}`); return }
    if (!isValidIp(b)) { setError(`Invalid IP B: ${b}`); return }
    if (a === b) { setError('Enter two different IPs'); return }

    setLoading(true)
    try {
      const [resA, resB] = await Promise.all([
        api.get('/api/geo', { params: { ip: a } }),
        api.get('/api/geo', { params: { ip: b } }),
      ])
      const pair: [GeoData, GeoData] = [resA.data.data, resB.data.data]
      setResults(pair)
      onResults(pair[0], pair[1])
      showToast('Comparison ready', 'success')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error?.message || 'Comparison failed')
      } else {
        setError('Comparison failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
      <h2 className="text-base sm:text-lg font-semibold text-stone-800 dark:text-zinc-100">Compare Two IPs</h2>
      <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400">Enter two IPs side by side to compare their location, ISP, and region.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="ip-a" className="block text-xs font-medium text-stone-600 dark:text-zinc-400 mb-1">IP Address A</label>
            <input
              id="ip-a"
              type="text"
              value={ipA}
              onChange={e => setIpA(e.target.value)}
              placeholder="e.g. 8.8.8.8"
              className="w-full border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-stone-900 dark:text-zinc-100 rounded-lg px-3 py-2.5 text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none placeholder:text-stone-400 dark:placeholder:text-zinc-500"
            />
          </div>
          <div>
            <label htmlFor="ip-b" className="block text-xs font-medium text-stone-600 dark:text-zinc-400 mb-1">IP Address B</label>
            <input
              id="ip-b"
              type="text"
              value={ipB}
              onChange={e => setIpB(e.target.value)}
              placeholder="e.g. 1.1.1.1"
              className="w-full border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-stone-900 dark:text-zinc-100 rounded-lg px-3 py-2.5 text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none placeholder:text-stone-400 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>
        {error && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full sm:w-auto bg-blue-600 text-white text-sm font-medium rounded-lg px-5 py-2.5 hover:bg-blue-700 disabled:opacity-50 transition inline-flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </form>

      {results && <CompareDisplay a={results[0]} b={results[1]} />}
    </div>
  )
}
