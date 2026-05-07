'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clientStore } from '@/lib/store'
import { Client } from '@/lib/types'
import { Plus, Trash2, Mail, Phone, Building, Pencil, Check, X, Users } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import ToastContainer from '@/components/ToastContainer'

const statusStyle: Record<Client['status'], string> = {
  active:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  inactive: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
}
const statusLabel: Record<Client['status'], string> = {
  active: 'Activo', inactive: 'Inactivo',
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Client>>({})
  const { toasts, show, dismiss } = useToast()

  useEffect(() => { clientStore.getAll().then(setClients) }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return
    await clientStore.delete(id)
    clientStore.getAll().then(setClients)
    show('Cliente eliminado')
  }

  const startEdit = (c: Client) => {
    setEditingId(c.id)
    setEditForm({ name: c.name, email: c.email, phone: c.phone, company: c.company, status: c.status })
  }

  const saveEdit = async (c: Client) => {
    if (!editForm.name?.trim() || !editForm.email?.trim()) return
    await clientStore.update({ ...c, ...editForm, name: editForm.name.trim(), email: editForm.email.trim() })
    clientStore.getAll().then(setClients)
    setEditingId(null)
    show('Cliente actualizado')
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/clients/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus size={15} />
          Nuevo cliente
        </Link>
      </div>

      {/* List */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={20} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-600 mb-1">Sin clientes todavía</p>
          <p className="text-gray-400 text-sm mb-5">Añade tu primer cliente para empezar.</p>
          <Link href="/clients/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
            <Plus size={14} /> Añadir cliente
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {clients.map(client => (
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
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={editForm.status}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value as Client['status'] })}
                      className="input w-auto">
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                    <button onClick={() => saveEdit(client)}
                      className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                      <Check size={14} /> Guardar
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                      <X size={14} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-indigo-600">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900 truncate">{client.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusStyle[client.status]}`}>
                        {statusLabel[client.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                      {client.email && <span className="flex items-center gap-1"><Mail size={11} />{client.email}</span>}
                      {client.phone && <span className="flex items-center gap-1"><Phone size={11} />{client.phone}</span>}
                      {client.company && <span className="flex items-center gap-1"><Building size={11} />{client.company}</span>}
                    </div>
                  </div>

                  {/* Actions */}
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
