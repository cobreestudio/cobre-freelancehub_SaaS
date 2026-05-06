'use client'

import { useEffect, useState } from 'react'
import { clientStore, projectStore, invoiceStore } from '@/lib/store'
import { Users, FolderKanban, FileText, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  clients: number
  activeProjects: number
  pendingInvoices: number
  totalRevenue: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    clients: 0,
    activeProjects: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    const clients = clientStore.getAll()
    const projects = projectStore.getAll()
    const invoices = invoiceStore.getAll()

    setStats({
      clients: clients.length,
      activeProjects: projects.filter(p => p.status === 'in_progress').length,
      pendingInvoices: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length,
      totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    })
  }, [])

  const cards = [
    { label: 'Clientes totales', value: stats.clients, icon: Users, color: 'bg-blue-500', href: '/clients' },
    { label: 'Proyectos activos', value: stats.activeProjects, icon: FolderKanban, color: 'bg-indigo-500', href: '/projects' },
    { label: 'Facturas pendientes', value: stats.pendingInvoices, icon: FileText, color: 'bg-amber-500', href: '/invoices' },
    { label: 'Ingresos cobrados', value: `${stats.totalRevenue.toLocaleString('es-ES')} €`, icon: TrendingUp, color: 'bg-green-500', href: '/invoices' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bienvenido a FreelanceHub. Todo tu negocio de un vistazo.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
        {cards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">{label}</span>
              <div className={`${color} p-2 rounded-lg`}>
                <Icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/clients/new"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
          >
            <Users size={20} className="text-gray-400 group-hover:text-indigo-500" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">Nuevo cliente</span>
          </Link>
          <Link href="/projects/new"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
          >
            <FolderKanban size={20} className="text-gray-400 group-hover:text-indigo-500" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">Nuevo proyecto</span>
          </Link>
          <Link href="/invoices/new"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors group"
          >
            <FileText size={20} className="text-gray-400 group-hover:text-indigo-500" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-600">Nueva factura</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
