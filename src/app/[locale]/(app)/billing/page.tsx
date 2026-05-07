'use client'

import { useEffect, useState } from 'react'
import { profileStore } from '@/lib/store'
import { createClient } from '@/lib/supabase'
import { FREE_LIMITS } from '@/lib/plans'
import { Crown, Check, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

export default function BillingPage() {
  const locale = useLocale()
  const [plan, setPlan] = useState<'free' | 'pro' | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSuccess(new URLSearchParams(window.location.search).get('success') === 'true')
    }
    profileStore.get().then(p => {
      setPlan(p?.plan || 'free')
      setLoading(false)
    })
  }, [])

  const handleUpgrade = async () => {
    setUpgrading(true)
    const { data: { session } } = await createClient().auth.getSession()
    if (!session) { setUpgrading(false); return }

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setUpgrading(false)
  }

  const handleManage = async () => {
    setUpgrading(true)
    const { data: { session } } = await createClient().auth.getSession()
    if (!session) { setUpgrading(false); return }

    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    const { url } = await res.json()
    if (url) window.location.href = url
    else setUpgrading(false)
  }

  return (
    <div className="max-w-2xl">
      <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-7 transition-colors">
        <ArrowLeft size={14} /> Volver
      </Link>

      <div className="flex items-center gap-3 mb-7">
        <div className="bg-amber-100 p-2.5 rounded-xl">
          <Crown size={20} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Plan y facturación</h1>
          <p className="text-sm text-gray-400">Gestiona tu suscripción a Cobre</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 flex items-center gap-3 mb-6">
          <Check size={18} className="text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-emerald-800">¡Suscripción activada! Ya tienes acceso a Cobre Pro.</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Free plan */}
          <div className={`bg-white rounded-2xl border-2 p-6 flex flex-col ${plan === 'free' ? 'border-indigo-300' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-gray-900">Gratuito</h2>
              {plan === 'free' && <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Plan actual</span>}
            </div>
            <p className="text-3xl font-extrabold text-gray-900 mb-4">0 €<span className="text-base font-medium text-gray-400">/mes</span></p>
            <ul className="space-y-2 flex-1">
              {[
                `Hasta ${FREE_LIMITS.clients} clientes`,
                `Hasta ${FREE_LIMITS.invoices} facturas`,
                'Proyectos ilimitados',
                'Exportación PDF',
              ].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <Check size={14} className="text-gray-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro plan */}
          <div className={`rounded-2xl border-2 p-6 flex flex-col ${plan === 'pro' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-indigo-300'}`}>
            <div className="flex items-center justify-between mb-1">
              <h2 className={`font-bold flex items-center gap-1.5 ${plan === 'pro' ? 'text-white' : 'text-gray-900'}`}>
                <Zap size={15} className={plan === 'pro' ? 'text-amber-300' : 'text-amber-500'} />
                Pro
              </h2>
              {plan === 'pro' && <span className="text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">Plan actual</span>}
            </div>
            <p className={`text-3xl font-extrabold mb-4 ${plan === 'pro' ? 'text-white' : 'text-gray-900'}`}>
              12 €<span className={`text-base font-medium ${plan === 'pro' ? 'text-indigo-200' : 'text-gray-400'}`}>/mes</span>
            </p>
            <ul className="space-y-2 flex-1">
              {[
                'Clientes ilimitados',
                'Facturas ilimitadas',
                'Proyectos ilimitados',
                'Exportación PDF',
                'Recordatorios automáticos',
                'Soporte prioritario',
              ].map(f => (
                <li key={f} className={`flex items-center gap-2 text-sm ${plan === 'pro' ? 'text-indigo-100' : 'text-gray-600'}`}>
                  <Check size={14} className={`shrink-0 ${plan === 'pro' ? 'text-indigo-200' : 'text-indigo-500'}`} /> {f}
                </li>
              ))}
            </ul>
            {plan === 'free' ? (
              <button onClick={handleUpgrade} disabled={upgrading}
                className="mt-5 w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
                {upgrading ? 'Redirigiendo...' : 'Mejorar a Pro'}
              </button>
            ) : (
              <button onClick={handleManage} disabled={upgrading}
                className="mt-5 w-full bg-white/20 hover:bg-white/30 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60">
                {upgrading ? 'Cargando...' : 'Gestionar suscripción'}
              </button>
            )}
          </div>

        </div>
      )}

      <p className="text-xs text-gray-400 mt-5 text-center">
        Pagos procesados de forma segura por Stripe. Cancela cuando quieras.
      </p>
    </div>
  )
}
