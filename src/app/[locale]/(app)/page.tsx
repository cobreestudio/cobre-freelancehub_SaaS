'use client'

import { useEffect, useState } from 'react'
import { clientStore, projectStore, invoiceStore } from '@/lib/store'
import { Invoice, Project } from '@/lib/types'
import { Users, FolderKanban, FileText, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

function monthlyRevenue(invoices: Invoice[]) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const total = invoices
      .filter(inv => inv.status === 'paid')
      .filter(inv => {
        const t = new Date(inv.createdAt)
        return t.getMonth() === d.getMonth() && t.getFullYear() === d.getFullYear()
      })
      .reduce((s, inv) => s + inv.amount, 0)
    return { mes: d.toLocaleString('es-ES', { month: 'short' }), ingresos: total }
  })
}

function projectStatus(projects: Project[]) {
  const map: Record<string, { name: string; color: string }> = {
    pending:     { name: 'Pendiente',    color: '#f59e0b' },
    in_progress: { name: 'En progreso',  color: '#6366f1' },
    completed:   { name: 'Completado',   color: '#10b981' },
    cancelled:   { name: 'Cancelado',    color: '#9ca3af' },
  }
  const counts: Record<string, number> = {}
  projects.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1 })
  return Object.entries(counts)
    .map(([k, v]) => ({ ...map[k], value: v }))
    .filter(d => d.value > 0)
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700 capitalize">{label}</p>
      <p className="text-indigo-600 font-bold">{payload[0].value.toLocaleString('es-ES')} €</p>
    </div>
  )
}

export default function Dashboard() {
  const t = useTranslations('dashboard')
  const [data, setData] = useState({ clients: 0, activeProjects: 0, pendingInvoices: 0, totalRevenue: 0 })
  const [revenueData, setRevenueData] = useState<ReturnType<typeof monthlyRevenue>>([])
  const [statusData, setStatusData] = useState<ReturnType<typeof projectStatus>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [clients, projects, invoices] = await Promise.all([
        clientStore.getAll(), projectStore.getAll(), invoiceStore.getAll(),
      ])
      setData({
        clients: clients.length,
        activeProjects: projects.filter(p => p.status === 'in_progress').length,
        pendingInvoices: invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length,
        totalRevenue: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0),
      })
      setRevenueData(monthlyRevenue(invoices))
      setStatusData(projectStatus(projects))
      setLoading(false)
    }
    load()
  }, [])

  const stats = [
    { label: t('totalClients'), value: data.clients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/clients' },
    { label: t('activeProjects'), value: data.activeProjects, icon: FolderKanban, color: 'text-indigo-600', bg: 'bg-indigo-50', href: '/projects' },
    { label: t('pendingInvoices'), value: data.pendingInvoices, icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', href: '/invoices' },
    { label: t('revenue'), value: `${data.totalRevenue.toLocaleString('es-ES')} €`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/invoices' },
  ]

  const hasRevenueData = revenueData.some(d => d.ingresos > 0)
  const hasStatusData = statusData.length > 0

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-400 text-sm mt-0.5">{t('subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}
            className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${bg} p-2.5 rounded-xl`}>
                <Icon size={18} className={color} />
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mb-0.5">
              {loading ? <span className="inline-block w-12 h-7 bg-gray-100 rounded animate-pulse" /> : value}
            </p>
            <p className="text-xs font-medium text-gray-400">{label}</p>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900">{t('revenueChart')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t('revenueChartSub')}</p>
            </div>
          </div>
          {!loading && hasRevenueData ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} barSize={32}>
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', radius: 6 }} />
                <Bar dataKey="ingresos" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <TrendingUp size={18} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">{t('noData')}</p>
              <p className="text-xs text-gray-300 mt-1">{t('noDataHint')}</p>
            </div>
          )}
        </div>

        {/* Project status donut */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900">{t('projectStatus')}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{t('projectStatusSub')}</p>
          </div>
          {!loading && hasStatusData ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="45%" innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle" iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>}
                />
                <Tooltip formatter={(v) => [`${v} proyecto${Number(v) !== 1 ? 's' : ''}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <FolderKanban size={18} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">{t('noProjects')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">{t('quickActions')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/clients/new', icon: Users, label: t('newClient'), color: 'group-hover:text-blue-500', border: 'group-hover:border-blue-300 group-hover:bg-blue-50' },
            { href: '/projects/new', icon: FolderKanban, label: t('newProject'), color: 'group-hover:text-indigo-500', border: 'group-hover:border-indigo-300 group-hover:bg-indigo-50' },
            { href: '/invoices/new', icon: FileText, label: t('newInvoice'), color: 'group-hover:text-emerald-500', border: 'group-hover:border-emerald-300 group-hover:bg-emerald-50' },
          ].map(({ href, icon: Icon, label, color, border }) => (
            <Link key={href} href={href}
              className={`group flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl transition-all ${border}`}>
              <Icon size={18} className={`text-gray-400 transition-colors ${color}`} />
              <span className="text-sm font-medium text-gray-500 group-hover:text-gray-800 transition-colors">{label}</span>
              <Plus size={14} className="text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
