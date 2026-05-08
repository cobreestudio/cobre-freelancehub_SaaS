'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Coins, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function ResetPasswordPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase sets session from the URL hash automatically on auth state change
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError(t('passwordMismatch'))
      return
    }
    if (form.password.length < 6) {
      setError(t('passwordTooShort'))
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: form.password })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setDone(true)
    setTimeout(() => router.push(`/${locale}/login`), 2500)
  }

  if (!ready) {
    return (
      <div className="w-full max-w-sm">
        <div className="text-center mb-4">
          <Link href={`/${locale}/login`} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            {t('backToLogin')}
          </Link>
        </div>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl mb-4">
            <Coins size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('resetPasswordTitle')}</h1>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center">
          <p className="text-amber-700 text-sm">{t('resetLinkExpired')}</p>
          <Link href={`/${locale}/forgot-password`}
            className="inline-block mt-4 text-sm text-indigo-600 hover:underline font-medium">
            {t('requestNewLink')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-4">
        <Link href={`/${locale}/login`} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          {t('backToLogin')}
        </Link>
      </div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl mb-4">
          <Coins size={22} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('resetPasswordTitle')}</h1>
        <p className="text-gray-400 text-sm mt-1">{t('resetPasswordSubtitle')}</p>
      </div>

      {done ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
          <p className="text-emerald-700 font-medium text-sm">{t('passwordUpdated')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('newPassword')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder={t('minCharsPlaceholder')}
                required
                autoFocus
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('confirmPassword')}</label>
            <input
              type="password"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              placeholder={t('repeatPasswordPlaceholder')}
              required
              className="input"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2">
            {loading ? t('savingPassword') : t('savePassword')}
          </button>
        </form>
      )}
    </div>
  )
}
