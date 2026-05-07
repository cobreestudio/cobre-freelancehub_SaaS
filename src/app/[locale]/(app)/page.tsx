'use client'

import { useEffect, useState } from 'react'
import { clientStore, projectStore, invoiceStore } from '@/lib/store'
import { Invoice, Project, Client } from '@/lib/types'
import { Users, FolderKanban, FileText, TrendingUp, TrendingDown, Plus, ArrowRight, Minus } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

// ── helpers ──────────────────────────────────────────────────────────────────

function revenueInMonth(invoices: Invoice[], year: number, month: number): number {
  return invoices
    .filter(i => i.status === 'paid')
    .filter(i => {
      const d = new Date(i.createdAt)
      return d.getFullYear() === year && d.getMonth() === month
    })
    .reduce((s, i) => s + i.amount, 0)
}

function countInMonth<T>(items: T[], getDate: (item: T) => string, year: number, month: number): number {
  return items.filter(item => {
    const d = new Date(getDate(item))
    return d.getFullYear() === year && d.getMonth() === month
  }).length
}

function growthPct(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null
  return Math.round(((current - previous) / previous) * 100)
}

function monthlyRevenue(invoices: Invoice[]) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const total = revenueInMonth(invoices, d.getFullYear(), d.getMonth())
    return { mes: d.toLocaleString('es-ES', { month: 'short' }), ingresos: total }
  })
}

function projectStatus(projects: Project[]) {
  const map: Record<string, { name: string; color: string }> = {
    pending:     { name: 'Pendiente',   color: '#f59e0b' },
    in_progress: { name: 'En progreso', color: '#6366f1' },
    completed:   { name: 'Completado',  color: '#10b981' },
    cancelled:   { name: 'Cancelado',   color: '#9ca3af' },
  }
  const counts: Record<string, number> = {}
  projects.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1 })
  return Object.entries(counts)
    .map(([k, v]) => ({ ...map[k], value: v }))
    .filter(d => d.value > 0)
}

// ── subcomponents ─────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700 capitalize">{label}</p>
      <p className="text-indigo-600 font-bold">{payload[0].value.toLocaleString('es-ES')} €</p>
    </div>
  )
}

function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null
  if (pct === 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-gray-400">
      <Minus size={10} /> 0%
    </span>
  )
  const up = pct > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${up ? 'text-emerald-600' : 'text-red-500'}`}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? '+' : ''}{pct}%
    </span>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const t = useTranslations('dashboard')

  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [revenueData, setRevenueData] = useState<ReturnType<typeof monthlyRevenue>>([])
  const [statusData, setStatusData] = useState<ReturnType<typeof projectStatus>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [c, p, i] = await Promise.all([
        clientStore.getAll(), projectStore.getAll(), invoiceStore.getAll(),
      ])
      setClients(c)
      setProjects(p)
      setInvoices(i)
      setRevenueData(monthlyRevenue(i))
      setStatusData(projectStatus(p))
      setLoading(false)
    }
    load()
  }, [])

  const now = new Date()
  const cy = now.getFullYear(), cm = now.getMonth()
  const ly = cm === 0 ? cy - 1 : cy
  const lm = cm === 0 ? 11 : cm - 1

  const thisRevenue = revenueInMonth(invoices, cy, cm)
  const lastRevenue = revenueInMonth(invoices, ly, lm)
  const revGrowth   = growthPct(thisRevenue, lastRevenue)

  const thisPaid  = countInMonth(invoices, i => i.createdAt, cy, cm)
  const lastPaid  = countInMonth(invoices, i => i.createdAt, ly, lm)
  const paidGrowth = growthPct(thisPaid, lastPaid)

  const thisClients = countInMonth(clients, c => c.createdAt, cy, cm)
  const lastClients = countInMonth(clients, c => c.createdAt, ly, lm)
  const clientGrowth = growthPct(thisClients, lastClients)

  const totalRevenue    = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const activeProjects  = projects.filter(p => p.status === 'in_progress').length
  const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length
  const overdueCount    = invoices.filter(i => i.status === 'overdue').length

  const hasRevenueData = revenueData.some(d => d.ingresos > 0)
  const hasStatusData  = statusData.length > 0

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-400 text-sm mt-0.5">{t('subtitle')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Clientes */}
        <Link href="/clients"
          className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <Users size={18} className="text-blue-600" />
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mb-0.5">
            {loading ? <span className="inline-block w-12 h-7 bg-gray-100 rounded animate-pulse" /> : clients.length}
          </p>
          <p className="text-xs font-medium text-gray-400 mb-1">{t('totalClients')}</p>
          {!loading && thisClients > 0 && (
            <p className="text-xs text-blue-500 font-medium">+{thisClients} {t('newThisMonth')}</p>
          )}
        </Link>

        {/* Proyectos activos */}
        <Link href="/projects"
          className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-50 p-2.5 rounded-xl">
              <FolderKanban size={18} className="text-indigo-600" />
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mb-0.5">
            {loading ? <span className="inline-block w-12 h-7 bg-gray-100 rounded animate-pulse" /> : activeProjects}
          </p>
          <p className="text-xs font-medium text-gray-400">{t('activeProjects')}</p>
        </Link>

        {/* Facturas pendientes */}
        <Link href="/invoices"
          className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-50 p-2.5 rounded-xl">
              <FileText size={18} className="text-amber-600" />
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mb-0.5">
            {loading ? <span className="inline-block w-12 h-7 bg-gray-100 rounded animate-pulse" /> : pendingInvoices}
          </p>
          <p className="text-xs font-medium text-gray-400 mb-1">{t('pendingInvoices')}</p>
          {!loading && overdueCount > 0 && (
            <p className="text-xs text-red-500 font-semibold animate-pulse">{overdueCount} vencida{overdueCount !== 1 ? 's' : ''} ⚠</p>
          )}
        </Link>

        {/* Ingresos este mes */}
        <Link href="/invoices"
          className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-50 p-2.5 rounded-xl">
              <TrendingUp size={18} className="text-emerald-600" />
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
          </div>
          <p className="text-2xl font-extrabold text-gray-900 mb-0.5">
            {loading
              ? <span className="inline-block w-16 h-7 bg-gray-100 rounded animate-pulse" />
              : `${thisRevenue.toLocaleString('es-ES')} €`
            }
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-400">{t('thisMonthRevenue')}</p>
            {!loading && <TrendBadge pct={revGrowth} />}
          </div>
          {!loading && (
            <p className="text-xs text-gray-300 mt-0.5">{t('historicRevenue')}: {totalRevenue.toLocaleString('es-ES')} €</p>
          )}
        </Link>
      </div>

      {/* Comparativa mensual */}
      {!loading && (thisRevenue > 0 || lastRevenue > 0 || thisPaid > 0 || thisClients > 0) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">{t('monthlyComparison')}</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: t('thisMonthRevenue'), current: `${thisRevenue.toLocaleString('es-ES')} €`, prev: `${lastRevenue.toLocaleString('es-ES')} €`, pct: revGrowth },
              { label: t('paidInvoices'), current: String(thisPaid), prev: String(lastPaid), pct: paidGrowth },
              { label: t('newClients'), current: String(thisClients), prev: String(lastClients), pct: clientGrowth },
            ].map(({ label, current, prev, pct }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-medium mb-2">{label}</p>
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-lg font-extrabold text-gray-900">{current}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t('previousMonth')}: {prev}</p>
                  </div>
                  <TrendBadge pct={pct} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-900">{t('revenueChart')}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t('revenueChartSub')}</p>
            </div>
            {!loading && revGrowth !== null && (
              <div className="text-right">
                <TrendBadge pct={revGrowth} />
                <p className="text-xs text-gray-300 mt-0.5">{t('vsLastMonth')}</p>
              </div>
            )}
          </div>
          {!loading && hasRevenueData ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} barSize={32}>
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', radius: 6 }} />
                <Bar dataKey="ingresos" radius={[6, 6, 0, 0]}
                  fill="#6366f1"
                  label={false}
                />
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
