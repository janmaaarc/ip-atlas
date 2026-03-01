import { useState, type FormEvent } from 'react'
import api from '../../lib/api'
import axios from 'axios'
import { INPUT_BASE_DANGER } from '../../lib/styles'

export default function DeleteAccountSection({ onDeleted }: { onDeleted: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    setLoading(true)
    try {
      await api.delete('/api/account', { data: { password } })
      onDeleted()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error?.message || 'Failed to delete account')
      } else {
        setError('Failed to delete account')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-red-200 dark:border-red-900/50 rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10">
      <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Danger Zone</h3>
      <p className="text-xs text-stone-500 dark:text-zinc-400 mb-3">
        Permanently delete your account and all associated data. This cannot be undone.
      </p>

      {error && (
        <div role="alert" className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-lg p-2.5 mb-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="delete-password" className="block text-xs font-medium text-red-600 dark:text-red-400 mb-1">Password</label>
          <input
            id="delete-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter your password to confirm"
            className={INPUT_BASE_DANGER}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full bg-red-600 text-white text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-red-700 disabled:opacity-50 transition"
        >
          {loading ? 'Deleting...' : 'Delete Account'}
        </button>
      </form>
    </div>
  )
}
