'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Zap, Users, FolderKanban, FileText, CheckCircle, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const params = useParams()
  const locale = params.locale as string

  const features = [
    {
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      title: 'Gestión de clientes',
      desc: 'Centraliza toda la información de tus clientes. Contacto, empresa y estado en un vistazo.',
    },
    {
      icon: FolderKanban,
      color: 'bg-indigo-100 text-indigo-600',
      title: 'Control de proyectos',
      desc: 'Crea proyectos, asigna presupuesto y lleva el seguimiento del estado en tiempo real.',
    },
    {
      icon: FileText,
      color: 'bg-emerald-100 text-emerald-600',
      title: 'Facturas en PDF',
      desc: 'Genera facturas profesionales en un clic y envía recordatorios de cobro automáticamente.',
    },
  ]

  const perks = [
    '100% gratuito, sin límites',
    'Sin tarjeta de crédito',
    'Listo en menos de 1 minuto',
    'Datos seguros con Supabase',
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Zap size={15} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">FreelanceHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/${locale}/login`}
              className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">
              Iniciar sesión
            </Link>
            <Link href={`/${locale}/register`}
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-indigo-100">
          <Zap size={11} />
          Para freelancers y autónomos
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight max-w-3xl mb-6">
          Tu negocio freelance,{' '}
          <span className="text-indigo-600">organizado.</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mb-10 leading-relaxed">
          Gestiona clientes, proyectos y facturas desde un solo lugar. Sin complicaciones, sin costes.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-12">
          <Link href={`/${locale}/register`}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 text-base">
            Empieza gratis
            <ArrowRight size={17} />
          </Link>
          <Link href={`/${locale}/login`}
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-base">
            Ya tengo cuenta
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

      {/* Features */}
      <section className="bg-gray-50 border-t border-gray-100 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Todo lo que necesitas</h2>
            <p className="text-gray-500">Diseñado para que pases menos tiempo administrando y más tiempo creando.</p>
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

      {/* CTA final */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-gray-500 mb-8">Crea tu cuenta en menos de un minuto. Sin tarjeta de crédito.</p>
          <Link href={`/${locale}/register`}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 text-base">
            Crear cuenta gratis
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-6 text-center">
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} FreelanceHub — Hecho para freelancers
        </p>
      </footer>

    </div>
  )
}
