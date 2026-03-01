import type { GeoData } from '../../types'

interface BatchResult {
  ip: string
  status: 'success' | 'error'
  data: GeoData | null
  error: string | null
}

interface Props {
  results: BatchResult[]
  onSelect: (data: GeoData) => void
}

export default function BatchResultsTable({ results, onSelect }: Props) {
  if (results.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="text-left text-stone-500 dark:text-zinc-400 border-b border-stone-200 dark:border-zinc-700">
            <th scope="col" className="pb-2 pr-3 font-medium">IP</th>
            <th scope="col" className="pb-2 pr-3 font-medium">City</th>
            <th scope="col" className="pb-2 pr-3 font-medium">Country</th>
            <th scope="col" className="pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {results.map(r => (
            <tr
              key={r.ip}
              onClick={() => r.data && onSelect(r.data)}
              onKeyDown={r.data ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); r.data && onSelect(r.data) } } : undefined}
              tabIndex={r.data ? 0 : undefined}
              role={r.data ? 'button' : undefined}
              className={r.data ? 'cursor-pointer hover:bg-stone-50 dark:hover:bg-zinc-700/50 focus:bg-stone-50 dark:focus:bg-zinc-700/50 outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 rounded' : ''}
            >
              <td className="py-2 pr-3 font-mono text-stone-800 dark:text-zinc-200">{r.ip}</td>
              <td className="py-2 pr-3 text-stone-600 dark:text-zinc-300">{r.data?.city || '-'}</td>
              <td className="py-2 pr-3 text-stone-600 dark:text-zinc-300">{r.data?.country || '-'}</td>
              <td className="py-2">
                {r.status === 'success' ? (
                  <span className="text-green-600 dark:text-green-400">OK</span>
                ) : (
                  <span className="text-red-500 dark:text-red-400">Failed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export type { BatchResult }
