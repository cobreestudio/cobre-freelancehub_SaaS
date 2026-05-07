'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { invoiceStore, projectStore, clientStore, profileStore } from '@/lib/store'
import { Invoice, InvoiceItem, Project, Client } from '@/lib/types'
import { ArrowLeft, ImagePlus, Loader2, CheckCircle, AlertCircle, Trash2, Plus, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { FREE_LIMITS } from '@/lib/plans'

type Step = 'upload' | 'analyzing' | 'review'

interface ParsedData {
  clientName: string | null
  projectTitle: string | null
  items: InvoiceItem[]
  ivaRate: number
  irpfRate: number
  dueDate: string | null
  invoiceNumber: string | null
}

const newItem = (): InvoiceItem => ({ description: '', quantity: 1, unitPrice: 0 })

export default function ImportInvoicePage() {
  const t = useTranslations('invoices')
  const tc = useTranslations('common')
  const router = useRouter()

  const [step, setStep] = useState<Step>('upload')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [parseError, setParseError] = useState('')
  const [saving, setSaving] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [dragging, setDragging] = useState(false)

  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  // Form state
  const [clientId, setClientId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([newItem()])
  const [ivaRate, setIvaRate] = useState(21)
  const [irpfRate, setIrpfRate] = useState(0)
  const [applyIrpf, setApplyIrpf] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<Invoice['status']>('sent')
  const [extractedClient, setExtractedClient] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setDueDate(nextMonth.toISOString().split('T')[0])

    Promise.all([clientStore.getAll(), projectStore.getAll(), profileStore.get(), invoiceStore.getAll()])
      .then(([cls, projs, prof, invs]) => {
        setClients(cls)
        setProjects(projs)
        if ((prof?.plan || 'free') === 'free' && invs.length >= FREE_LIMITS.invoices) setBlocked(true)
      })
  }, [])

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setParseError('Formato no válido. Usa JPG, PNG o WebP.'); return }
    if (file.size > 10 * 1024 * 1024) { setParseError('La imagen es demasiado grande (máx. 10 MB).'); return }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setParseError('')
    setStep('analyzing')

    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('/api/parse-invoice', { method: 'POST', body: formData })
      const data: ParsedData & { error?: string } = await res.json()

      if (!res.ok || data.error) {
        setParseError(t('parseError'))
        setStep('upload')
        return
      }

      setExtractedClient(data.clientName)
      if (data.items && data.items.length > 0) setItems(data.items)
      if (data.ivaRate) setIvaRate(data.ivaRate)
      if (data.irpfRate && data.irpfRate > 0) { setIrpfRate(data.irpfRate); setApplyIrpf(true) }
      if (data.dueDate) setDueDate(data.dueDate)
      setStep('review')
    } catch {
      setParseError(t('parseError'))
      setStep('upload')
    }
  }, [t])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const filteredProjects = projectId ? projects : clientId
    ? projects.filter(p => p.clientId === clientId)
    : projects

  const selectedProject = projects.find(p => p.id === projectId)

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
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId) { setError(t('projectRequired')); return }
    if (items.some(i => !i.description.trim())) { setError(t('descriptionRequired')); return }
    if (subtotal <= 0) { setError(t('amountRequired')); return }
    if (!dueDate) { setError(t('dueDateRequired')); return }

    setSaving(true)
    const project = projects.find(p => p.id === projectId)!
    const invoiceNumber = await invoiceStore.nextNumber()
    const invoice: Invoice = {
      id: crypto.randomUUID(),
      invoiceNumber,
      projectId,
      clientId: project.clientId,
      clientName: project.clientName,
      projectTitle: project.title,
      amount: subtotal,
      items,
      ivaRate,
      irpfRate: applyIrpf ? irpfRate : 0,
      status,
      dueDate,
      createdAt: new Date().toISOString(),
    }
    await invoiceStore.add(invoice)
    router.push('/invoices')
  }

  if (blocked) return (
    <div className="max-w-lg">
      <Link href="/invoices" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-7 transition-colors">
        <ArrowLeft size={14} /> {t('backToInvoices')}
      </Link>
      <div className="bg-white rounded-2xl border-2 border-amber-200 p-8 text-center">
        <p className="font-bold text-gray-900 mb-2">Límite del plan gratuito</p>
        <p className="text-gray-500 text-sm mb-6">Mejora a Pro para importar facturas ilimitadas.</p>
        <Link href="/billing" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
          Ver planes
        </Link>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl">
      <Link href="/invoices" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-7 transition-colors">
        <ArrowLeft size={14} /> {t('backToInvoices')}
      </Link>

      <div className="flex items-center gap-3 mb-7">
        <div className="bg-indigo-100 p-2.5 rounded-xl">
          <ImagePlus size={20} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('importTitle')}</h1>
          <p className="text-sm text-gray-400">{t('importSubtitle')}</p>
        </div>
      </div>

      {/* Upload / Analyzing step */}
      {(step === 'upload' || step === 'analyzing') && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} />

          <div
            onClick={() => step === 'upload' && fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-16 text-center transition-colors cursor-pointer ${
              step === 'analyzing'
                ? 'border-indigo-200 bg-indigo-50/50 cursor-default'
                : dragging
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            {step === 'analyzing' ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="text-indigo-500 animate-spin" />
                <p className="font-medium text-indigo-700">{t('analyzing')}</p>
                {imagePreview && (
                  <img src={imagePreview} alt="preview" className="mt-4 max-h-40 rounded-xl object-contain opacity-60" />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="bg-indigo-50 p-4 rounded-2xl">
                  <ImagePlus size={28} className="text-indigo-400" />
                </div>
                <p className="font-medium text-gray-700">{t('uploadZone')}</p>
                <p className="text-sm text-gray-400">{t('uploadFormats')}</p>
              </div>
            )}
          </div>

          {parseError && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
              <AlertCircle size={15} className="shrink-0" />
              {parseError}
            </div>
          )}
        </div>
      )}

      {/* Review step */}
      {step === 'review' && (
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Image preview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-4">
                {imagePreview && (
                  <img src={imagePreview} alt="Factura importada" className="w-full rounded-xl object-contain max-h-96" />
                )}
                <div className="mt-3 flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                  <span className="text-xs text-gray-500">Datos extraídos con IA</span>
                  <button type="button" onClick={() => { setStep('upload'); setImagePreview(null); setImageFile(null); setParseError('') }}
                    className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-500 transition-colors">
                    <RotateCcw size={11} /> {t('changeImage')}
                  </button>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3 space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg">{error}</div>
              )}

              {/* Cliente y proyecto */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <div>
                  {extractedClient && (
                    <p className="text-xs text-indigo-600 font-medium mb-1">
                      {t('extractedHint')} <span className="font-bold">{extractedClient}</span>
                    </p>
                  )}
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Cliente *</label>
                  <select value={clientId} onChange={e => { setClientId(e.target.value); setProjectId('') }} className="input">
                    <option value="">{t('selectOrCreate')}</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('project')} *</label>
                  <select value={projectId} onChange={e => setProjectId(e.target.value)} className="input">
                    <option value="">{t('projectRequired')}</option>
                    {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.title} — {p.clientName}</option>)}
                  </select>
                  {selectedProject && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      {t('projectBudget')}: <span className="font-semibold text-gray-600">{selectedProject.budget.toLocaleString('es-ES')} €</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Líneas */}
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
                            <input type="text" value={item.description}
                              onChange={e => setItem(index, 'description', e.target.value)}
                              placeholder={t('itemPlaceholder')} className="input text-sm" />
                          </td>
                          <td className="py-2 px-2">
                            <input type="number" value={item.quantity === 0 ? '' : item.quantity}
                              onChange={e => setItem(index, 'quantity', e.target.value)}
                              min="0.5" step="0.5" placeholder="1" className="input text-sm text-right w-full" />
                          </td>
                          <td className="py-2 px-2">
                            <input type="number" value={item.unitPrice === 0 ? '' : item.unitPrice}
                              onChange={e => setItem(index, 'unitPrice', e.target.value)}
                              min="0" step="0.01" placeholder="0" className="input text-sm text-right w-full" />
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
                      <input type="number" value={ivaRate}
                        onChange={e => setIvaRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                        min="0" max="100" className="input text-sm pr-7" />
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
                      <input type="number" value={irpfRate}
                        onChange={e => setIrpfRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                        min="0" max="100" disabled={!applyIrpf}
                        className="input text-sm pr-7 disabled:opacity-40 disabled:cursor-not-allowed" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>{t('subtotal')}</span><span>{fmt(subtotal)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>{t('ivaRate')} ({ivaRate}%)</span><span>+{fmt(ivaAmount)} €</span>
                  </div>
                  {applyIrpf && (
                    <div className="flex justify-between text-gray-500">
                      <span>{t('applyIrpf')} ({irpfRate}%)</span>
                      <span className="text-red-500">-{fmt(irpfAmount)} €</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-2">
                    <span>{t('totalInvoice')}</span><span>{fmt(total)} €</span>
                  </div>
                </div>
              </div>

              {/* Estado y vencimiento */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('status')}</label>
                    <select value={status} onChange={e => setStatus(e.target.value as Invoice['status'])} className="input">
                      <option value="draft">{t('draft')}</option>
                      <option value="sent">{t('sent')}</option>
                      <option value="paid">{t('paid')}</option>
                      <option value="overdue">{t('overdue')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('dueDate_field')} *</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60">
                  {saving ? tc('saving') : t('importBtn')}
                </button>
                <Link href="/invoices"
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                  {tc('cancel')}
                </Link>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
