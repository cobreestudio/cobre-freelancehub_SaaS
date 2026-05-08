import Link from 'next/link'
import { Coins } from 'lucide-react'

const content = {
  es: {
    title: 'Términos y Condiciones',
    lastUpdated: 'Última actualización: mayo 2025',
    back: '← Volver a inicio',
    sections: [
      {
        heading: '1. Aceptación',
        body: 'Al crear una cuenta en Cobre (https://cobre-rho.vercel.app), aceptas estos Términos y Condiciones. Si no estás de acuerdo, no utilices el servicio.',
      },
      {
        heading: '2. Descripción del servicio',
        body: 'Cobre es una aplicación web de gestión de facturas, clientes y proyectos para autónomos y freelancers, desarrollada por Cobre Studio. Ofrecemos un plan gratuito y un plan Pro (12 €/mes).',
      },
      {
        heading: '3. Planes y pagos',
        body: 'El plan Free es gratuito con límites de uso (3 clientes, 5 proyectos, 10 facturas). El plan Pro se factura mensualmente a 12 €/mes mediante Stripe. Los precios incluyen IVA cuando corresponde. Las suscripciones se renuevan automáticamente hasta que las canceles.',
      },
      {
        heading: '4. Cancelación y reembolsos',
        body: 'Puedes cancelar tu suscripción Pro en cualquier momento desde la sección "Plan" de la app. La cancelación es efectiva al final del período facturado. No ofrecemos reembolsos por períodos parciales salvo obligación legal.',
      },
      {
        heading: '5. Uso aceptable',
        body: 'Te comprometes a no usar Cobre para actividades ilegales, fraudulentas o que dañen a terceros. No está permitido realizar ingeniería inversa, copiar o redistribuir el software. Nos reservamos el derecho a suspender cuentas que incumplan estas condiciones.',
      },
      {
        heading: '6. Propiedad intelectual',
        body: 'Cobre y todos sus componentes (diseño, código, marca) son propiedad de Cobre Studio. Los datos que introduces en la app (clientes, facturas, proyectos) son de tu propiedad y puedes exportarlos en cualquier momento.',
      },
      {
        heading: '7. Disponibilidad del servicio',
        body: 'Nos esforzamos por mantener el servicio disponible de forma continua, pero no garantizamos una disponibilidad del 100 %. Podemos realizar mantenimientos que impliquen interrupciones breves, avisando siempre que sea posible.',
      },
      {
        heading: '8. Limitación de responsabilidad',
        body: 'En la máxima medida permitida por la ley, Cobre Studio no será responsable de daños indirectos, lucro cesante ni pérdida de datos derivados del uso del servicio. Nuestra responsabilidad máxima se limita al importe pagado en los últimos 12 meses.',
      },
      {
        heading: '9. Modificaciones',
        body: 'Podemos modificar estos Términos. Te notificaremos por email con al menos 15 días de antelación ante cambios sustanciales. El uso continuado del servicio tras ese plazo implica la aceptación de los nuevos términos.',
      },
      {
        heading: '10. Legislación aplicable',
        body: 'Estos Términos se rigen por la legislación española. Para cualquier disputa, las partes se someten a los juzgados y tribunales de España, salvo que la normativa de protección al consumidor aplicable establezca otro fuero.',
      },
      {
        heading: '11. Contacto',
        body: 'Para cualquier consulta sobre estos Términos, escríbenos a cobreestudio@gmail.com.',
      },
    ],
  },
  en: {
    title: 'Terms and Conditions',
    lastUpdated: 'Last updated: May 2025',
    back: '← Back to home',
    sections: [
      {
        heading: '1. Acceptance',
        body: 'By creating an account on Cobre (https://cobre-rho.vercel.app), you accept these Terms and Conditions. If you disagree, do not use the service.',
      },
      {
        heading: '2. Service Description',
        body: 'Cobre is a web application for managing invoices, clients and projects for freelancers, developed by Cobre Studio. We offer a free plan and a Pro plan (€12/month).',
      },
      {
        heading: '3. Plans and Payments',
        body: 'The Free plan is free with usage limits (3 clients, 5 projects, 10 invoices). The Pro plan is billed monthly at €12/month via Stripe. Prices include VAT where applicable. Subscriptions renew automatically until cancelled.',
      },
      {
        heading: '4. Cancellation and Refunds',
        body: 'You can cancel your Pro subscription at any time from the "Plan" section of the app. Cancellation takes effect at the end of the billing period. We do not offer refunds for partial periods unless legally required.',
      },
      {
        heading: '5. Acceptable Use',
        body: 'You agree not to use Cobre for illegal, fraudulent or harmful activities. Reverse engineering, copying or redistributing the software is not permitted. We reserve the right to suspend accounts that violate these terms.',
      },
      {
        heading: '6. Intellectual Property',
        body: 'Cobre and all its components (design, code, brand) are the property of Cobre Studio. The data you enter into the app (clients, invoices, projects) is your property and you can export it at any time.',
      },
      {
        heading: '7. Service Availability',
        body: 'We strive to keep the service continuously available, but do not guarantee 100% uptime. We may perform maintenance involving brief interruptions, notifying users whenever possible.',
      },
      {
        heading: '8. Limitation of Liability',
        body: 'To the fullest extent permitted by law, Cobre Studio shall not be liable for indirect damages, lost profits or data loss arising from use of the service. Our maximum liability is limited to the amount paid in the last 12 months.',
      },
      {
        heading: '9. Modifications',
        body: 'We may modify these Terms. We will notify you by email at least 15 days before material changes. Continued use of the service after that period implies acceptance of the new terms.',
      },
      {
        heading: '10. Governing Law',
        body: 'These Terms are governed by Spanish law. For any dispute, the parties submit to the courts of Spain, unless applicable consumer protection regulations establish another jurisdiction.',
      },
      {
        heading: '11. Contact',
        body: 'For any questions about these Terms, write to us at cobreestudio@gmail.com.',
      },
    ],
  },
  fr: {
    title: 'Conditions Générales d\'Utilisation',
    lastUpdated: 'Dernière mise à jour : mai 2025',
    back: '← Retour à l\'accueil',
    sections: [
      {
        heading: '1. Acceptation',
        body: 'En créant un compte sur Cobre (https://cobre-rho.vercel.app), vous acceptez ces Conditions Générales. Si vous n\'êtes pas d\'accord, n\'utilisez pas le service.',
      },
      {
        heading: '2. Description du service',
        body: 'Cobre est une application web de gestion de factures, clients et projets pour freelances, développée par Cobre Studio. Nous proposons un plan gratuit et un plan Pro (12 €/mois).',
      },
      {
        heading: '3. Plans et paiements',
        body: 'Le plan Free est gratuit avec des limites d\'utilisation (3 clients, 5 projets, 10 factures). Le plan Pro est facturé mensuellement à 12 €/mois via Stripe. Les prix incluent la TVA le cas échéant. Les abonnements se renouvellent automatiquement jusqu\'à annulation.',
      },
      {
        heading: '4. Résiliation et remboursements',
        body: 'Vous pouvez résilier votre abonnement Pro à tout moment depuis la section « Plan » de l\'app. La résiliation prend effet à la fin de la période facturée. Nous n\'offrons pas de remboursements pour les périodes partielles, sauf obligation légale.',
      },
      {
        heading: '5. Utilisation acceptable',
        body: 'Vous vous engagez à ne pas utiliser Cobre à des fins illégales, frauduleuses ou nuisibles. L\'ingénierie inverse, la copie ou la redistribution du logiciel ne sont pas autorisées. Nous nous réservons le droit de suspendre les comptes qui enfreignent ces conditions.',
      },
      {
        heading: '6. Propriété intellectuelle',
        body: 'Cobre et tous ses composants (design, code, marque) sont la propriété de Cobre Studio. Les données que vous saisissez dans l\'app (clients, factures, projets) vous appartiennent et peuvent être exportées à tout moment.',
      },
      {
        heading: '7. Disponibilité du service',
        body: 'Nous nous efforçons de maintenir le service disponible en continu, mais ne garantissons pas une disponibilité à 100 %. Nous pouvons effectuer des maintenances entraînant de brèves interruptions, en notifiant les utilisateurs dans la mesure du possible.',
      },
      {
        heading: '8. Limitation de responsabilité',
        body: 'Dans toute la mesure permise par la loi, Cobre Studio ne sera pas responsable des dommages indirects, des pertes de bénéfices ou des pertes de données résultant de l\'utilisation du service. Notre responsabilité maximale est limitée aux montants payés au cours des 12 derniers mois.',
      },
      {
        heading: '9. Modifications',
        body: 'Nous pouvons modifier ces Conditions. Nous vous notifierons par email au moins 15 jours avant tout changement substantiel. L\'utilisation continue du service après ce délai implique l\'acceptation des nouvelles conditions.',
      },
      {
        heading: '10. Droit applicable',
        body: 'Ces Conditions sont régies par le droit espagnol. Pour tout litige, les parties se soumettent aux tribunaux espagnols, sauf si la réglementation applicable en matière de protection des consommateurs prévoit une autre juridiction.',
      },
      {
        heading: '11. Contact',
        body: 'Pour toute question sur ces Conditions, écrivez-nous à cobreestudio@gmail.com.',
      },
    ],
  },
}

export const metadata = { robots: { index: false, follow: false } }

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const c = content[locale as keyof typeof content] ?? content.es

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Coins size={15} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">Cobre</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <Link href={`/${locale}/landing`} className="text-sm text-indigo-600 hover:underline mb-8 inline-block">
          {c.back}
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{c.title}</h1>
        <p className="text-sm text-gray-400 mb-10">{c.lastUpdated}</p>

        <div className="space-y-8">
          {c.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{section.heading}</h2>
              <p className="text-gray-600 leading-relaxed">{section.body}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-100 py-6 px-6 text-center mt-16">
        <p className="text-sm text-gray-400">© {new Date().getFullYear()} Cobre — Cobre Studio</p>
      </footer>
    </div>
  )
}
