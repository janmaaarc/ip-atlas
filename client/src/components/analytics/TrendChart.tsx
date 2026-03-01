import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props {
  data: Array<{ date: string; count: number }>
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function TrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-stone-800 dark:text-zinc-100 mb-4">Search Trend (30 Days)</h3>
        <p className="text-stone-400 dark:text-zinc-500 text-sm text-center py-8">No data yet</p>
      </div>
    )
  }

  const formatted = data.map(d => ({
    ...d,
    label: formatDate(d.date),
  }))

  return (
    <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-stone-800 dark:text-zinc-100 mb-4 flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-500">
          <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 01.919-.53l4.78 1.281a.75.75 0 01.531.919l-1.281 4.78a.75.75 0 01-1.449-.388l.81-3.022a19.407 19.407 0 00-5.594 5.203.75.75 0 01-1.139.093L7 10.06l-4.72 4.72a.75.75 0 01-1.06-1.06l5.25-5.25a.75.75 0 011.06 0l3.074 3.073a20.923 20.923 0 015.545-4.931l-3.042.815a.75.75 0 01-.53-.919z" clipRule="evenodd" />
        </svg>
        Search Trend (30 Days)
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={formatted} margin={{ left: 0, right: 20, top: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
          <Tooltip
            labelFormatter={(_v, payload) => {
              const item = payload?.[0]?.payload as { date?: string } | undefined
              return item?.date ? new Date(item.date).toLocaleDateString() : ''
            }}
            contentStyle={{
              backgroundColor: 'var(--color-white, #fff)',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
