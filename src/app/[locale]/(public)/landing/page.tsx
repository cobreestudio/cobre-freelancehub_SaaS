'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Coins, Users, FolderKanban, FileText, CheckCircle, ArrowRight, Check, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function LandingPage() {
  const t = useTranslations('landing')
  const params = useParams()
  const locale = params.locale as string

  const features = [
    { icon: Users,        color: 'bg-blue-100 text-blue-600',    title: t('feature1Title'), desc: t('feature1Desc') },
    { icon: FolderKanban, color: 'bg-indigo-100 text-indigo-600', title: t('feature2Title'), desc: t('feature2Desc') },
    { icon: FileText,     color: 'bg-emerald-100 text-emerald-600', title: t('feature3Title'), desc: t('feature3Desc') },
  ]

  const perks = [t('perk1'), t('perk2'), t('perk3'), t('perk4')]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Cobre',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      description: locale === 'es' ? 'Plan gratuito disponible' : locale === 'fr' ? 'Plan gratuit disponible' : 'Free plan available',
    },
    description: locale === 'es'
      ? 'Gestiona clientes, proyectos y facturas para autónomos. Genera PDFs profesionales y envía recordatorios automáticos.'
      : locale === 'fr'
      ? 'Gérez vos clients, projets et factures en tant que freelance.'
      : 'Manage clients, projects and invoices for freelancers. Generate professional PDFs and send automatic reminders.',
  }

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="min-h-screen bg-white flex flex-col">

      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Coins size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">Cobre</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/login`}
              className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">
              {t('login')}
            </Link>
            <Link href={`/${locale}/register`}
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
              {t('createFreeAccount')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-indigo-100">
          <Coins size={11} />
          {t('badge')}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight max-w-3xl mb-6">
          {t('heroTitle')}{' '}
          <span className="text-indigo-600">{t('heroHighlight')}</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed">
          {t('heroSubtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Link href={`/${locale}/register`}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 text-base">
            {t('startFree')}
            <ArrowRight size={17} />
          </Link>
          <Link href={`/${locale}/login`}
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-base">
            {t('alreadyHaveAccount')}
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {perks.map(p => (
            <span key={p} className="flex items-center gap-1.5 text-sm text-gray-400">
              <CheckCircle size={14} className="text-emerald-500 shrink-0" />
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* App mockup */}
      <section className="py-12 px-6 overflow-hidden bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 ring-1 ring-inset ring-black/5">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-700">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-600" />
                <div className="w-3 h-3 rounded-full bg-gray-600" />
                <div className="w-3 h-3 rounded-full bg-gray-600" />
              </div>
              <div className="flex-1 bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-400 mx-4 text-center max-w-xs mx-auto">
                cobre.app/dashboard
              </div>
            </div>
            {/* App UI */}
            <div className="flex h-56 sm:h-72">
              {/* Sidebar */}
              <div className="w-36 sm:w-44 bg-gray-950 p-3 shrink-0 hidden sm:flex flex-col">
                <div className="flex items-center gap-2 px-2 py-3 mb-3">
                  <div className="bg-indigo-500 p-1 rounded-md shrink-0">
                    <Coins size={11} className="text-white" />
                  </div>
                  <span className="text-xs font-bold text-white">Cobre</span>
                </div>
                {['Dashboard', 'Clientes', 'Proyectos', 'Facturas', 'Estadísticas'].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-0.5 text-xs font-medium ${i === 0 ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i === 0 ? 'bg-white' : 'bg-gray-600'}`} />
                    {item}
                  </div>
                ))}
              </div>
              {/* Dashboard content */}
              <div className="flex-1 bg-gray-50 p-4 overflow-hidden">
                <div className="mb-4 hidden sm:block">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-1.5" />
                  <div className="h-2.5 w-36 bg-gray-100 rounded" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {[
                    { color: 'bg-blue-50', val: '12', label: 'Clientes' },
                    { color: 'bg-indigo-50', val: '5', label: 'Proyectos' },
                    { color: 'bg-amber-50', val: '3', label: 'Pendientes' },
                    { color: 'bg-emerald-50', val: '4.200€', label: 'Ingresos' },
                  ].map((card, i) => (
                    <div key={i} className={`${card.color} rounded-xl p-2.5`}>
                      <p className="text-xs text-gray-400 mb-1 truncate">{card.label}</p>
                      <p className="text-sm font-bold text-gray-800">{card.val}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-3 border border-gray-100">
                  <div className="h-2.5 w-28 bg-gray-100 rounded mb-3" />
                  <div className="flex items-end gap-1 h-12 sm:h-16">
                    {[35, 55, 40, 75, 50, 90].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md transition-all"
                        style={{
                          height: `${h}%`,
                          background: i === 5 ? '#6366f1' : `rgba(99,102,241,${0.15 + i * 0.08})`
                        }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 border-t border-gray-100 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('featuresTitle')}</h2>
            <p className="text-gray-500">{t('featuresSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className={`inline-flex p-2.5 rounded-xl mb-4 ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('pricingTitle')}</h2>
            <p className="text-gray-500">{t('pricingSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">

            {/* Free */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('free')}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">0€</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {([t('freePerk1'), t('freePerk2'), t('freePerk3'), t('freePerk4')] as string[]).map(perk => (
                  <li key={perk} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Check size={15} className="text-emerald-500 shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link href={`/${locale}/register`}
                className="text-center py-2.5 rounded-xl border border-indigo-600 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors">
                {t('startFreeBtn')}
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-indigo-600 rounded-2xl p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <Zap size={11} />
                  {t('mostPopular')}
                </span>
              </div>
              <div className="mb-6">
                <p className="text-sm font-semibold text-indigo-200 uppercase tracking-wide mb-2">{t('pro')}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">12€</span>
                  <span className="text-indigo-200 text-sm mb-1">{t('perMonth')}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {([t('proPerk1'), t('proPerk2'), t('proPerk3'), t('proPerk4')] as string[]).map(perk => (
                  <li key={perk} className="flex items-center gap-2.5 text-sm text-white">
                    <Check size={15} className="text-indigo-200 shrink-0" />
                    {perk}
                  </li>
                ))}
              </ul>
              <Link href={`/${locale}/register`}
                className="text-center py-2.5 rounded-xl bg-white text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors">
                {t('upgradeBtn')}
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-6 text-center bg-gray-50 border-t border-gray-100">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-gray-500 mb-8">{t('ctaSubtitle')}</p>
          <Link href={`/${locale}/register`}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 text-base">
            {t('createFreeAccount')}
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-6 text-center">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Cobre — {t('footer')}
        </p>
      </footer>

    </div>
    </>
  )
}
