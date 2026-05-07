'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { invoiceStore, projectStore } from '@/lib/store'
import { Invoice, Project } from '@/lib/types'
import { ArrowLeft, ReceiptText } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function NewInvoicePage() {
  const t = useTranslations('invoices')
  const tc = useTranslations('common')
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [form, setForm] = useState({
    projectId: '',
    amount: '',
    dueDate: '',
    status: 'draft' as Invoice['status'],
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    projectStore.getAll().then(setProjects)
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setForm(f => ({ ...f, dueDate: nextMonth.toISOString().split('T')[0] }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectId) { setError(t('projectRequired')); return }
    if (!form.amount || isNaN(Number(form.amount))) { setError(t('amountRequired')); return }
    if (!form.dueDate) { setError(t('dueDateRequired')); return }

    setSaving(true)
    const project = projects.find(p => p.id === form.projectId)!
    const invoice: Invoice = {
      id: crypto.randomUUID(),
      projectId: form.projectId,
      clientId: project.clientId,
      clientName: project.clientName,
      projectTitle: project.title,
      amount: Number(form.amount),
      status: form.status,
      dueDate: form.dueDate,
      createdAt: new Date().toISOString(),
    }

    await invoiceStore.add(invoice)
    router.push('/invoices')
  }

  const set = (field: string, val: string) => {
    setForm(f => ({ ...f, [field]: val }))
    if (error) setError('')
  }

  const selectedProject = projects.find(p => p.id === form.projectId)

  return (
    <div className="max-w-lg">
      <Link href="/invoices" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-7 transition-colors">
        <ArrowLeft size={14} /> {t('backToInvoices')}
      </Link>

      <div className="flex items-center gap-3 mb-7">
        <div className="bg-indigo-100 p-2.5 rounded-xl">
          <ReceiptText size={20} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('newInvoiceTitle')}</h1>
          <p className="text-sm text-gray-400">{t('newInvoiceSubtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('project')} *</label>
          <select
            value={form.projectId}
            onChange={e => {
              const p = projects.find(p => p.id === e.target.value)
              set('projectId', e.target.value)
              if (p) setForm(f => ({ ...f, projectId: e.target.value, amount: String(p.budget) }))
            }}
            className="input"
          >
            <option value="">{t('projectRequired')}</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title} — {p.clientName}</option>)}
          </select>
          {selectedProject && (
            <p className="text-xs text-gray-400 mt-1.5">
              {t('projectBudget')}: <span className="font-semibold text-gray-600">{selectedProject.budget.toLocaleString('es-ES')} €</span>
            </p>
          )}
          {projects.length === 0 && (
            <p className="text-xs text-amber-600 mt-1.5">
              {t('noProjects')} <Link href="/projects/new" className="underline font-medium">{t('createProjectFirst')}</Link>.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('amount')} *</label>
            <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)}
              placeholder="1500" min="0" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('status')}</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
              <option value="draft">{t('draft')}</option>
              <option value="sent">{t('sent')}</option>
              <option value="paid">{t('paid')}</option>
              <option value="overdue">{t('overdue')}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('dueDate_field')} *</label>
          <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} className="input" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving ? tc('saving') : t('saveInvoice')}
          </button>
          <Link href="/invoices"
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium"
          >
            {tc('cancel')}
          </Link>
        </div>
      </form>
    </div>
  )
}
