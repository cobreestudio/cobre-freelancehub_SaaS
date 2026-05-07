'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { clientStore } from '@/lib/store'
import { Client } from '@/lib/types'
import { Plus, Trash2, Mail, Phone, Building, Pencil, Check, X, Users, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/hooks/useToast'
import ToastContainer from '@/components/ToastContainer'

const statusStyle: Record<Client['status'], string> = {
  active:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  inactive: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
}

type StatusFilter = 'all' | Client['status']

export default function ClientsPage() {
  const t = useTranslations('clients')
  const tc = useTranslations('common')
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Client>>({})
  const { toasts, show, dismiss } = useToast()

  useEffect(() => { clientStore.getAll().then(setClients) }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return clients.filter(c => {
      const matchSearch = !q || c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.company?.toLowerCase().includes(q) ?? false)
      const matchStatus = statusFilter === 'all' || c.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [clients, search, statusFilter])

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return
    await clientStore.delete(id)
    clientStore.getAll().then(setClients)
    show(t('deleted'))
  }

  const startEdit = (c: Client) => {
    setEditingId(c.id)
    setEditForm({ name: c.name, email: c.email, phone: c.phone, company: c.company, status: c.status, notes: c.notes })
  }

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    show('Email copiado')
  }

  const saveEdit = async (c: Client) => {
    if (!editForm.name?.trim() || !editForm.email?.trim()) return
    await clientStore.update({ ...c, ...editForm, name: editForm.name.trim(), email: editForm.email.trim() })
    clientStore.getAll().then(setClients)
    setEditingId(null)
    show(t('updated'))
  }

  const filterBtns: { label: string; value: StatusFilter }[] = [
    { label: t('filterAll'), value: 'all' },
    { label: t('filterActive'), value: 'active' },
    { label: t('filterInactive'), value: 'inactive' },
  ]

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {filtered.length} {tc('of')} {clients.length} {clients.length === 1 ? t('unit') : t('unitPlural')}
          </p>
        </div>
        <Link href="/clients/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus size={15} /> {t('newClient')}
        </Link>
      </div>

      {clients.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="input pl-9" />
          </div>
          <div className="flex gap-1.5">
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

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={20} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-600 mb-1">{t('emptyTitle')}</p>
          <p className="text-gray-400 text-sm mb-5">{t('emptyDesc')}</p>
          <Link href="/clients/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
            <Plus size={14} /> {t('addFirst')}
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
          {filtered.map(client => (
            <div key={client.id} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
              {editingId === client.id ? (
                <div className="space-y-3 py-1">
                  <div className="grid grid-cols-2 gap-3">
                    <input autoFocus value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Nombre" className="input" />
                    <input value={editForm.email || ''} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Email" className="input" />
                    <input value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Teléfono" className="input" />
                    <input value={editForm.company || ''} onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                      placeholder="Empresa" className="input" />
                    <textarea value={editForm.notes || ''} onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder={t('notesPlaceholder')} rows={2} className="input col-span-2 resize-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={editForm.status}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value as Client['status'] })}
                      className="input w-auto">
                      <option value="active">{t('active')}</option>
                      <option value="inactive">{t('inactive')}</option>
                    </select>
                    <button onClick={() => saveEdit(client)}
                      className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                      <Check size={14} /> {t('save')}
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                      <X size={14} /> {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-indigo-600">{client.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900 truncate">{client.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusStyle[client.status]}`}>
                        {t(client.status)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                      {client.email && <span onClick={() => copyEmail(client.email)} className="flex items-center gap-1 cursor-pointer hover:text-indigo-500 transition-colors"><Mail size={11} />{client.email}</span>}
                      {client.phone && <span className="flex items-center gap-1"><Phone size={11} />{client.phone}</span>}
                      {client.company && <span className="flex items-center gap-1"><Building size={11} />{client.company}</span>}
                    </div>
                    {client.notes && (
                      <p className="text-xs text-gray-300 mt-0.5 truncate max-w-sm">{client.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(client)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(client.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
