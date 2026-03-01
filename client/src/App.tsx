import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ThemeProvider } from './hooks/useTheme'
import { DistanceUnitProvider } from './hooks/useDistanceUnit'
import { ToastProvider } from './components/ui/Toast'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import SharedResultPage from './pages/SharedResultPage'
import ErrorBoundary from './components/ui/ErrorBoundary'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, authLoading } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-zinc-900 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-stone-300 dark:border-zinc-600 border-t-blue-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/shared/:token" element={<SharedResultPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <DistanceUnitProvider>
          <AuthProvider>
            <ToastProvider>
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </ToastProvider>
          </AuthProvider>
        </DistanceUnitProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
