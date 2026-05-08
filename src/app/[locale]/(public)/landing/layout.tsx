import type { Metadata } from 'next'

const BASE_URL = 'https://cobre-rho.vercel.app'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return {
    alternates: {
      canonical: `${BASE_URL}/${locale}/landing`,
      languages: {
        'es': `${BASE_URL}/es/landing`,
        'en': `${BASE_URL}/en/landing`,
        'fr': `${BASE_URL}/fr/landing`,
        'x-default': `${BASE_URL}/es/landing`,
      },
    },
  }
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
