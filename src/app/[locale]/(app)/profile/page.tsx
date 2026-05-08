'use client'

import { useEffect, useState } from 'react'
import { profileStore } from '@/lib/store'
import { Profile } from '@/lib/types'
import { User, Building, Phone, MapPin, Hash, Mail, Save, CreditCard, Download, Upload, Database } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/useToast'
import ToastContainer from '@/components/ToastContainer'
import { clientStore, projectStore, invoiceStore } from '@/lib/store'

const empty: Profile = {
  fullName: '', businessName: '', email: '',
  phone: '', address: '', taxId: '', plan: 'free',
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

  const [importing, setImporting] = useState(false)

  const set = (field: keyof Profile, val: string) =>
    setForm(f => ({ ...f, [field]: val }))

  const handleExport = async () => {
    const [clients, projects, invoices, profile] = await Promise.all([
      clientStore.getAll(), projectStore.getAll(), invoiceStore.getAll(), profileStore.get(),
    ])
    const data = { version: 1, exportedAt: new Date().toISOString(), profile, clients, projects, invoices }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cobre-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 100)
    show('Backup descargado')
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!data.version || !data.clients || !data.invoices) throw new Error('Formato inválido')
      await Promise.all([
        ...data.clients.map((c: any) => clientStore.add(c)),
        ...data.projects.map((p: any) => projectStore.add(p)),
        ...data.invoices.map((i: any) => invoiceStore.add(i)),
      ])
      if (data.profile) await profileStore.save(data.profile)
      show(`Importados: ${data.clients.length} clientes, ${data.projects.length} proyectos, ${data.invoices.length} facturas`)
    } catch {
      show('Archivo inválido o corrupto', 'error')
    }
    setImporting(false)
    e.target.value = ''
  }

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

        {/* Métodos de pago */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-amber-100 p-2 rounded-lg">
              <CreditCard size={16} className="text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">{t('paymentInfo')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t('paymentInfoHint')}</p>
            </div>
          </div>
          <textarea
            value={form.paymentInfo || ''}
            onChange={e => set('paymentInfo', e.target.value)}
            placeholder={t('paymentInfoPlaceholder')}
            rows={4}
            className="input resize-none w-full"
          />
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
              {form.paymentInfo && (
                <div className="mt-2 pt-2 border-t border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-400 mb-1">{t('paymentInfo')}</p>
                  {form.paymentInfo.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
              )}
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

      {/* Backup & restauración */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="bg-gray-100 p-2 rounded-lg">
            <Database size={16} className="text-gray-500" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">Copia de seguridad</h2>
            <p className="text-xs text-gray-400 mt-0.5">Exporta o importa todos tus datos (clientes, proyectos y facturas)</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport}
            className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors">
            <Download size={14} /> Exportar JSON
          </button>
          <label className={`inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer ${importing ? 'opacity-60 pointer-events-none' : ''}`}>
            <Upload size={14} /> {importing ? 'Importando…' : 'Importar JSON'}
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-3">La importación añade datos sin borrar los existentes. Útil para migrar entre dispositivos.</p>
      </div>
    </div>
  )
}
