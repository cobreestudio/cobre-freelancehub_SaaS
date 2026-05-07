'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { projectStore, clientStore } from '@/lib/store'
import { Project, Client } from '@/lib/types'
import { Plus, Trash2, Euro, Calendar, Pencil, Check, X, FolderKanban } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import ToastContainer from '@/components/ToastContainer'

const statusStyle: Record<Project['status'], string> = {
  pending:     'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  completed:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  cancelled:   'bg-gray-100 text-gray-500 ring-1 ring-gray-200',
}
const statusLabel: Record<Project['status'], string> = {
  pending: 'Pendiente', in_progress: 'En progreso', completed: 'Completado', cancelled: 'Cancelado',
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

  const startEdit = (p: Project) => {
    setEditingId(p.id)
    setEditForm({ title: p.title, description: p.description, budget: p.budget, status: p.status })
  }

  const saveEdit = async (p: Project) => {
    if (!editForm.title?.trim()) return
    await projectStore.update({ ...p, ...editForm, title: editForm.title.trim() })
    projectStore.getAll().then(setProjects)
    setEditingId(null)
    show('Proyecto actualizado')
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/projects/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus size={15} />
          Nuevo proyecto
        </Link>
      </div>

      {/* List */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderKanban size={20} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-600 mb-1">Sin proyectos todavía</p>
          <p className="text-gray-400 text-sm mb-5">Crea tu primer proyecto para empezar a facturar.</p>
          <Link href="/projects/new"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
            <Plus size={14} /> Crear proyecto
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {projects.map(project => (
            <div key={project.id} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
              {editingId === project.id ? (
                <div className="space-y-3 py-1">
                  <div className="grid grid-cols-2 gap-3">
                    <input autoFocus value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Título" className="input col-span-2" />
                    <input type="number" value={editForm.budget || ''} onChange={e => setEditForm({ ...editForm, budget: Number(e.target.value) })}
                      placeholder="Presupuesto €" className="input" />
                    <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as Project['status'] })}
                      className="input">
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En progreso</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                    <textarea value={editForm.description || ''} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Descripción (opcional)" rows={2}
                      className="input col-span-2 resize-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => saveEdit(project)}
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
                  {/* Icon */}
                  <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <FolderKanban size={16} className="text-indigo-500" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-gray-900 truncate">{project.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusStyle[project.status]}`}>
                        {statusLabel[project.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                      <span>{project.clientName}</span>
                      <span className="flex items-center gap-1">
                        <Euro size={10} />
                        <span className="font-semibold text-gray-600">{project.budget.toLocaleString('es-ES')} €</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(project.startDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{project.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(project)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(project.id)}
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
