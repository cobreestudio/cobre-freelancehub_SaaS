'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { invoiceStore, profileStore } from '@/lib/store'
import { Invoice, Profile } from '@/lib/types'
import { Plus, Trash2, Euro, Calendar, TrendingUp, Clock, Download, Bell } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import ToastContainer from '@/components/ToastContainer'

const statusLabel: Record<Invoice['status'], string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  paid: 'Cobrada',
  overdue: 'Vencida',
}

const statusColor: Record<Invoice['status'], string> = {
  draft: 'bg-gray-100 text-gray-500',
  sent: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const { toasts, show, dismiss } = useToast()

  useEffect(() => {
    invoiceStore.getAll().then(setInvoices)
    profileStore.get().then(setProfile)
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta factura?')) return
    await invoiceStore.delete(id)
    invoiceStore.getAll().then(setInvoices)
    show('Factura eliminada')
  }

  const handleStatusChange = async (invoice: Invoice, status: Invoice['status']) => {
    await invoiceStore.update({ ...invoice, status })
    invoiceStore.getAll().then(setInvoices)
    show(`Factura marcada como "${statusLabel[status]}"`)
  }

  const handleDownloadPDF = async (invoice: Invoice, index: number) => {
    setDownloading(invoice.id)
    const { generateInvoicePDF } = await import('@/lib/pdf')
    generateInvoicePDF(invoice, invoiceNumber(index), profile)
    setDownloading(null)
    show('PDF descargado correctamente')
  }

  const handleReminder = (invoice: Invoice) => {
    const subject = encodeURIComponent(`Recordatorio de pago — Factura ${invoiceNumber(invoices.indexOf(invoice))}`)
    const body = encodeURIComponent(
      `Hola ${invoice.clientName},\n\nTe recuerdo que tienes pendiente el pago de la factura correspondiente al proyecto "${invoice.projectTitle}" por un importe de ${invoice.amount.toLocaleString('es-ES')} €.\n\nFecha de vencimiento: ${new Date(invoice.dueDate).toLocaleDateString('es-ES')}\n\nQuedo a tu disposición para cualquier consulta.\n\nUn saludo.`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
    show('Abriendo cliente de correo...')
  }

  const paid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const pending = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
  const invoiceNumber = (index: number) => `FAC-${String(index + 1).padStart(3, '0')}`

  return (
    <div>
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-400 text-sm mt-0.5">{invoices.length} factura{invoices.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/invoices/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={15} />
          Nueva factura
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-100 p-2.5 rounded-xl">
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total cobrado</p>
            <p className="text-xl font-bold text-gray-900">{paid.toLocaleString('es-ES')} €</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 p-2.5 rounded-xl">
            <Clock size={18} className="text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Pendiente de cobro</p>
            <p className="text-xl font-bold text-gray-900">{pending.toLocaleString('es-ES')} €</p>
          </div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-20 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Euro size={20} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Sin facturas todavía</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Crea tu primera factura y empieza a cobrar.</p>
          <Link href="/invoices/new" className="inline-block bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Crear factura
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {invoices.map((invoice, i) => (
            <div key={invoice.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="text-xs font-mono font-bold text-gray-400">{invoiceNumber(i)}</span>
                    <h3 className="font-semibold text-gray-900">{invoice.clientName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[invoice.status]}`}>
                      {statusLabel[invoice.status]}
                    </span>
                    {invoice.status === 'overdue' && (
                      <span className="text-xs text-red-500 font-medium animate-pulse">⚠ Vencida</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{invoice.projectTitle}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Euro size={12} />
                      <span className="font-bold text-gray-800 text-base">{invoice.amount.toLocaleString('es-ES')} €</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      Vence: {new Date(invoice.dueDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {(['draft', 'sent', 'paid', 'overdue'] as Invoice['status'][]).map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(invoice, s)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all font-medium ${
                          invoice.status === s
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                            : 'border-gray-100 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                        }`}
                      >
                        {statusLabel[s]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => handleReminder(invoice)}
                    title="Enviar recordatorio por email"
                    className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Bell size={15} />
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(invoice, i)}
                    disabled={downloading === invoice.id}
                    title="Descargar PDF"
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-40"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(invoice.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
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
