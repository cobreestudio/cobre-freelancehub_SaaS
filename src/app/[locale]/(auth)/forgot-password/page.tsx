'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Coins } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const params = useParams()
  const locale = params.locale as string
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/${locale}/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
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
        <h1 className="text-2xl font-bold text-gray-900">{t('forgotPasswordTitle')}</h1>
        <p className="text-gray-400 text-sm mt-1">{t('forgotPasswordSubtitle')}</p>
      </div>

      {sent ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
          <p className="text-emerald-700 font-medium text-sm">{t('resetLinkSent')}</p>
          <Link href={`/${locale}/login`}
            className="inline-block mt-4 text-sm text-indigo-600 hover:underline font-medium">
            {t('backToLogin')}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              required
              autoFocus
              className="input"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2">
            {loading ? t('sendingResetLink') : t('sendResetLink')}
          </button>
        </form>
      )}
    </div>
  )
}
