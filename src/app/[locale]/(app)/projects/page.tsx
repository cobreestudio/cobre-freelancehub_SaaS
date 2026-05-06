'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { projectStore, clientStore } from '@/lib/store'
import { Project, Client } from '@/lib/types'
import { Plus, Trash2, Euro, Calendar, Pencil, Check, X } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import ToastContainer from '@/components/ToastContainer'

const statusLabel: Record<Project['status'], string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

const statusColor: Record<Project['status'], string> = {
  pending: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Project>>({})
  const { toasts, show, dismiss } = useToast()

  useEffect(() => {
    projectStore.getAll().then(setProjects)
    clientStore.getAll().then(setClients)
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este proyecto?')) return
    await projectStore.delete(id)
    projectStore.getAll().then(setProjects)
    show('Proyecto eliminado')
  }

  const startEdit = (project: Project) => {
    setEditingId(project.id)
    setEditForm({ title: project.title, description: project.description, budget: project.budget, status: project.status })
  }

  const saveEdit = async (project: Project) => {
    if (!editForm.title?.trim()) return
    await projectStore.update({ ...project, ...editForm, title: editForm.title.trim() })
    projectStore.getAll().then(setProjects)
    setEditingId(null)
    show('Proyecto actualizado')
  }

  return (
    <div>
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-400 text-sm mt-0.5">{projects.length} proyecto{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/projects/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={15} />
          Nuevo proyecto
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-20 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Euro size={20} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">Sin proyectos todavía</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Crea tu primer proyecto para empezar a facturar.</p>
          <Link href="/projects/new" className="inline-block bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Crear proyecto
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map(project => (
            <div key={project.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              {editingId === project.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      autoFocus
                      value={editForm.title || ''}
                      onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Título del proyecto"
                      className="col-span-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="number"
                      value={editForm.budget || ''}
                      onChange={e => setEditForm({ ...editForm, budget: Number(e.target.value) })}
                      placeholder="Presupuesto €"
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={editForm.status}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value as Project['status'] })}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En progreso</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                  <textarea
                    value={editForm.description || ''}
                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Descripción (opcional)"
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button onClick={() => saveEdit(project)} className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                      <Check size={14} /> Guardar
                    </button>
                    <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                      <X size={14} /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="font-semibold text-gray-900">{project.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[project.status]}`}>
                        {statusLabel[project.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2.5">
                      Cliente: <span className="font-medium text-gray-600">{project.clientName}</span>
                    </p>
                    {project.description && (
                      <p className="text-sm text-gray-400 mb-2.5">{project.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Euro size={12} />
                        <span className="font-semibold text-gray-700">{project.budget.toLocaleString('es-ES')} €</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {new Date(project.startDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button onClick={() => startEdit(project)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(project.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
