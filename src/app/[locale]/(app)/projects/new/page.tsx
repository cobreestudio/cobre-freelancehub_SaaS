'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { projectStore, clientStore } from '@/lib/store'
import { Project, Client } from '@/lib/types'
import { ArrowLeft, FolderPlus } from 'lucide-react'
import Link from 'next/link'

export default function NewProjectPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [form, setForm] = useState({
    clientId: '',
    title: '',
    description: '',
    budget: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'pending' as Project['status'],
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    clientStore.getAll().then(setClients)
    setTimeout(() => titleRef.current?.focus(), 50)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientId) { setError('Selecciona un cliente'); return }
    if (!form.title.trim()) { setError('El título es obligatorio'); return }
    if (!form.budget || isNaN(Number(form.budget))) { setError('El presupuesto debe ser un número'); return }

    setSaving(true)
    const client = clients.find(c => c.id === form.clientId)!
    const project: Project = {
      id: crypto.randomUUID(),
      clientId: form.clientId,
      clientName: client.name,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      budget: Number(form.budget),
      startDate: form.startDate,
      status: form.status,
      createdAt: new Date().toISOString(),
    }

    await projectStore.add(project)
    router.push('/projects')
  }

  const set = (field: string, val: string) => {
    setForm(f => ({ ...f, [field]: val }))
    if (error) setError('')
  }

  return (
    <div className="max-w-lg">
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-7 transition-colors">
        <ArrowLeft size={14} /> Volver a proyectos
      </Link>

      <div className="flex items-center gap-3 mb-7">
        <div className="bg-indigo-100 p-2.5 rounded-xl">
          <FolderPlus size={20} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nuevo proyecto</h1>
          <p className="text-sm text-gray-400">Define el trabajo y el presupuesto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Cliente *</label>
          <select value={form.clientId} onChange={e => set('clientId', e.target.value)} className="input">
            <option value="">Selecciona un cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>)}
          </select>
          {clients.length === 0 && (
            <p className="text-xs text-amber-600 mt-1.5">
              No tienes clientes aún. <Link href="/clients/new" className="underline font-medium">Crea uno primero</Link>.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Título *</label>
          <input ref={titleRef} type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="Diseño web corporativo" className="input" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Descripción del proyecto..." rows={3}
            className="input resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Presupuesto (€) *</label>
            <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)}
              placeholder="1500" min="0" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
            <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
              <option value="pending">Pendiente</option>
              <option value="in_progress">En progreso</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de inicio</label>
          <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="input" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar proyecto'}
          </button>
          <Link href="/projects"
            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
