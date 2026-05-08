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
    title: 'Cobre — App de Facturación Gratis para Autónomos y Freelancers',
    description: 'La app de facturación gratuita para autónomos. Crea facturas PDF, gestiona clientes y proyectos, cobra más rápido y envía recordatorios automáticos. Empieza gratis.',
    keywords: ['facturas autónomos', 'app facturación autónomos', 'crear facturas pdf gratis', 'programa facturas freelancer', 'facturación online gratis', 'gestión facturas freelancer', 'facturar online autónomo', 'software facturación españa', 'cobro freelance', 'generar factura pdf'],
  },
  en: {
    title: 'Cobre — Free Invoice App for Freelancers',
    description: 'Free invoicing app for freelancers. Create PDF invoices, manage clients and projects, send automatic payment reminders and track your revenue. Start for free.',
    keywords: ['free invoicing app freelancers', 'invoice management', 'create pdf invoices free', 'billing software freelancer', 'invoice tracker', 'freelance billing app', 'online invoicing free'],
  },
  fr: {
    title: 'Cobre — App de Facturation Gratuite pour Freelances',
    description: 'App de facturation gratuite pour freelances. Créez des factures PDF, gérez vos clients et projets, envoyez des rappels automatiques. Commencez gratuitement.',
    keywords: ['app facturation gratuite freelance', 'gestion factures freelance', 'créer factures pdf gratuit', 'logiciel facturation gratuit', 'suivi facturation', 'facturation en ligne gratuite'],
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
      languages: {
        'es': `${BASE_URL}/es/landing`,
        'en': `${BASE_URL}/en/landing`,
        'fr': `${BASE_URL}/fr/landing`,
        'x-default': `${BASE_URL}/es/landing`,
      },
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
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
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
