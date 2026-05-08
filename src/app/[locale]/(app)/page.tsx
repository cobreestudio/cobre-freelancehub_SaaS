'use client'

import { useEffect, useState } from 'react'
import { clientStore, projectStore, invoiceStore, profileStore } from '@/lib/store'
import { Invoice, Project, Client, Profile } from '@/lib/types'
import { Users, FolderKanban, FileText, TrendingUp, TrendingDown, Plus, ArrowRight, Minus, AlertTriangle, Check, Receipt } from 'lucide-react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

function computeFiscal(invoices: Invoice[]) {
  const now = new Date()
  const year = now.getFullYear()
  const q = Math.floor(now.getMonth() / 3) + 1
  const qi = invoices.filter(i => {
    const d = new Date(i.createdAt)
    return d.getFullYear() === year && Math.floor(d.getMonth() / 3) + 1 === q
  })
  const iva = qi.reduce((s, i) => s + i.amount * ((i.ivaRate ?? 21) / 100), 0)
  const irpf = qi.reduce((s, i) => s + i.amount * ((i.irpfRate ?? 0) / 100), 0)
  const deadlineMonth = q === 4 ? 0 : q * 3
  const deadlineYear = q === 4 ? year + 1 : year
  const deadline = new Date(deadlineYear, deadlineMonth, 20)
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / 86400000)
  return { q, year, iva, irpf, deadline, daysLeft, count: qi.length }
}

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

export default function Dashboard() {
  const t = useTranslations('dashboard')
  const locale = useLocale()

  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [revenueData, setRevenueData] = useState<ReturnType<typeof monthlyRevenue>>([])
  const [statusData, setStatusData] = useState<ReturnType<typeof projectStatus>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [c, p, i, prof] = await Promise.all([
        clientStore.getAll(), projectStore.getAll(), invoiceStore.getAll(), profileStore.get(),
      ])
      setClients(c)
      setProjects(p)
      setInvoices(i)
      setProfile(prof)
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

  const isNewUser = !loading && clients.length === 0 && projects.length === 0 && invoices.length === 0
  const profileComplete = !!(profile?.businessName || profile?.taxId)

  const gettingStartedSteps = [
    { title: t('step1'), desc: t('step1Desc'), href: `/${locale}/profile`, done: profileComplete },
    { title: t('step2'), desc: t('step2Desc'), href: `/${locale}/clients/new`, done: clients.length > 0 },
    { title: t('step3'), desc: t('step3Desc'), href: `/${locale}/projects/new`, done: projects.length > 0 },
    { title: t('step4'), desc: t('step4Desc'), href: `/${locale}/invoices/new`, done: invoices.length > 0 },
  ]

  return (
    <div className="space-y-8">

      {/* Onboarding banner — only when user has data but profile incomplete */}
      {!loading && !isNewUser && profile !== null && !profileComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className="bg-amber-100 p-2 rounded-xl shrink-0">
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">{t('setupProfile')}</p>
            <p className="text-xs text-amber-600 mt-0.5">{t('setupProfileHint')}</p>
          </div>
          <Link href={`/${locale}/profile`}
            className="shrink-0 bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors">
            {t('goToProfile')}
          </Link>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-400 text-sm mt-0.5">{t('subtitle')}</p>
      </div>

      {/* Getting started checklist — new users only */}
      {isNewUser && (
        <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6">
          <h2 className="font-bold text-indigo-900 mb-0.5">{t('gettingStarted')}</h2>
          <p className="text-sm text-indigo-500 mb-5">{t('gettingStartedSub')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {gettingStartedSteps.map(({ title, desc, href, done }, i) => (
              <Link key={i} href={href}
                className={`group flex flex-col gap-2.5 p-4 rounded-xl border-2 transition-all ${
                  done
                    ? 'border-emerald-200 bg-white/60 opacity-70'
                    : 'border-indigo-200 bg-white hover:border-indigo-400 hover:shadow-sm'
                }`}>
                <div className="flex items-center justify-between">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    done ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    {done ? <Check size={12} /> : i + 1}
                  </span>
                  <ArrowRight size={13} className="text-indigo-300 group-hover:text-indigo-500 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

        <Link href={`/${locale}/clients`}
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

        <Link href={`/${locale}/projects`}
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

        <Link href={`/${locale}/invoices`}
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
            <p className="text-xs text-red-500 font-semibold animate-pulse">{t('overdueWarning', { count: overdueCount })}</p>
          )}
        </Link>

        <Link href={`/${locale}/invoices`}
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

      {/* Salud del negocio */}
      {!loading && invoices.length > 0 && (() => {
        const paidCount = invoices.filter(i => i.status === 'paid').length
        const pct = Math.round((paidCount / invoices.length) * 100)
        const color = pct >= 70 ? 'bg-emerald-400' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400'
        const textColor = pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-500'
        return (
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-400">{t('businessHealth')}</span>
                <span className={`text-xs font-bold ${textColor}`}>{pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span className="text-xs text-gray-300 shrink-0">{paidCount} / {invoices.length}</span>
          </div>
        )
      })()}

      {/* Widget fiscal trimestral */}
      {!loading && invoices.length > 0 && (() => {
        const { q, year, iva, irpf, deadline, daysLeft, count } = computeFiscal(invoices)
        if (count === 0) return null
        const urgent = daysLeft <= 30
        const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        const deadlineStr = deadline.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
        return (
          <div className={`bg-white rounded-2xl border p-5 flex items-start gap-4 ${urgent ? 'border-amber-200' : 'border-gray-100'}`}>
            <div className={`p-2.5 rounded-xl shrink-0 ${urgent ? 'bg-amber-50' : 'bg-indigo-50'}`}>
              <Receipt size={18} className={urgent ? 'text-amber-600' : 'text-indigo-500'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900">Reserva fiscal — T{q} {year}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${urgent ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-600'}`}>
                  {daysLeft > 0 ? `${daysLeft}d para declarar` : 'Vencido'}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                <span className="text-gray-500">IVA a declarar: <strong className="text-gray-900">{fmt(iva)} €</strong></span>
                {irpf > 0 && <span className="text-gray-500">IRPF retenido: <strong className="text-gray-900">{fmt(irpf)} €</strong></span>}
              </div>
              <p className="text-xs text-gray-400 mt-1">Modelo 303 · Plazo: {deadlineStr} · Basado en {count} factura{count !== 1 ? 's' : ''} del trimestre</p>
            </div>
            <Link href={`/${locale}/stats`} className="shrink-0 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors whitespace-nowrap">
              Ver análisis →
            </Link>
          </div>
        )
      })()}

      {/* Comparativa mensual */}
      {!loading && (thisRevenue > 0 || lastRevenue > 0 || thisPaid > 0 || thisClients > 0) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">{t('monthlyComparison')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          {loading ? (
            <div className="h-[200px] flex items-end gap-2 px-2 animate-pulse">
              {[60, 90, 45, 120, 75, 160].map((h, i) => (
                <div key={i} className="flex-1 bg-gray-100 rounded-t-lg" style={{ height: `${h}px` }} />
              ))}
            </div>
          ) : hasRevenueData ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} barSize={32}>
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6', radius: 6 }} />
                <Bar dataKey="ingresos" radius={[6, 6, 0, 0]} fill="#6366f1" />
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

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="mb-6">
            <h2 className="font-semibold text-gray-900">{t('projectStatus')}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{t('projectStatusSub')}</p>
          </div>
          {loading ? (
            <div className="h-[200px] flex flex-col items-center justify-center gap-4 animate-pulse">
              <div className="w-28 h-28 rounded-full border-[16px] border-gray-100" />
              <div className="flex gap-3">
                {[80, 60, 70].map((w, i) => (
                  <div key={i} className="h-3 bg-gray-100 rounded-full" style={{ width: `${w}px` }} />
                ))}
              </div>
            </div>
          ) : hasStatusData ? (
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
            { href: `/${locale}/clients/new`, icon: Users, label: t('newClient'), color: 'group-hover:text-blue-500', border: 'group-hover:border-blue-300 group-hover:bg-blue-50' },
            { href: `/${locale}/projects/new`, icon: FolderKanban, label: t('newProject'), color: 'group-hover:text-indigo-500', border: 'group-hover:border-indigo-300 group-hover:bg-indigo-50' },
            { href: `/${locale}/invoices/new`, icon: FileText, label: t('newInvoice'), color: 'group-hover:text-emerald-500', border: 'group-hover:border-emerald-300 group-hover:bg-emerald-50' },
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
