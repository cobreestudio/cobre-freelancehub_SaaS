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
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
