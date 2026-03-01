interface Props {
  label: string
  value: number | string
  icon: React.ReactNode
}

export default function StatCard({ label, value, icon }: Props) {
  return (
    <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-stone-800 dark:text-zinc-100">{value}</p>
        <p className="text-xs text-stone-500 dark:text-zinc-400">{label}</p>
      </div>
    </div>
  )
}
