'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { invoiceStore, projectStore, profileStore } from '@/lib/store'
import { Invoice, InvoiceItem, Project } from '@/lib/types'
import { ArrowLeft, ReceiptText, Crown, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FREE_LIMITS } from '@/lib/plans'

const newItem = (): InvoiceItem => ({ description: '', quantity: 1, unitPrice: 0 })

export default function NewInvoicePage() {
  const t = useTranslations('invoices')
  const tc = useTranslations('common')
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [items, setItems] = useState<InvoiceItem[]>([newItem()])
  const [ivaRate, setIvaRate] = useState(21)
  const [irpfRate, setIrpfRate] = useState(15)
  const [applyIrpf, setApplyIrpf] = useState(false)
  const [form, setForm] = useState({
    projectId: '',
    dueDate: '',
    status: 'draft' as Invoice['status'],
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setForm(f => ({ ...f, dueDate: nextMonth.toISOString().split('T')[0] }))
    Promise.all([profileStore.get(), invoiceStore.getAll(), projectStore.getAll()]).then(([prof, invoices, projs]) => {
      setProjects(projs)
      if ((prof?.plan || 'free') === 'free' && invoices.length >= FREE_LIMITS.invoices) setBlocked(true)
    })
  }, [])

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
  const ivaAmount = subtotal * (ivaRate / 100)
  const irpfAmount = applyIrpf ? subtotal * (irpfRate / 100) : 0
  const total = subtotal + ivaAmount - irpfAmount
  const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const setItem = (index: number, field: keyof InvoiceItem, value: string) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item
      if (field === 'description') return { ...item, description: value }
      return { ...item, [field]: value === '' ? 0 : Number(value) }
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.projectId) { setError(t('projectRequired')); return }
    if (items.some(i => !i.description.trim())) { setError(t('descriptionRequired')); return }
    if (subtotal <= 0) { setError(t('amountRequired')); return }
    if (!form.dueDate) { setError(t('dueDateRequired')); return }

    setSaving(true)
    const project = projects.find(p => p.id === form.projectId)!
    const invoiceNumber = await invoiceStore.nextNumber()
    const invoice: Invoice = {
      id: crypto.randomUUID(),
      invoiceNumber,
      projectId: form.projectId,
      clientId: project.clientId,
      clientName: project.clientName,
      projectTitle: project.title,
      amount: subtotal,
      items,
      ivaRate,
      irpfRate: applyIrpf ? irpfRate : 0,
      status: form.status,
      dueDate: form.dueDate,
      createdAt: new Date().toISOString(),
    }
    await invoiceStore.add(invoice)
    router.push('/invoices')
  }

  const selectedProject = projects.find(p => p.id === form.projectId)

  if (blocked) return (
    <div className="max-w-lg">
      <Link href="/invoices" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-7 transition-colors">
        <ArrowLeft size={14} /> {t('backToInvoices')}
      </Link>
      <div className="bg-white rounded-2xl border-2 border-amber-200 p-8 text-center">
        <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown size={22} className="text-amber-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Límite del plan gratuito</h2>
        <p className="text-gray-500 text-sm mb-6">
          El plan gratuito permite hasta <strong>{FREE_LIMITS.invoices} facturas</strong>.<br />
          Mejora a Pro para crear facturas ilimitadas.
        </p>
        <Link href="/billing"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
          <Crown size={14} /> Ver planes
        </Link>
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl">
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg">{error}</div>
        )}

        {/* Proyecto */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('project')} *</label>
          <select
            value={form.projectId}
            onChange={e => {
              const p = projects.find(p => p.id === e.target.value)
              setForm(f => ({ ...f, projectId: e.target.value }))
              if (p) setItems([{ description: p.title, quantity: 1, unitPrice: p.budget }])
              if (error) setError('')
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

        {/* Líneas de concepto */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm font-medium text-gray-700 mb-4">{t('lineItems')}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2 font-medium">{t('itemDescription')}</th>
                  <th className="text-right pb-2 font-medium w-16 px-2">{t('itemQuantity')}</th>
                  <th className="text-right pb-2 font-medium w-28 px-2">{t('itemUnitPrice')}</th>
                  <th className="text-right pb-2 font-medium w-24">{t('itemTotal')}</th>
                  <th className="w-7"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => setItem(index, 'description', e.target.value)}
                        placeholder={t('itemPlaceholder')}
                        className="input text-sm"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={item.quantity === 0 ? '' : item.quantity}
                        onChange={e => setItem(index, 'quantity', e.target.value)}
                        min="0.5"
                        step="0.5"
                        placeholder="1"
                        className="input text-sm text-right w-full"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        value={item.unitPrice === 0 ? '' : item.unitPrice}
                        onChange={e => setItem(index, 'unitPrice', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0"
                        className="input text-sm text-right w-full"
                      />
                    </td>
                    <td className="py-2 pl-2 text-right font-semibold text-gray-700 whitespace-nowrap">
                      {fmt(item.quantity * item.unitPrice)} €
                    </td>
                    <td className="py-2 pl-1">
                      {items.length > 1 && (
                        <button type="button" onClick={() => setItems(prev => prev.filter((_, i) => i !== index))}
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => setItems(prev => [...prev, newItem()])}
            className="mt-3 flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
            <Plus size={14} /> {t('addLine')}
          </button>
        </div>

        {/* Impuestos y totales */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('ivaRate')} (%)</label>
              <div className="relative">
                <input
                  type="number"
                  value={ivaRate}
                  onChange={e => setIvaRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                  min="0" max="100"
                  className="input text-sm pr-7"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">%</span>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={applyIrpf} onChange={e => setApplyIrpf(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600" />
                {t('applyIrpf')} (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={irpfRate}
                  onChange={e => setIrpfRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                  min="0" max="100"
                  disabled={!applyIrpf}
                  className="input text-sm pr-7 disabled:opacity-40 disabled:cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>{t('subtotal')}</span>
              <span>{fmt(subtotal)} €</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>{t('ivaRate')} ({ivaRate}%)</span>
              <span>+{fmt(ivaAmount)} €</span>
            </div>
            {applyIrpf && (
              <div className="flex justify-between text-gray-500">
                <span>{t('applyIrpf')} ({irpfRate}%)</span>
                <span className="text-red-500">-{fmt(irpfAmount)} €</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2">
              <span>{t('totalInvoice')}</span>
              <span>{fmt(total)} €</span>
            </div>
          </div>
        </div>

        {/* Estado y vencimiento */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('status')}</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Invoice['status'] }))} className="input">
                <option value="draft">{t('draft')}</option>
                <option value="sent">{t('sent')}</option>
                <option value="paid">{t('paid')}</option>
                <option value="overdue">{t('overdue')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('dueDate_field')} *</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
            {saving ? tc('saving') : t('saveInvoice')}
          </button>
          <Link href="/invoices"
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">
            {tc('cancel')}
          </Link>
        </div>
      </form>
    </div>
  )
}
