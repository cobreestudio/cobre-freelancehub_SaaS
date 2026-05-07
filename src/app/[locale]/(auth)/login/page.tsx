'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Coins, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError(t('wrongCredentials'))
      setLoading(false)
      return
    }

    router.push(`/${locale}`)
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-4">
        <Link href={`/${locale}/landing`} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          {t('backToHome')}
        </Link>
      </div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl mb-4">
          <Coins size={22} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Cobre</h1>
        <p className="text-gray-400 text-sm mt-1">{t('loginTitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email')}</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder={t('emailPlaceholder')}
            required
            autoFocus
            className="input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('password')}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder={t('passwordPlaceholder')}
              required
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

        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2"
        >
          {loading ? t('loggingIn') : t('login')}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-4">
        {t('noAccount')}{' '}
        <Link href={`/${locale}/register`} className="text-indigo-600 font-medium hover:underline">
          {t('registerLink')}
        </Link>
      </p>
    </div>
  )
}
