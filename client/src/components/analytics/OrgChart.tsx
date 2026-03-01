import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props {
  data: Array<{ org: string; count: number }>
}

export default function OrgChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-stone-800 dark:text-zinc-100 mb-4">Top Organizations</h3>
        <p className="text-stone-400 dark:text-zinc-500 text-sm text-center py-8">No data yet</p>
      </div>
    )
  }

  const formatted = data.map(d => ({
    ...d,
    shortOrg: d.org.length > 25 ? `${d.org.slice(0, 25)}...` : d.org,
  }))

  return (
    <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-stone-800 dark:text-zinc-100 mb-4 flex items-center gap-1.5">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-violet-500">
          <path fillRule="evenodd" d="M1 2.75A.75.75 0 011.75 2h10.5a.75.75 0 010 1.5H2.75v13.5h1V11a1 1 0 011-1h2a1 1 0 011 1v6h1V5.75a.75.75 0 01.75-.75h6.5a.75.75 0 01.75.75v11.5h1.75a.75.75 0 010 1.5H1.75a.75.75 0 010-1.5H2V3.5a.75.75 0 01-.25-.562V2.75zM11.5 6.5v1h2v-1h-2zm2 3h-2v1h2v-1zm-2 3v1h2v-1h-2z" clipRule="evenodd" />
        </svg>
        Top Organizations
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={formatted} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e5e5" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="shortOrg" tick={{ fontSize: 11 }} width={120} />
          <Tooltip
            labelFormatter={(_v, payload) => {
              const item = payload?.[0]?.payload as { org?: string } | undefined
              return item?.org ?? ''
            }}
            contentStyle={{
              backgroundColor: 'var(--color-white, #fff)',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
