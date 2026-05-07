'use client'

import { useEffect, useState } from 'react'
import { profileStore } from '@/lib/store'
import { Profile } from '@/lib/types'
import { User, Building, Phone, MapPin, Hash, Mail, Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/useToast'
import ToastContainer from '@/components/ToastContainer'

const empty: Profile = {
  fullName: '', businessName: '', email: '',
  phone: '', address: '', taxId: '',
}

export default function ProfilePage() {
  const t = useTranslations('profile')
  const [form, setForm] = useState<Profile>(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toasts, show, dismiss } = useToast()

  useEffect(() => {
    profileStore.get().then(p => {
      if (p) setForm(p)
      setLoading(false)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await profileStore.save(form)
    setSaving(false)
    show(t('saved'))
  }

  const set = (field: keyof Profile, val: string) =>
    setForm(f => ({ ...f, [field]: val }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-400 text-sm mt-0.5">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Datos personales */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <User size={16} className="text-indigo-600" />
            </div>
            <h2 className="font-semibold text-gray-800">{t('personalData')}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('fullName')}</label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                placeholder={t('fullNamePlaceholder')}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Mail size={13} />{t('email')}</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Phone size={13} />{t('phone')}</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder={t('phonePlaceholder')}
                className="input"
              />
            </div>
          </div>
        </section>

        {/* Datos de negocio */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Building size={16} className="text-emerald-600" />
            </div>
            <h2 className="font-semibold text-gray-800">{t('businessData')}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Building size={13} />{t('businessName')}</span>
              </label>
              <input
                type="text"
                value={form.businessName}
                onChange={e => set('businessName', e.target.value)}
                placeholder={t('businessNamePlaceholder')}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><Hash size={13} />{t('taxId')}</span>
              </label>
              <input
                type="text"
                value={form.taxId}
                onChange={e => set('taxId', e.target.value)}
                placeholder={t('taxIdPlaceholder')}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5"><MapPin size={13} />{t('address')}</span>
              </label>
              <input
                type="text"
                value={form.address}
                onChange={e => set('address', e.target.value)}
                placeholder={t('addressPlaceholder')}
                className="input"
              />
            </div>
          </div>
        </section>

        {/* Preview */}
        {(form.fullName || form.businessName) && (
          <section className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-3">{t('previewTitle')}</p>
            <div className="text-sm text-gray-700 space-y-0.5">
              {form.businessName && <p className="font-bold text-gray-900">{form.businessName}</p>}
              {form.fullName && <p>{form.fullName}</p>}
              {form.taxId && <p>NIF: {form.taxId}</p>}
              {form.address && <p>{form.address}</p>}
              {form.email && <p>{form.email}</p>}
              {form.phone && <p>{form.phone}</p>}
            </div>
          </section>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 shadow-sm"
        >
          <Save size={15} />
          {saving ? t('saving') : t('save')}
        </button>
      </form>
    </div>
  )
}
