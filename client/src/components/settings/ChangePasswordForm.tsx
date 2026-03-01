import { useState, type FormEvent } from 'react'
import api from '../../lib/api'
import axios from 'axios'
import { useToast } from '../ui/Toast'
import { PasswordInput, StrengthBar, passwordRules } from '../ui/PasswordInput'

export default function ChangePasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const { showToast } = useToast()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const failed = passwordRules.find(r => !r.test(newPassword))
    if (failed) { setError(`New password must have: ${failed.label.toLowerCase()}`); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    try {
      await api.patch('/api/password', { currentPassword, newPassword })
      showToast('Password changed', 'success')
      onSuccess()
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error?.message || 'Failed to change password')
      } else {
        setError('Failed to change password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-sm font-semibold text-stone-800 dark:text-zinc-100">Change Password</h3>

      {error && (
        <div role="alert" className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-lg p-2.5">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="current-password" className="block text-xs font-medium text-stone-600 dark:text-zinc-400 mb-1">Current Password</label>
        <PasswordInput
          id="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder="Current password"
        />
      </div>
      <div>
        <label htmlFor="new-password" className="block text-xs font-medium text-stone-600 dark:text-zinc-400 mb-1">New Password</label>
        <PasswordInput
          id="new-password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="New password"
        />
        {newPassword.length > 0 && <div className="mt-2"><StrengthBar password={newPassword} /></div>}
      </div>
      <div>
        <label htmlFor="confirm-password" className="block text-xs font-medium text-stone-600 dark:text-zinc-400 mb-1">Confirm New Password</label>
        <PasswordInput
          id="confirm-password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm new password"
        />
      </div>

      {newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword && (
        <p className="text-xs text-red-500">Passwords do not match</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-blue-700 disabled:opacity-50 transition"
      >
        {loading ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  )
}
