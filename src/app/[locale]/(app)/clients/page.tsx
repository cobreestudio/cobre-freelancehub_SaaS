'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clientStore } from '@/lib/store'
import { Client } from '@/lib/types'
import { Plus, Trash2, Mail, Phone, Building, Pencil, Check, X } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import ToastContainer from '@/components/ToastContainer'

const statusColor: Record<Client['status'], string> = {
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-500',
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Client>>({})
  const { toasts, show, dismiss } = useToast()

  useEffect(() => {
    clientStore.getAll().then(setClients)
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return
    await clientStore.delete(id)
    clientStore.getAll().then(setClients)
    show('Cliente eliminado')
  }

  const startEdit = (client: Client) => {
    setEditingId(client.id)
    setEditForm({ name: client.name, email: client.email, phone: client.phone, company: client.company, status: client.status })
  }

  const saveEdit = async (client: Client) => {
    if (!editForm.name?.trim() || !editForm.email?.trim()) return
    await clientStore.update({ ...client, ...editForm, name: editForm.name.trim(), email: editForm.email.trim() })
    clientStore.getAll().then(setClients)
    setEditingId(null)
    show('Cliente actualizado')
  }

  const cancelEdit = () => setEditingId(null)

  return (
    <div>
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-400 text-sm mt-0.5">{clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/clients/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={15} />
          Nuevo cliente
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-20 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail size={20} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Sin clientes todavía</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Añade tu primer cliente para empezar.</p>
          <Link href="/clients/new" className="inline-block bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Añadir cliente
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {clients.map(client => (
            <div key={client.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              {editingId === client.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      autoFocus
                      value={editForm.name || ''}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Nombre"
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      value={editForm.email || ''}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Email"
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      value={editForm.phone || ''}
                      onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Teléfono"
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      value={editForm.company || ''}
                      onChange={e => setEditForm({ ...editForm, company: e.target.value })}
                      placeholder="Empresa"
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={editForm.status}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value as Client['status'] })}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                    <button onClick={() => saveEdit(client)} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                      <Check size={14} /> Guardar
                    </button>
                    <button onClick={cancelEdit} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                      <X size={14} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[client.status]}`}>
                        {client.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      {client.email && <span className="flex items-center gap-1.5"><Mail size={12} />{client.email}</span>}
                      {client.phone && <span className="flex items-center gap-1.5"><Phone size={12} />{client.phone}</span>}
                      {client.company && <span className="flex items-center gap-1.5"><Building size={12} />{client.company}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button onClick={() => startEdit(client)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(client.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
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
