'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Zap, CheckCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const params = useParams()
  const locale = params.locale as string
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-2xl mb-4">
          <CheckCircle size={24} className="text-emerald-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">¡Cuenta creada!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Hemos enviado un enlace de confirmación a <strong>{form.email}</strong>. Revisa tu bandeja de entrada y pulsa el enlace para activar tu cuenta.
        </p>
        <Link href={`/${locale}/login`} className="text-indigo-600 text-sm font-medium hover:underline">
          Volver al login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-4">
        <Link href={`/${locale}/landing`} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← Volver al inicio
        </Link>
      </div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl mb-4">
          <Zap size={22} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">FreelanceHub</h1>
        <p className="text-gray-400 text-sm mt-1">Crea tu cuenta gratuita</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="tu@email.com" required autoFocus className="input" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              required
              className="input pr-10"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar contraseña</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              placeholder="Repite la contraseña"
              required
              className="input pr-10"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-4">
        ¿Ya tienes cuenta?{' '}
        <Link href={`/${locale}/login`} className="text-indigo-600 font-medium hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
