'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { clientStore } from '@/lib/store'
import { Client } from '@/lib/types'
import { ArrowLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function NewClientPage() {
  const t = useTranslations('clients')
  const tc = useTranslations('common')
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError(t('nameRequired')); return }
    if (!form.email.trim()) { setError(t('emailRequired')); return }

    setSaving(true)
    const client: Client = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      company: form.company.trim() || undefined,
      notes: form.notes.trim() || undefined,
      status: 'active',
      createdAt: new Date().toISOString(),
    }

    await clientStore.add(client)
    router.push('/clients')
  }

  const f = (field: keyof typeof form) => ({
    value: form[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm({ ...form, [field]: e.target.value })
      if (error) setError('')
    },
  })

  return (
    <div className="max-w-lg">
      <Link href="/clients" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-7 transition-colors">
        <ArrowLeft size={14} /> {t('backToClients')}
      </Link>

      <div className="flex items-center gap-3 mb-7">
        <div className="bg-indigo-100 p-2.5 rounded-xl">
          <UserPlus size={20} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('newClientTitle')}</h1>
          <p className="text-sm text-gray-400">{t('newClientSubtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg">{error}</div>
        )}

        <Field label={`${t('name')} *`}>
          <input ref={nameRef} type="text" placeholder={t('namePlaceholder')} {...f('name')}
            className="input" />
        </Field>

        <Field label={`${t('email')} *`}>
          <input type="email" placeholder={t('emailPlaceholder')} {...f('email')}
            className="input" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t('phone')}>
            <input type="tel" placeholder={t('phonePlaceholder')} {...f('phone')}
              className="input" />
          </Field>
          <Field label={t('company')}>
            <input type="text" placeholder={t('companyPlaceholder')} {...f('company')}
              className="input" />
          </Field>
        </div>

        <Field label={t('notes')}>
          <textarea placeholder={t('notesPlaceholder')} {...f('notes')}
            rows={3} className="input resize-none" />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving ? tc('saving') : t('saveClient')}
          </button>
          <Link href="/clients"
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium"
          >
            {tc('cancel')}
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
