import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import axios from 'axios'
import { PasswordInput, StrengthBar, passwordRules } from '../ui/PasswordInput'

interface LoginFormProps {
  onSuccess: () => void
  mode: 'login' | 'register'
  onToggleMode: () => void
}

const inputBase = 'w-full border border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-stone-900 dark:text-zinc-100 rounded-lg pl-4 pr-11 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 outline-none placeholder:text-stone-400 dark:placeholder:text-zinc-500'

export default function LoginForm({ onSuccess, mode, onToggleMode }: LoginFormProps) {
  const { login, register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isRegister = mode === 'register'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    if (isRegister) {
      const failed = passwordRules.find(r => !r.test(password))
      if (failed) { setError(`Password must have: ${failed.label.toLowerCase()}`); return }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
    }

    setLoading(true)
    try {
      if (isRegister) {
        await register(email, password)
      } else {
        await login(email, password)
      }
      onSuccess()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error?.message || 'Something went wrong')
      } else {
        setError('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div role="alert" className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com"
          className={inputBase}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1">
          Password
        </label>
        <PasswordInput
          id="password"
          value={password}
          onChange={setPassword}
          placeholder={isRegister ? 'Create a strong password' : 'Enter your password'}
        />
        {isRegister && password.length > 0 && <div className="mt-2"><StrengthBar password={password} /></div>}
      </div>

      {isRegister && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 dark:text-zinc-300 mb-1">
            Confirm Password
          </label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Re-enter your password"
          />
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">Passwords do not match</p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="w-full bg-blue-600 text-white font-medium rounded-lg px-4 py-2.5 hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? (isRegister ? 'Creating account...' : 'Signing in...') : (isRegister ? 'Create Account' : 'Sign In')}
      </button>

      {!isRegister && (
        <button
          type="button"
          onClick={() => { setEmail('test@jlabs.com'); setPassword('Password1') }}
          className="w-full border border-dashed border-stone-300 dark:border-zinc-600 rounded-md px-3 py-2 text-center hover:border-blue-400 dark:hover:border-blue-500 transition"
        >
          <span className="text-[10px] uppercase tracking-wider text-stone-400 dark:text-zinc-500">Demo </span>
          <span className="text-xs text-stone-600 dark:text-zinc-300">test@jlabs.com</span>
          <span className="text-[10px] text-stone-300 dark:text-zinc-600 mx-1">/</span>
          <span className="text-xs text-stone-600 dark:text-zinc-300">Password1</span>
        </button>
      )}

      <p className="text-center text-sm text-stone-500 dark:text-zinc-400">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button type="button" onClick={onToggleMode} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          {isRegister ? 'Sign in' : 'Register'}
        </button>
      </p>
    </form>
  )
}
