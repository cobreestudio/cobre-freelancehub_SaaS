'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Coins, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const locale = useLocale()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
      <div className="bg-indigo-600 p-3 rounded-2xl mb-6">
        <Coins size={28} className="text-white" />
      </div>
      <h1 className="text-7xl font-extrabold text-indigo-600 mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Página no encontrada</h2>
      <p className="text-gray-400 text-sm mb-8 max-w-sm">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link href={`/${locale}`}
        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
        <ArrowLeft size={15} />
        Volver al inicio
      </Link>
    </div>
  )
}
