import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import api from '../lib/api'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  authLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  deleteAccount: (password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch {
      localStorage.removeItem('user')
      return null
    }
  })
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    api.get('/api/me')
      .then(({ data }) => {
        setUser(data.data)
        localStorage.setItem('user', JSON.stringify(data.data))
      })
      .catch(() => {
        setUser(null)
        localStorage.removeItem('user')
      })
      .finally(() => setAuthLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/api/login', { email, password })
    localStorage.setItem('user', JSON.stringify(data.data))
    setUser(data.data)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/api/register', { email, password })
    localStorage.setItem('user', JSON.stringify(data.data))
    setUser(data.data)
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/api/logout') } catch { /* ignore */ }
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const deleteAccount = useCallback(async (password: string) => {
    await api.delete('/api/account', { data: { password } })
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, authLoading, login, register, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
