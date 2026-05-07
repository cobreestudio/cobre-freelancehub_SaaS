'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { invoiceStore, profileStore } from '@/lib/store'
import { Invoice, Profile } from '@/lib/types'
import { Plus, Trash2, Euro, Calendar, TrendingUp, Clock, Download, Bell, FileText, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/useToast'
import ToastContainer from '@/components/ToastContainer'

const statusStyle: Record<Invoice['status'], string> = {
  draft:   'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
  sent:    'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  paid:    'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  overdue: 'bg-red-50 text-red-700 ring-1 ring-red-200',
}

type StatusFilter = 'all' | Invoice['status']

export default function InvoicesPage() {
  const t = useTranslations('invoices')
  const tc = useTranslations('common')
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [downloading, setDownloading] = useState<string | null>(null)
  const { toasts, show, dismiss } = useToast()

  useEffect(() => {
    invoiceStore.getAll().then(setInvoices)
    profileStore.get().then(setProfile)
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return invoices.filter(i => {
      const matchSearch = !q || i.clientName.toLowerCase().includes(q) ||
        i.projectTitle.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || i.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [invoices, search, statusFilter])

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return
    await invoiceStore.delete(id)
    invoiceStore.getAll().then(setInvoices)
    show(t('deleted'))
  }

  const handleStatusChange = async (invoice: Invoice, status: Invoice['status']) => {
    await invoiceStore.update({ ...invoice, status })
    invoiceStore.getAll().then(setInvoices)
    show(t('statusChanged', { status: t(status) }))
  }

  const handleDownloadPDF = async (invoice: Invoice, index: number) => {
    setDownloading(invoice.id)
    const { generateInvoicePDF } = await import('@/lib/pdf')
    generateInvoicePDF(invoice, getInvoiceNumber(invoice, index), profile)
    setDownloading(null)
    show(t('pdfDownloaded'))
  }

  const handleReminder = (invoice: Invoice) => {
    const subject = encodeURIComponent(`Recordatorio de pago — Factura ${getInvoiceNumber(invoice, invoices.indexOf(invoice))}`)
    const body = encodeURIComponent(
      `Hola ${invoice.clientName},\n\nTe recuerdo que tienes pendiente el pago de la factura correspondiente al proyecto "${invoice.projectTitle}" por un importe de ${invoice.amount.toLocaleString('es-ES')} €.\n\nFecha de vencimiento: ${new Date(invoice.dueDate).toLocaleDateString('es-ES')}\n\nQuedo a tu disposición para cualquier consulta.\n\nUn saludo.`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
    show(t('reminderOpening'))
  }

  const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const pending = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
  const getInvoiceNumber = (invoice: Invoice, index: number) =>
    invoice.invoiceNumber || `FAC-${String(index + 1).padStart(3, '0')}`

  const filterBtns: { label: string; value: StatusFilter }[] = [
    { label: t('filterAll'), value: 'all' },
    { label: t('draft'), value: 'draft' },
    { label: t('sent'), value: 'sent' },
    { label: t('paid'), value: 'paid' },
    { label: t('overdue'), value: 'overdue' },
  ]

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {filtered.length} {tc('of')} {invoices.length} {invoices.length === 1 ? t('unit') : t('unitPlural')}
          </p>
        </div>
        <Link href="/invoices/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus size={15} /> {t('newInvoice')}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-emerald-50 p-2.5 rounded-xl shrink-0">
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">{t('totalPaid')}</p>
            <p className="text-xl font-extrabold text-gray-900">{paid.toLocaleString('es-ES')} €</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-amber-50 p-2.5 rounded-xl shrink-0">
            <Clock size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">{t('totalPending')}</p>
            <p className="text-xl font-extrabold text-gray-900">{pending.toLocaleString('es-ES')} €</p>
          </div>
        </div>
      </div>

      {invoices.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="input pl-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filterBtns.map(btn => (
              <button key={btn.value} onClick={() => setStatusFilter(btn.value)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  statusFilter === btn.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Euro size={20} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-600 mb-1">{t('emptyTitle')}</p>
          <p className="text-gray-400 text-sm mb-5">{t('emptyDesc')}</p>
          <Link href="/invoices/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
            <Plus size={14} /> {t('createFirst')}
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <Search size={20} className="text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-400">{t('noResults')}</p>
          <p className="text-sm text-gray-300 mt-1">{t('noResultsHint')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {filtered.map((invoice, i) => (
            <div key={invoice.id} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                  <FileText size={15} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono font-bold text-gray-300">{getInvoiceNumber(invoice, invoices.indexOf(invoice))}</span>
                    <span className="font-semibold text-gray-900 truncate">{invoice.clientName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusStyle[invoice.status]}`}>
                      {t(invoice.status)}
                    </span>
                    {invoice.status === 'overdue' && (
                      <span className="text-xs text-red-500 font-bold animate-pulse shrink-0">⚠</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400 mb-2">
                    <span>{invoice.projectTitle}</span>
                    <span className="flex items-center gap-1">
                      <Euro size={10} />
                      <span className="font-bold text-gray-700 text-sm">{invoice.amount.toLocaleString('es-ES')} €</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {t('dueDate')} {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {(['draft', 'sent', 'paid', 'overdue'] as Invoice['status'][]).map(s => (
                      <button key={s} onClick={() => handleStatusChange(invoice, s)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all font-medium ${
                          invoice.status === s
                            ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                            : 'border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                        }`}>
                        {t(s)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleReminder(invoice)} title="Recordatorio por email"
                    className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                    <Bell size={14} />
                  </button>
                  <button onClick={() => handleDownloadPDF(invoice, invoices.indexOf(invoice))} disabled={downloading === invoice.id}
                    title="Descargar PDF"
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-40">
                    <Download size={14} />
                  </button>
                  <button onClick={() => handleDelete(invoice.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
