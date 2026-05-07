import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { Geist } from 'next/font/google'
import type { Metadata } from 'next'
import '../globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> }

const BASE_URL = 'https://cobre-rho.vercel.app'

const meta = {
  es: {
    title: 'Cobre — Gestión de Facturas para Autónomos y Freelancers',
    description: 'Gestiona clientes, proyectos y facturas desde un solo lugar. Genera PDFs profesionales, envía recordatorios de cobro automáticos y controla tus ingresos. Empieza gratis.',
    keywords: ['facturas autónomos', 'gestión facturas freelancer', 'crear facturas pdf', 'facturación online gratis', 'programa facturas', 'cobro freelance'],
  },
  en: {
    title: 'Cobre — Invoice Management for Freelancers',
    description: 'Manage clients, projects and invoices from one place. Generate professional PDFs, send automatic payment reminders and track your revenue. Start for free.',
    keywords: ['freelancer invoices', 'invoice management', 'create pdf invoices', 'billing software free', 'invoice tracker', 'freelance billing'],
  },
  fr: {
    title: 'Cobre — Gestion de Factures pour Freelances',
    description: 'Gérez vos clients, projets et factures depuis un seul endroit. Générez des PDFs professionnels, envoyez des rappels de paiement automatiques et suivez vos revenus. Gratuit.',
    keywords: ['factures freelance', 'gestion factures', 'créer factures pdf', 'logiciel facturation gratuit', 'suivi facturation', 'facturation indépendant'],
  },
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const m = meta[locale as keyof typeof meta] ?? meta.es
  const ogLocale = locale === 'fr' ? 'fr_FR' : locale === 'en' ? 'en_US' : 'es_ES'

  return {
    title: { default: m.title, template: '%s — Cobre' },
    description: m.description,
    keywords: m.keywords,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: `${BASE_URL}/${locale}/landing`,
      languages: { es: `${BASE_URL}/es/landing`, en: `${BASE_URL}/en/landing`, fr: `${BASE_URL}/fr/landing` },
    },
    openGraph: {
      title: m.title,
      description: m.description,
      url: `${BASE_URL}/${locale}/landing`,
      siteName: 'Cobre',
      locale: ogLocale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
    },
    robots: { index: true, follow: true },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!routing.locales.includes(locale as 'es' | 'en' | 'fr')) notFound()
  const messages = await getMessages()

  return (
    <html lang={locale} className={geist.variable}>
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cobre" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))
          }
        `}} />
      </body>
    </html>
  )
}
