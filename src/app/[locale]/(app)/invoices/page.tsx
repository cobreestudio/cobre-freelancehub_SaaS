'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { invoiceStore, profileStore } from '@/lib/store'
import { Invoice, Profile } from '@/lib/types'
import { Plus, Trash2, Euro, Calendar, TrendingUp, Clock, Download, Bell, FileText, Search, ArrowUpDown, Pencil, Check, X, Copy, FileDown, ImagePlus, Sparkles } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [duplicating, setDuplicating] = useState<string | null>(null)
  const [planBlocked, setPlanBlocked] = useState(false)
  const [sortBy, setSortBy] = useState<'dueDate' | 'createdAt'>('createdAt')
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ amount: string; dueDate: string }>({ amount: '', dueDate: '' })
  const [aiInvoice, setAiInvoice] = useState<Invoice | null>(null)
  const [aiEmail, setAiEmail] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const { toasts, show, dismiss } = useToast()

  useEffect(() => {
    Promise.all([invoiceStore.getAll(), profileStore.get()]).then(async ([data, prof]) => {
      setProfile(prof)
      if ((prof?.plan || 'free') === 'free') {
        const { FREE_LIMITS } = await import('@/lib/plans')
        if (data.length >= FREE_LIMITS.invoices) setPlanBlocked(true)
      }
      const today = new Date().toISOString().split('T')[0]
      const overdue = data.filter(i => i.status === 'sent' && i.dueDate < today)
      if (overdue.length > 0) {
        await Promise.all(overdue.map(i => invoiceStore.update({ ...i, status: 'overdue' })))
        invoiceStore.getAll().then(inv => { setInvoices(inv); setLoading(false) })
      } else {
        setInvoices(data); setLoading(false)
      }
    })
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return invoices
      .filter(i => {
        const matchSearch = !q || i.clientName.toLowerCase().includes(q) ||
          i.projectTitle.toLowerCase().includes(q)
        const matchStatus = statusFilter === 'all' || i.status === statusFilter
        return matchSearch && matchStatus
      })
      .sort((a, b) => {
        const da = sortBy === 'dueDate' ? a.dueDate : a.createdAt
        const db2 = sortBy === 'dueDate' ? b.dueDate : b.createdAt
        return da < db2 ? -1 : da > db2 ? 1 : 0
      })
  }, [invoices, search, statusFilter, sortBy])

  const handleEditStart = (invoice: Invoice) => {
    setEditId(invoice.id)
    setEditForm({ amount: String(invoice.amount), dueDate: invoice.dueDate })
  }

  const handleEditSave = async (invoice: Invoice) => {
    const amount = parseFloat(editForm.amount)
    if (isNaN(amount) || amount <= 0) return
    await invoiceStore.update({ ...invoice, amount, dueDate: editForm.dueDate })
    invoiceStore.getAll().then(setInvoices)
    setEditId(null)
    show('Factura actualizada')
  }

  const handleDelete = async (invoice: Invoice) => {
    if (!confirm(`¿Eliminar factura ${getInvoiceNumber(invoice, invoices.indexOf(invoice))}?`)) return
    await invoiceStore.delete(invoice.id)
    invoiceStore.getAll().then(setInvoices)
    show(t('deleted'))
  }

  const handleStatusChange = async (invoice: Invoice, status: Invoice['status']) => {
    const paidAt = status === 'paid' ? new Date().toISOString() : undefined
    await invoiceStore.update({ ...invoice, status, paidAt })
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

  const handleExportCSV = () => {
    const sep = ';'
    const fmt = (n: number) => n.toFixed(2).replace('.', ',')
    const statusLabel: Record<Invoice['status'], string> = {
      draft: t('draft'), sent: t('sent'), paid: t('paid'), overdue: t('overdue'),
    }
    const headers = ['Número', 'Cliente', 'Proyecto', 'Base imponible', 'IVA%', 'IVA €', 'IRPF%', 'IRPF €', 'Total factura', 'Estado', 'Vencimiento', 'Fecha cobro']
    const rows = filtered.map(inv => {
      const iva = inv.ivaRate ?? 21
      const irpf = inv.irpfRate ?? 0
      const ivaAmt = inv.amount * (iva / 100)
      const irpfAmt = inv.amount * (irpf / 100)
      return [
        getInvoiceNumber(inv, invoices.indexOf(inv)),
        inv.clientName,
        inv.projectTitle,
        fmt(inv.amount),
        iva,
        fmt(ivaAmt),
        irpf,
        fmt(irpfAmt),
        fmt(inv.amount + ivaAmt - irpfAmt),
        statusLabel[inv.status],
        inv.dueDate,
        inv.paidAt ? inv.paidAt.split('T')[0] : '',
      ]
    })
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(sep)).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `facturas-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url) }, 100)
    show(`${t('exportCsv')} · ${filtered.length} ${filtered.length === 1 ? t('unit') : t('unitPlural')}`)
  }

  const handleDuplicate = async (invoice: Invoice) => {
    if (planBlocked) { show('Límite del plan gratuito alcanzado', 'error'); return }
    setDuplicating(invoice.id)
    const invoiceNumber = await invoiceStore.nextNumber()
    await invoiceStore.add({
      ...invoice,
      id: crypto.randomUUID(),
      invoiceNumber,
      status: 'draft',
      paidAt: undefined,
      createdAt: new Date().toISOString(),
    })
    invoiceStore.getAll().then(data => { setInvoices(data); setPlanBlocked(false) })
    setDuplicating(null)
    show(t('duplicated'))
  }

  const handleAiCollections = async (invoice: Invoice) => {
    setAiInvoice(invoice)
    setAiEmail('')
    setAiLoading(true)
    try {
      const { createClient: createSupabaseClient } = await import('@/lib/supabase')
      const { data: { session } } = await createSupabaseClient().auth.getSession()
      if (!session) { setAiLoading(false); return }
      const res = await fetch('/api/ai/collections', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice }),
      })
      if (res.status === 403) {
        setAiEmail('__pro_required__')
        setAiLoading(false)
        return
      }
      const data = await res.json()
      if (!res.ok) {
        setAiEmail(`Error: ${data.error || res.status}`)
      } else {
        setAiEmail(data.email || '')
      }
    } catch (err) {
      setAiEmail(`Error: ${err instanceof Error ? err.message : 'Inténtalo de nuevo'}`)
    }
    setAiLoading(false)
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
  const filteredTotal = filtered.reduce((s, i) => s + i.amount, 0)
  const isFiltered = search !== '' || statusFilter !== 'all'
  const relativeDate = (dateStr: string) => {
    const diff = Math.round((new Date(dateStr).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000)
    if (diff === 0) return t('dueDate') + ' hoy'
    if (diff === 1) return t('dueDate') + ' mañana'
    if (diff === -1) return t('dueDate') + ' ayer'
    if (diff > 1 && diff < 8) return `${t('dueDate')} ${diff}d`
    return `${t('dueDate')} ${new Date(dateStr).toLocaleDateString('es-ES')}`
  }

  const dueDateColor = (dueDate: string) => {
    const diff = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000)
    if (diff < 0) return 'text-red-500'
    if (diff <= 7) return 'text-amber-500'
    return 'text-gray-400'
  }

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
            {isFiltered && filtered.length > 0 && (
              <span className="ml-2 text-indigo-500 font-semibold">· {filteredTotal.toLocaleString('es-ES')} €</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {invoices.length > 0 && (
            <button onClick={handleExportCSV}
              className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-600 px-3 py-2.5 rounded-xl text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors">
              <FileDown size={14} /> <span className="hidden sm:inline">{t('exportCsv')}</span>
            </button>
          )}
          <Link href="/invoices/import"
            className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-600 px-3 py-2.5 rounded-xl text-sm font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors">
            <ImagePlus size={14} /> <span className="hidden sm:inline">{t('importTitle')}</span>
          </Link>
          <Link href="/invoices/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus size={15} /> <span className="hidden xs:inline sm:inline">{t('newInvoice')}</span>
          </Link>
        </div>
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
          <button
            onClick={() => setSortBy(s => s === 'createdAt' ? 'dueDate' : 'createdAt')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 bg-white text-gray-500 hover:border-gray-300 transition-colors shrink-0"
          >
            <ArrowUpDown size={13} />
            {sortBy === 'dueDate' ? t('dueDate') : t('newInvoice')}
          </button>
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

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {[1,2,3].map(i => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-9 h-9 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-2/5" />
                <div className="h-3 bg-gray-100 rounded w-3/5" />
              </div>
            </div>
          ))}
        </div>
      ) : invoices.length === 0 ? (
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
                    <span onClick={() => { navigator.clipboard.writeText(getInvoiceNumber(invoice, invoices.indexOf(invoice))); show('Número copiado') }}
                      className="text-xs font-mono font-bold text-gray-300 cursor-pointer hover:text-indigo-400 transition-colors" title="Copiar número">
                      {getInvoiceNumber(invoice, invoices.indexOf(invoice))}
                    </span>
                    <span className="font-semibold text-gray-900 truncate">{invoice.clientName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusStyle[invoice.status]}`}>
                      {t(invoice.status)}
                    </span>
                    {invoice.status === 'overdue' && (() => {
                      const days = Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / 86400000)
                      return <span className="text-xs text-red-500 font-bold animate-pulse shrink-0">+{days}d ⚠</span>
                    })()}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400 mb-2">
                    <span>{invoice.projectTitle}</span>
                    <span className="flex items-center gap-1">
                      <Euro size={10} />
                      <span className="font-bold text-gray-700 text-sm">{invoice.amount.toLocaleString('es-ES')} €</span>
                      <span className="text-gray-300">+IVA {(invoice.amount * 1.21).toLocaleString('es-ES', { maximumFractionDigits: 0 })} €</span>
                    </span>
                    {invoice.paidAt ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <Calendar size={10} />
                        {t('paid')} {new Date(invoice.paidAt).toLocaleDateString('es-ES')}
                      </span>
                    ) : (
                      <span className={`flex items-center gap-1 ${dueDateColor(invoice.dueDate)}`}>
                        <Calendar size={10} />
                        {relativeDate(invoice.dueDate)}
                      </span>
                    )}
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
                  <button onClick={() => handleEditStart(invoice)} title="Editar"
                    className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDuplicate(invoice)} disabled={duplicating === invoice.id} title={t('duplicate')}
                    className="hidden sm:flex p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-40">
                    <Copy size={14} />
                  </button>
                  <button onClick={() => handleReminder(invoice)} title="Recordatorio por email"
                    className="hidden sm:flex p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                    <Bell size={14} />
                  </button>
                  {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                    <button onClick={() => handleAiCollections(invoice)} title="Redactar email con IA"
                      className="p-2 text-gray-400 hover:text-purple-500 hover:bg-purple-50 rounded-lg transition-colors">
                      <Sparkles size={14} />
                    </button>
                  )}
                  <button onClick={() => handleDownloadPDF(invoice, invoices.indexOf(invoice))} disabled={downloading === invoice.id}
                    title="Descargar PDF"
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-40">
                    <Download size={14} />
                  </button>
                  <button onClick={() => handleDelete(invoice)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {editId === invoice.id && (
                <div className="mt-3 ml-13 flex flex-wrap items-end gap-3 bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-100">
                  <div>
                    <label className="block text-xs font-medium text-indigo-700 mb-1">Importe (€)</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={editForm.amount}
                      onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))}
                      className="input w-32 text-sm"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-indigo-700 mb-1">Vencimiento</label>
                    <input
                      type="date"
                      value={editForm.dueDate}
                      onChange={e => setEditForm(f => ({ ...f, dueDate: e.target.value }))}
                      className="input text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditSave(invoice)}
                      className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                      <Check size={13} /> Guardar
                    </button>
                    <button onClick={() => setEditId(null)}
                      className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-500 text-xs font-medium px-3 py-2 rounded-lg hover:border-gray-300 transition-colors">
                      <X size={13} /> Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI Collections Modal */}
      {aiInvoice && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) { setAiInvoice(null); setAiEmail('') } }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="bg-purple-100 p-1.5 rounded-lg">
                  <Sparkles size={15} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Email de cobro con IA</p>
                  <p className="text-xs text-gray-400 truncate max-w-[240px]">{aiInvoice.clientName} · {aiInvoice.amount.toLocaleString('es-ES')} €</p>
                </div>
              </div>
              <button onClick={() => { setAiInvoice(null); setAiEmail('') }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Generando email personalizado…</p>
                </div>
              ) : aiEmail === '__pro_required__' ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={20} className="text-purple-400" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">Función Pro</p>
                  <p className="text-sm text-gray-500 mb-5">Los emails de cobro con IA están disponibles en el plan Pro.</p>
                  <a href="/billing"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                    Activar plan Pro
                  </a>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-400 mb-2 font-medium">Revisa y edita el email antes de enviarlo:</p>
                  <textarea
                    value={aiEmail}
                    onChange={e => setAiEmail(e.target.value)}
                    rows={12}
                    className="w-full text-sm font-mono text-gray-700 border border-gray-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none leading-relaxed"
                  />
                </>
              )}
            </div>

            {/* Modal footer */}
            {!aiLoading && aiEmail && aiEmail !== '__pro_required__' && (
              <div className="px-5 py-3 border-t border-gray-100 flex gap-2 justify-end">
                <button
                  onClick={() => { navigator.clipboard.writeText(aiEmail); show('Email copiado al portapapeles') }}
                  className="flex items-center gap-1.5 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <Copy size={13} /> Copiar
                </button>
                <button
                  onClick={() => {
                    const lines = aiEmail.split('\n')
                    const subjectLine = lines.find(l => l.startsWith('Asunto:'))
                    const subject = subjectLine ? encodeURIComponent(subjectLine.replace('Asunto:', '').trim()) : encodeURIComponent('Recordatorio de pago')
                    const bodyStart = subjectLine ? lines.indexOf(subjectLine) + 1 : 0
                    const body = encodeURIComponent(lines.slice(bodyStart).join('\n').trim())
                    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank')
                  }}
                  className="flex items-center gap-1.5 bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors">
                  <Bell size={13} /> Abrir en email
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
