import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/Toast'
import LoginForm from '../components/auth/LoginForm'
import ThemeToggle from '../components/ui/ThemeToggle'

export default function LoginPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [mode, setMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  function handleSuccess() {
    showToast(mode === 'register' ? 'Account created!' : 'Welcome back!', 'success')
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-zinc-900 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-white">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433a19.695 19.695 0 002.683-2.006c1.9-1.702 3.945-4.211 3.945-7.343a7 7 0 00-14 0c0 3.132 2.045 5.641 3.945 7.343a19.695 19.695 0 002.683 2.006 10.58 10.58 0 00.757.433l.12.064.04.021.013.006.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stone-800 dark:text-zinc-100">IP Atlas</h1>
          <p className="text-stone-500 dark:text-zinc-400 mt-1">Locate any IP on the map</p>
          <p className="text-sm text-stone-400 dark:text-zinc-500 mt-2">
            {mode === 'login' ? 'Sign in to continue' : 'Create your account'}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-stone-200 dark:border-zinc-700 shadow-sm p-6 sm:p-8">
          <LoginForm
            mode={mode}
            onToggleMode={() => setMode(m => m === 'login' ? 'register' : 'login')}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  )
}
