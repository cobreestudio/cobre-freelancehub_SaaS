import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { Geist } from 'next/font/google'
import '../globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> }

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
