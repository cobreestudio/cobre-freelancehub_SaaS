import Link from 'next/link'
import { Coins } from 'lucide-react'

const content = {
  es: {
    title: 'Política de Privacidad',
    lastUpdated: 'Última actualización: mayo 2025',
    back: '← Volver a inicio',
    sections: [
      {
        heading: '1. Responsable del tratamiento',
        body: 'Cobre Studio, con correo de contacto cobreestudio@gmail.com, es el responsable del tratamiento de los datos personales recogidos a través de la aplicación Cobre (https://cobre-rho.vercel.app).',
      },
      {
        heading: '2. Datos que recogemos',
        body: 'Recogemos los siguientes datos: (a) Cuenta: nombre, dirección de email y contraseña cifrada. (b) Facturación: datos de pago procesados por Stripe (no almacenamos números de tarjeta). (c) Uso: clientes, proyectos y facturas que introduces en la app. (d) Técnicos: dirección IP, tipo de navegador y datos de sesión para la seguridad del servicio.',
      },
      {
        heading: '3. Finalidad y base legal',
        body: 'Tratamos tus datos para: prestar el servicio contratado (base legal: ejecución de contrato); enviarte emails transaccionales como recordatorios de facturas (base legal: interés legítimo); cumplir obligaciones legales y fiscales (base legal: obligación legal).',
      },
      {
        heading: '4. Conservación de datos',
        body: 'Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, borramos tus datos personales en un plazo máximo de 30 días, salvo obligación legal de conservarlos.',
      },
      {
        heading: '5. Terceros y encargados del tratamiento',
        body: 'Compartimos datos estrictamente necesarios con: Supabase Inc. (base de datos y autenticación, alojada en la UE); Stripe Inc. (procesamiento de pagos); Resend Inc. (envío de emails transaccionales). Todos están sujetos a acuerdos de tratamiento de datos conformes al RGPD.',
      },
      {
        heading: '6. Tus derechos',
        body: 'De acuerdo con el RGPD, tienes derecho a: acceder a tus datos, rectificarlos, suprimirlos ("derecho al olvido"), oponerte al tratamiento, solicitar la portabilidad y retirar el consentimiento en cualquier momento. Ejerce tus derechos escribiendo a cobreestudio@gmail.com.',
      },
      {
        heading: '7. Cookies',
        body: 'Usamos únicamente cookies técnicas estrictamente necesarias para el funcionamiento del servicio (sesión de usuario). No usamos cookies de publicidad ni de seguimiento de terceros.',
      },
      {
        heading: '8. Menores de edad',
        body: 'El servicio no está dirigido a menores de 16 años. No recogemos conscientemente datos de menores.',
      },
      {
        heading: '9. Cambios en esta política',
        body: 'Podemos actualizar esta política. Te notificaremos por email si los cambios son sustanciales. La versión vigente siempre estará disponible en esta página.',
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: May 2025',
    back: '← Back to home',
    sections: [
      {
        heading: '1. Data Controller',
        body: 'Cobre Studio, contact email cobreestudio@gmail.com, is the data controller for personal data collected through the Cobre application (https://cobre-rho.vercel.app).',
      },
      {
        heading: '2. Data We Collect',
        body: 'We collect: (a) Account: name, email address and encrypted password. (b) Billing: payment data processed by Stripe (we do not store card numbers). (c) Usage: clients, projects and invoices you enter in the app. (d) Technical: IP address, browser type and session data for service security.',
      },
      {
        heading: '3. Purpose and Legal Basis',
        body: 'We process your data to: provide the contracted service (legal basis: contract performance); send transactional emails such as invoice reminders (legal basis: legitimate interest); comply with legal and tax obligations (legal basis: legal obligation).',
      },
      {
        heading: '4. Data Retention',
        body: 'We retain your data while your account is active. If you delete your account, we erase your personal data within 30 days, unless legally required to retain it.',
      },
      {
        heading: '5. Third Parties and Processors',
        body: 'We share strictly necessary data with: Supabase Inc. (database and authentication, hosted in the EU); Stripe Inc. (payment processing); Resend Inc. (transactional email delivery). All are bound by GDPR-compliant data processing agreements.',
      },
      {
        heading: '6. Your Rights',
        body: 'Under GDPR you have the right to: access your data, rectify it, erase it ("right to be forgotten"), object to processing, request portability and withdraw consent at any time. Exercise your rights by writing to cobreestudio@gmail.com.',
      },
      {
        heading: '7. Cookies',
        body: 'We only use strictly necessary technical cookies for service functionality (user session). We do not use advertising or third-party tracking cookies.',
      },
      {
        heading: '8. Minors',
        body: 'The service is not directed to persons under 16 years of age. We do not knowingly collect data from minors.',
      },
      {
        heading: '9. Changes to This Policy',
        body: 'We may update this policy. We will notify you by email if changes are material. The current version will always be available on this page.',
      },
    ],
  },
  fr: {
    title: 'Politique de Confidentialité',
    lastUpdated: 'Dernière mise à jour : mai 2025',
    back: '← Retour à l\'accueil',
    sections: [
      {
        heading: '1. Responsable du traitement',
        body: 'Cobre Studio, email de contact cobreestudio@gmail.com, est responsable du traitement des données personnelles collectées via l\'application Cobre (https://cobre-rho.vercel.app).',
      },
      {
        heading: '2. Données collectées',
        body: 'Nous collectons : (a) Compte : nom, adresse email et mot de passe chiffré. (b) Facturation : données de paiement traitées par Stripe (nous ne stockons pas les numéros de carte). (c) Utilisation : clients, projets et factures que vous saisissez dans l\'app. (d) Techniques : adresse IP, type de navigateur et données de session pour la sécurité.',
      },
      {
        heading: '3. Finalité et base légale',
        body: 'Nous traitons vos données pour : fournir le service souscrit (base légale : exécution du contrat) ; envoyer des emails transactionnels comme les rappels de factures (base légale : intérêt légitime) ; respecter les obligations légales et fiscales (base légale : obligation légale).',
      },
      {
        heading: '4. Conservation des données',
        body: 'Nous conservons vos données tant que votre compte est actif. Si vous supprimez votre compte, nous effaçons vos données personnelles dans un délai de 30 jours, sauf obligation légale de conservation.',
      },
      {
        heading: '5. Tiers et sous-traitants',
        body: 'Nous partageons les données strictement nécessaires avec : Supabase Inc. (base de données et authentification, hébergée dans l\'UE) ; Stripe Inc. (traitement des paiements) ; Resend Inc. (envoi d\'emails transactionnels). Tous sont liés par des accords de traitement conformes au RGPD.',
      },
      {
        heading: '6. Vos droits',
        body: 'Conformément au RGPD, vous avez le droit d\'accéder à vos données, de les rectifier, de les effacer (« droit à l\'oubli »), de vous opposer au traitement, de demander la portabilité et de retirer votre consentement à tout moment. Exercez vos droits en écrivant à cobreestudio@gmail.com.',
      },
      {
        heading: '7. Cookies',
        body: 'Nous utilisons uniquement des cookies techniques strictement nécessaires au fonctionnement du service (session utilisateur). Nous n\'utilisons pas de cookies publicitaires ni de suivi tiers.',
      },
      {
        heading: '8. Mineurs',
        body: 'Le service n\'est pas destiné aux personnes de moins de 16 ans. Nous ne collectons pas sciemment de données sur des mineurs.',
      },
      {
        heading: '9. Modifications de cette politique',
        body: 'Nous pouvons mettre à jour cette politique. Nous vous informerons par email si les changements sont importants. La version en vigueur sera toujours disponible sur cette page.',
      },
    ],
  },
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
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
