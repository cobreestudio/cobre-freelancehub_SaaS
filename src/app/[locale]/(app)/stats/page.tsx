'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { clientStore, projectStore, invoiceStore } from '@/lib/store'
import { Client, Project, Invoice } from '@/lib/types'
import { BarChart2, TrendingUp, Users, Award, ArrowRight, Building, Sparkles, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

interface ClientStat {
  clientId: string
  name: string
  company?: string
  status: Client['status']
  totalInvoiced: number
  totalCollected: number
  totalPending: number
  projectCount: number
  invoiceCount: number
  collectionRate: number
}

function buildStats(clients: Client[], projects: Project[], invoices: Invoice[]): ClientStat[] {
  return clients.map(c => {
    const clientInvoices = invoices.filter(i => i.clientId === c.id)
    const clientProjects = projects.filter(p => p.clientId === c.id)
    const totalInvoiced = clientInvoices.reduce((s, i) => s + i.amount, 0)
    const totalCollected = clientInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
    const totalPending = clientInvoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
    const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0
    return {
      clientId: c.id,
      name: c.name,
      company: c.company,
      status: c.status,
      totalInvoiced,
      totalCollected,
      totalPending,
      projectCount: clientProjects.length,
      invoiceCount: clientInvoices.length,
      collectionRate,
    }
  }).sort((a, b) => b.totalInvoiced - a.totalInvoiced)
}

export default function StatsPage() {
  const t = useTranslations('stats')
  const locale = useLocale()
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiStreaming, setAiStreaming] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)

  useEffect(() => {
    Promise.all([clientStore.getAll(), projectStore.getAll(), invoiceStore.getAll()])
      .then(([c, p, i]) => { setClients(c); setProjects(p); setInvoices(i); setLoading(false) })
  }, [])

  const stats = useMemo(() => buildStats(clients, projects, invoices), [clients, projects, invoices])

  const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0)
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0)
  const totalPending = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
  const overdueInvoices = invoices.filter(i => i.status === 'overdue')
  const overdueAmount = overdueInvoices.reduce((s, i) => s + i.amount, 0)
  const collectionRate = totalInvoiced > 0 ? Math.round((totalRevenue / totalInvoiced) * 100) : 0
  const topClient = stats[0]
  const zeroRateClients = stats.filter(s => s.totalInvoiced > 0 && s.collectionRate === 0).length
  const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'pending').length

  const handleAiAdvisor = async () => {
    setAiOpen(true)
    if (aiAnalysis) return
    setAiLoading(true)
    try {
      const { createClient: createSupabaseClient } = await import('@/lib/supabase')
      const { data: { session } } = await createSupabaseClient().auth.getSession()
      if (!session) { setAiLoading(false); return }

      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: {
            totalClients: clients.length,
            activeClients: clients.filter(c => c.status === 'active').length,
            activeProjects,
            totalInvoiced,
            totalCollected: totalRevenue,
            totalPending,
            overdueCount: overdueInvoices.length,
            overdueAmount,
            collectionRate,
            topClient: topClient?.name || '—',
            topClientAmount: topClient?.totalInvoiced || 0,
            zeroRateClients,
          }
        }),
      })

      if (res.status === 403) {
        setAiAnalysis('__pro_required__')
        setAiLoading(false)
        return
      }
      if (!res.ok) {
        const data = await res.json()
        setAiAnalysis(`Error: ${data.error || res.status}`)
        setAiLoading(false)
        return
      }
      setAiLoading(false)
      setAiStreaming(true)
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setAiAnalysis(prev => prev + decoder.decode(value, { stream: true }))
      }
      setAiStreaming(false)
    } catch (err) {
      setAiAnalysis(`Error: ${err instanceof Error ? err.message : 'Inténtalo de nuevo'}`)
      setAiLoading(false)
      setAiStreaming(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-gray-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{t('subtitle')}</p>
        </div>
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart2 size={20} className="text-gray-400" />
          </div>
          <p className="font-semibold text-gray-600 mb-1">{t('noData')}</p>
          <p className="text-gray-400 text-sm mb-5">{t('noDataDesc')}</p>
          <Link href={`/${locale}/clients/new`}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors font-medium">
            {t('addClient')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{t('subtitle')}</p>
        </div>
        <button onClick={handleAiAdvisor}
          className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors shadow-sm">
          <Sparkles size={14} />
          <span className="hidden sm:inline">Análisis IA</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-blue-50 p-2.5 rounded-xl shrink-0">
            <Users size={18} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium mb-0.5 truncate">{t('totalClients')}</p>
            <p className="text-xl font-extrabold text-gray-900">{clients.length}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-emerald-50 p-2.5 rounded-xl shrink-0">
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium mb-0.5 truncate">{t('totalCollected')}</p>
            <p className="text-xl font-extrabold text-gray-900 truncate">{totalRevenue.toLocaleString('es-ES')} €</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="bg-amber-50 p-2.5 rounded-xl shrink-0">
            <Award size={18} className="text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium mb-0.5 truncate">{t('topClient')}</p>
            <p className="text-base font-extrabold text-gray-900 truncate">
              {topClient && topClient.totalInvoiced > 0 ? topClient.name : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Per-client breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{t('breakdown')}</h2>
          <span className="text-xs text-gray-400">{t('sortedBy')}</span>
        </div>

        {stats.every(s => s.totalInvoiced === 0) ? (
          <div className="py-16 text-center">
            <BarChart2 size={20} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">{t('noInvoicesYet')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.map((s, i) => (
              <div key={s.clientId} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 shrink-0 text-center">
                    {i === 0 && s.totalInvoiced > 0 ? (
                      <span className="text-base">🥇</span>
                    ) : i === 1 && s.totalInvoiced > 0 ? (
                      <span className="text-base">🥈</span>
                    ) : i === 2 && s.totalInvoiced > 0 ? (
                      <span className="text-base">🥉</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-300">#{i + 1}</span>
                    )}
                  </div>
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-indigo-600">{s.name.charAt(0).toUpperCase()}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 truncate">{s.name}</span>
                      {s.company && (
                        <span className="text-xs text-gray-400 flex items-center gap-0.5 shrink-0">
                          <Building size={10} />{s.company}
                        </span>
                      )}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
                        s.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
                      }`}>
                        {t(s.status === 'active' ? 'active' : 'inactive')}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-xs text-gray-400 mb-2">
                      <span>
                        <span className="font-semibold text-gray-700">{s.totalInvoiced.toLocaleString('es-ES')} €</span>
                        {' '}{t('invoiced')}
                      </span>
                      <span>
                        <span className="font-semibold text-emerald-600">{s.totalCollected.toLocaleString('es-ES')} €</span>
                        {' '}{t('collected')}
                      </span>
                      {s.totalPending > 0 && (
                        <span>
                          <span className="font-semibold text-amber-600">{s.totalPending.toLocaleString('es-ES')} €</span>
                          {' '}{t('pendingLabel')}
                        </span>
                      )}
                      <span>{s.projectCount} {s.projectCount === 1 ? t('projectUnit') : t('projectUnitPlural')}</span>
                      <span>{s.invoiceCount} {s.invoiceCount === 1 ? t('invoiceUnit') : t('invoiceUnitPlural')}</span>
                    </div>

                    {s.totalInvoiced > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${s.collectionRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 w-8 text-right shrink-0">
                          {s.collectionRate}%
                        </span>
                      </div>
                    )}
                  </div>

                  <Link href={`/${locale}/clients`}
                    className="p-2 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors shrink-0">
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending summary */}
      {totalPending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-800">{t('pendingAlert', { amount: totalPending.toLocaleString('es-ES') })}</p>
            <p className="text-xs text-amber-600 mt-0.5">{t('pendingAlertSub')}</p>
          </div>
          <Link href={`/${locale}/invoices`}
            className="inline-flex items-center gap-1.5 bg-amber-600 text-white text-sm px-3 py-2 rounded-xl hover:bg-amber-700 transition-colors font-medium shrink-0">
            {t('viewInvoices')} <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* AI Advisor Modal */}
      {aiOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setAiOpen(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="bg-purple-100 p-1.5 rounded-lg">
                  <Sparkles size={15} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Asesor financiero IA</p>
                  <p className="text-xs text-gray-400">Análisis de tu situación actual</p>
                </div>
              </div>
              <button onClick={() => setAiOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-5">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Analizando tu negocio…</p>
                </div>
              ) : aiAnalysis === '__pro_required__' ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={20} className="text-purple-400" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">Función Pro</p>
                  <p className="text-sm text-gray-500 mb-5">El asesor financiero IA está disponible en el plan Pro.</p>
                  <Link href={`/${locale}/billing`}
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                    Activar plan Pro
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {aiStreaming && aiAnalysis === '' && (
                    <div className="flex items-center gap-2 text-sm text-purple-500">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
                      Analizando…
                    </div>
                  )}
                  {aiAnalysis.split('\n').filter(l => l.trim()).map((line, i) => (
                    <div key={i} className={`flex gap-2.5 text-sm leading-relaxed ${
                      line.trim().startsWith('-') ? 'text-gray-700' : 'text-gray-500 text-xs mt-3'
                    }`}>
                      {line.trim().startsWith('-') && (
                        <span className="text-purple-400 font-bold shrink-0 mt-0.5">•</span>
                      )}
                      <span>{line.trim().startsWith('-') ? line.trim().slice(1).trim() : line.trim()}</span>
                    </div>
                  ))}
                  {aiStreaming && aiAnalysis !== '' && (
                    <span className="inline-block w-2 h-4 bg-purple-400 rounded-sm animate-pulse ml-1" />
                  )}
                </div>
              )}
            </div>

            {!aiLoading && !aiStreaming && aiAnalysis && aiAnalysis !== '__pro_required__' && !aiAnalysis.startsWith('Error') && (
              <div className="px-5 pb-4 flex justify-between items-center">
                <p className="text-xs text-gray-300">Generado por Claude Haiku</p>
                <button onClick={() => { setAiAnalysis(''); handleAiAdvisor() }}
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                  Regenerar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
