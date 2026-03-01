import { useState } from 'react'
import { INPUT_BASE } from '../../lib/styles'

export const passwordRules = [
  { test: (pw: string) => pw.length >= 8, label: '8+ characters' },
  { test: (pw: string) => /[A-Z]/.test(pw), label: 'Uppercase letter' },
  { test: (pw: string) => /[0-9]/.test(pw), label: 'Number' },
]

const inputWithToggle = INPUT_BASE.replace('px-4', 'pl-4 pr-11')

export function PasswordInput({ id, value, onChange, placeholder }: {
  id: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputWithToggle}
        required
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 transition"
        aria-label={show ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {show ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.092 1.092a4 4 0 00-5.558-5.558z" clipRule="evenodd" />
            <path d="M10.748 13.93l2.523 2.523A9.987 9.987 0 0110 17c-4.257 0-7.855-2.66-9.335-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 014.052 5.11L5.78 6.839a4 4 0 004.968 7.091z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
            <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.855 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.855-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  )
}

export function StrengthBar({ password }: { password: string }) {
  const passed = passwordRules.filter(r => r.test(password)).length
  const strength = password.length === 0 ? 0 : passed

  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
  const labels = ['', 'Weak', 'Fair', 'Strong']

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? colors[strength] : 'bg-stone-200 dark:bg-zinc-600'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        {strength > 0 && (
          <span className={`text-xs font-medium ${
            strength === 1 ? 'text-red-500' : strength === 2 ? 'text-orange-500' : 'text-green-600 dark:text-green-400'
          }`}>
            {labels[strength]}
          </span>
        )}
      </div>
      <ul className="space-y-1">
        {passwordRules.map(rule => {
          const met = rule.test(password)
          return (
            <li key={rule.label} className="flex items-center gap-1.5 text-xs">
              {met ? (
                <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-stone-300 dark:text-zinc-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                </svg>
              )}
              <span className={met ? 'text-green-600 dark:text-green-400' : 'text-stone-400 dark:text-zinc-500'}>
                {rule.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
