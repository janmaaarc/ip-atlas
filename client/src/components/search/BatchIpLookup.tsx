import { useState, type FormEvent } from 'react'
import api from '../../lib/api'
import axios from 'axios'
import { useToast } from '../ui/Toast'
import BatchResultsTable, { type BatchResult } from './BatchResultsTable'
import type { GeoData } from '../../types'

interface Props {
  onSelect: (data: GeoData) => void
  onDone: () => void
}

function isValidIp(ip: string) {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every(p => {
    const n = Number(p)
    return !isNaN(n) && n >= 0 && n <= 255 && String(n) === p
  })
}

export default function BatchIpLookup({ onSelect, onDone }: Props) {
  const { showToast } = useToast()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<BatchResult[]>([])
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const ips = input
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)

    if (ips.length === 0) {
      setError('Enter at least one IP address')
      return
    }
    if (ips.length > 25) {
      setError('Maximum 25 IPs per batch')
      return
    }

    const invalid = ips.find(ip => !isValidIp(ip))
    if (invalid) {
      setError(`Invalid IP: ${invalid}`)
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/api/geo/batch', { ips })
      setResults(data.data)
      const successCount = (data.data as BatchResult[]).filter(r => r.status === 'success').length
      showToast(`Looked up ${successCount}/${ips.length} IPs`, 'success')
      onDone()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error?.message || 'Batch lookup failed')
      } else {
        setError('Batch lookup failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
      <h2 className="text-base sm:text-lg font-semibold text-stone-800 dark:text-zinc-100">Batch IP Lookup</h2>
      <p className="text-xs sm:text-sm text-stone-500 dark:text-zinc-400">Look up multiple IPs at once. Enter up to 25 addresses, one per line.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor="batch-ips" className="block text-xs font-medium text-stone-600 dark:text-zinc-400 mb-1">IP Addresses</label>
        <textarea
          id="batch-ips"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter IPs, one per line (max 25)&#10;e.g.&#10;8.8.8.8&#10;1.1.1.1"
          rows={5}
          className="w-full border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-stone-900 dark:text-zinc-100 rounded-lg px-3 py-2.5 text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none placeholder:text-stone-400 dark:placeholder:text-zinc-500 resize-none"
        />
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
          {loading ? 'Looking up...' : 'Batch Lookup'}
        </button>
      </form>

      <BatchResultsTable results={results} onSelect={onSelect} />
    </div>
  )
}
