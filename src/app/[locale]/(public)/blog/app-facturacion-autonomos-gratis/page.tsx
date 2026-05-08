import type { Metadata } from 'next'
import Link from 'next/link'
import { Coins, ArrowRight, CheckCircle } from 'lucide-react'

const BASE_URL = 'https://cobre-rho.vercel.app'
const APP_URL = 'https://cobre-rho.vercel.app'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'App de Facturación Gratis para Autónomos en 2025',
    description:
      'Crea y envía facturas sin registro ni tarjeta. Guía para elegir la mejor app de facturación gratuita para autónomos y comparativa de opciones reales.',
    alternates: {
      canonical: `${BASE_URL}/${locale}/blog/app-facturacion-autonomos-gratis`,
    },
    openGraph: {
      title: 'App de Facturación Gratis para Autónomos en 2025',
      description:
        'Crea y envía facturas sin registro ni tarjeta. Guía para elegir la mejor app de facturación gratuita para autónomos.',
      url: `${BASE_URL}/${locale}/blog/app-facturacion-autonomos-gratis`,
      type: 'article',
    },
    robots: { index: true, follow: true },
  }
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'App de Facturación Gratis para Autónomos en 2025',
  description:
    'Guía práctica para elegir la mejor app de facturación gratuita para autónomos españoles, con comparativa real y sin letra pequeña.',
  author: {
    '@type': 'Organization',
    name: 'Cobre Studio',
    url: BASE_URL,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Cobre Studio',
    url: BASE_URL,
  },
  datePublished: '2026-05-08',
  dateModified: '2026-05-08',
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${BASE_URL}/es/blog/app-facturacion-autonomos-gratis`,
  },
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-white">
        {/* Nav */}
        <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href={`/${locale}/landing`} className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Coins size={15} className="text-white" />
              </div>
              <span className="font-bold text-gray-900">Cobre</span>
            </Link>
            <Link
              href={`${APP_URL}/${locale}/register`}
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Empezar gratis
            </Link>
          </div>
        </nav>

        {/* Article */}
        <main className="max-w-3xl mx-auto px-6 py-12">
          <Link
            href={`/${locale}/landing`}
            className="text-sm text-indigo-600 hover:underline mb-8 inline-block"
          >
            ← Volver a inicio
          </Link>

          {/* Header */}
          <header className="mb-10">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">
              Guía para autónomos
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              App de facturación gratis para autónomos: qué mirar antes de
              elegir (y cómo empezar hoy)
            </h1>
            <p className="text-gray-500 text-sm">
              Actualizado: mayo 2025 · Lectura: 6 min
            </p>
          </header>

          {/* Intro */}
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Cuando empiezas como autónomo, la facturación parece un trámite
              menor. Hasta que llega el primer cliente en el extranjero, el
              primer IRPF que no sabes si aplicar o la primera factura que se
              pierde en un email y no cobras a tiempo. Entonces entiendes que
              necesitas una herramienta, no un documento Word.
            </p>
            <p className="text-gray-700 leading-relaxed mb-10">
              El problema es que la mayoría de apps de facturación piden que
              te registres, introduzcas una tarjeta y elijas un plan antes de
              dejar que toques nada. Esta guía es para los que quieren probar
              antes de comprometerse, y para los que simplemente no necesitan
              pagar por algo que puede ser gratuito.
            </p>

            {/* Section 1 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
              Qué necesita realmente una app de facturación para autónomos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Antes de comparar opciones, conviene tener claro qué funciones
              son imprescindibles y cuáles son ruido de marketing. Un autónomo
              en España necesita, como mínimo:
            </p>
            <ul className="space-y-3 mb-6">
              {[
                'Crear facturas con los campos legales obligatorios: número correlativo, fecha, datos fiscales del emisor y del receptor, concepto, base imponible, IVA e IRPF.',
                'Descargar o enviar la factura en PDF con un aspecto profesional.',
                'Llevar un registro de qué facturas están pagadas y cuáles pendientes.',
                'Guardar los datos de clientes para no rellenarlos cada vez.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <CheckCircle
                    size={18}
                    className="text-emerald-500 shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Todo lo demás —contabilidad, declaraciones trimestrales,
              integraciones con bancos— es útil cuando escales, pero no es lo
              que necesitas el primer año.
            </p>

            {/* Section 2 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
              Las trampas habituales del "gratis" en software de facturación
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              El término "gratis" en este sector tiene mucha letra pequeña.
              Estas son las trampas más frecuentes que encontrarás:
            </p>
            <div className="space-y-5 mb-6">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-1">
                  Gratis solo para la primera factura
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Algunas plataformas permiten crear una o dos facturas gratis
                  y luego te bloquean hasta que suscribes. No es gratuito,
                  es una prueba camuflada.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-1">
                  Gratis pero con marca de agua en el PDF
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Enviar una factura con el logo de otra empresa a un cliente
                  da muy mala imagen. Comprueba siempre cómo queda el PDF
                  antes de decidirte.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-1">
                  Gratis solo si introduces tarjeta
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Te piden método de pago "para cuando quieras actualizar" y
                  luego te cobran sin que te des cuenta si olvidas cancelar.
                  Si no hay plan gratuito real sin tarjeta, no es gratuito.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-1">
                  Plan gratuito real pero con interfaz inutilizable
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Algunas herramientas grandes tienen un tier gratuito tan
                  limitado en UX —notificaciones constantes para actualizar,
                  funciones clave bloqueadas, soporte nulo— que resulta
                  frustrante usarlo a diario.
                </p>
              </div>
            </div>

            {/* Section 3 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
              Qué diferencia a una buena app gratuita de una trampa
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Una app de facturación gratuita que merece ese nombre cumple
              estos criterios:
            </p>
            <ol className="space-y-4 mb-6 list-none">
              {[
                {
                  n: '1',
                  title: 'Plan gratuito permanente, no prueba de 14 días',
                  body: 'La gratuidad debe ser indefinida. Si tiene un límite de facturas razonable (por ejemplo, 30 al mes), es comprensible. Pero no debería tener fecha de caducidad.',
                },
                {
                  n: '2',
                  title: 'Sin tarjeta de crédito para empezar',
                  body: 'Registrarse con solo un email y contraseña es señal de que el plan gratuito es real. Si lo primero que te piden es un método de pago, desconfía.',
                },
                {
                  n: '3',
                  title: 'PDFs limpios sin marca de agua',
                  body: 'Tu factura es un documento fiscal y la imagen de tu negocio. Debe verse profesional desde el primer día, aunque uses el plan gratuito.',
                },
                {
                  n: '4',
                  title: 'IRPF e IVA configurables',
                  body: 'En España, el IRPF en facturas (generalmente el 15%, o el 7% los primeros años) es obligatorio en determinadas situaciones. La app debe permitirte añadirlo sin restricciones.',
                },
                {
                  n: '5',
                  title: 'Recordatorios de cobro automáticos',
                  body: 'Una de las funciones más valiosas para autónomos: que el sistema te avise —o avise al cliente— cuando una factura lleva X días sin pagarse.',
                },
              ].map((item) => (
                <li
                  key={item.n}
                  className="flex gap-4 bg-gray-50 rounded-xl p-5"
                >
                  <span className="text-indigo-600 font-extrabold text-lg shrink-0">
                    {item.n}.
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Section 4 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
              Cómo crear tu primera factura como autónomo paso a paso
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Independientemente de la herramienta que elijas, el proceso de
              crear una factura válida en España tiene siempre los mismos
              pasos:
            </p>
            <div className="space-y-4 mb-6">
              {[
                {
                  paso: 'Paso 1',
                  titulo: 'Datos del emisor (tú)',
                  cuerpo:
                    'Nombre completo o razón social, NIF/CIF, dirección fiscal completa. Si tienes número de identificación fiscal europeo (para facturas intracomunitarias), también lo necesitarás.',
                },
                {
                  paso: 'Paso 2',
                  titulo: 'Datos del receptor (tu cliente)',
                  cuerpo:
                    'Nombre o razón social, NIF/CIF o equivalente en su país, dirección. Para empresas extranjeras, el VAT number es imprescindible.',
                },
                {
                  paso: 'Paso 3',
                  titulo: 'Número y fecha',
                  cuerpo:
                    'El número debe ser correlativo y sin saltos. La fecha es la de emisión, no la de prestación del servicio (aunque pueden coincidir).',
                },
                {
                  paso: 'Paso 4',
                  titulo: 'Concepto y base imponible',
                  cuerpo:
                    'Describe el servicio con claridad. El importe antes de impuestos es la base imponible.',
                },
                {
                  paso: 'Paso 5',
                  titulo: 'IVA e IRPF',
                  cuerpo:
                    'El IVA general en España es el 21%. El IRPF a retener suele ser el 15% (7% en los tres primeros años de actividad si se cumplen ciertos requisitos). Aplícalos según corresponda.',
                },
                {
                  paso: 'Paso 6',
                  titulo: 'Total y método de pago',
                  cuerpo:
                    'Incluye el total a pagar, el número de cuenta IBAN y el plazo de pago acordado con el cliente.',
                },
              ].map((item) => (
                <div
                  key={item.paso}
                  className="border border-gray-100 rounded-xl p-5"
                >
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">
                    {item.paso}
                  </p>
                  <p className="font-semibold text-gray-900 mb-1">
                    {item.titulo}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.cuerpo}
                  </p>
                </div>
              ))}
            </div>

            {/* Section 5 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
              Una nota sobre el IRPF: cuándo aplicarlo y cuándo no
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Esta es la duda más frecuente. La regla general es esta: aplicas
              retención de IRPF cuando tu cliente es una empresa o profesional
              español que está obligado a retenerte. Si tu cliente es un
              particular o una empresa extranjera, normalmente no aplica
              retención.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              El porcentaje habitual es el 15%. Los autónomos que inician
              actividad pueden aplicar el 7% durante el año de alta y los dos
              siguientes, siempre que no hubieran ejercido la misma actividad
              en los cinco años previos.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Lo más práctico: habla con tu gestor la primera vez que tengas
              dudas. Una vez lo tienes claro, la app se encarga de calcular el
              importe automáticamente en cada factura.
            </p>

            {/* Section 6 */}
            <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">
              Por qué los recordatorios de pago son más importantes de lo que
              parecen
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Según datos de CEPYME, el plazo medio de cobro de los autónomos
              españoles supera los 80 días en muchos sectores. El principal
              motivo no es la insolvencia del cliente, sino el olvido. Las
              empresas gestionan decenas de facturas y las que no se reclaman
              tienden a acumularse.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Un recordatorio automático enviado a los 7, 15 o 30 días de la
              fecha de vencimiento elimina la incomodidad de tener que llamar
              o escribir manualmente. El cliente recibe un email profesional,
              no una llamada tensa, y el índice de cobro mejora
              significativamente.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Busca que tu app de facturación incluya esta función en el plan
              gratuito. Es una de las que más impacto tiene en el flujo de
              caja real de un autónomo.
            </p>

            {/* CTA Box */}
            <div className="bg-indigo-600 rounded-2xl p-8 mt-14 text-center">
              <h2 className="text-2xl font-bold text-white mb-3">
                Prueba Cobre gratis, sin tarjeta ni registro complicado
              </h2>
              <p className="text-indigo-100 mb-6 leading-relaxed max-w-xl mx-auto">
                Cobre es la app de facturación pensada para autónomos y
                freelancers españoles. Crea facturas con IVA e IRPF
                configurables, genera PDFs profesionales, gestiona tus
                clientes y proyectos, y activa recordatorios de cobro
                automáticos. El plan gratuito incluye hasta 30 facturas, 10
                clientes y 10 proyectos. Sin tarjeta. Sin fecha de caducidad.
              </p>
              <a
                href={`${APP_URL}/es/register`}
                className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-50 transition-colors text-base"
              >
                Crear cuenta gratuita
                <ArrowRight size={17} />
              </a>
              <p className="text-indigo-200 text-xs mt-4">
                Sin tarjeta de crédito · Listo en 2 minutos
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-6 px-6 text-center mt-16">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Cobre — Cobre Studio
          </p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link
              href={`/${locale}/privacy`}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Privacidad
            </Link>
            <span className="text-gray-300">·</span>
            <Link
              href={`/${locale}/terms`}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Términos
            </Link>
          </div>
        </footer>
      </div>
    </>
  )
}
