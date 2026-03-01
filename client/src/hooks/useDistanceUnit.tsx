import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type DistanceUnit = 'km' | 'mi'

interface DistanceUnitContextType {
  unit: DistanceUnit
  setUnit: (unit: DistanceUnit) => void
}

const DistanceUnitContext = createContext<DistanceUnitContextType | null>(null)

function getInitialUnit(): DistanceUnit {
  try {
    const saved = localStorage.getItem('distanceUnit')
    if (saved === 'km' || saved === 'mi') return saved
  } catch { /* ignore */ }
  return 'km'
}

export function DistanceUnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<DistanceUnit>(getInitialUnit)

  const setUnit = useCallback((next: DistanceUnit) => {
    setUnitState(next)
    try { localStorage.setItem('distanceUnit', next) } catch { /* ignore */ }
  }, [])

  return (
    <DistanceUnitContext.Provider value={{ unit, setUnit }}>
      {children}
    </DistanceUnitContext.Provider>
  )
}

export function useDistanceUnit() {
  const ctx = useContext(DistanceUnitContext)
  if (!ctx) throw new Error('useDistanceUnit must be inside DistanceUnitProvider')
  return ctx
}
