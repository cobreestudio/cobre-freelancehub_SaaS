import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Cobre — App de facturación para autónomos y freelancers'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const content = {
  es: {
    eyebrow: 'Para autónomos y freelancers',
    title: 'Factura gratis.',
    title2: 'Cobra más rápido.',
    claim: 'Cobra lo que mereces.',
    url: 'cobre-rho.vercel.app',
  },
  en: {
    eyebrow: 'For freelancers',
    title: 'Invoice free.',
    title2: 'Get paid faster.',
    claim: 'Get paid what you deserve.',
    url: 'cobre-rho.vercel.app',
  },
  fr: {
    eyebrow: 'Pour les freelances',
    title: 'Facturez gratis.',
    title2: 'Payé plus vite.',
    claim: 'Facturez sans friction.',
    url: 'cobre-rho.vercel.app',
  },
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const c = content[locale as keyof typeof content] ?? content.es

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background accent circle */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '480px',
          height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#4f46e5',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
            }} />
          </div>
          <span style={{ fontSize: '28px', fontWeight: '700', color: '#111827', display: 'flex' }}>
            Cobre
          </span>
        </div>

        {/* Main text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span style={{
            fontSize: '20px',
            color: '#6b7280',
            fontWeight: '500',
            display: 'flex',
          }}>
            {c.eyebrow}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{
              fontSize: '80px',
              fontWeight: '800',
              color: '#111827',
              lineHeight: '1',
              display: 'flex',
            }}>
              {c.title}
            </span>
            <span style={{
              fontSize: '80px',
              fontWeight: '800',
              color: '#4f46e5',
              lineHeight: '1',
              display: 'flex',
            }}>
              {c.title2}
            </span>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#f0f0ff',
            border: '1px solid #e0e7ff',
            borderRadius: '999px',
            padding: '10px 20px',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#4f46e5',
              display: 'flex',
            }} />
            <span style={{ fontSize: '18px', color: '#4f46e5', fontWeight: '600', display: 'flex' }}>
              {c.claim}
            </span>
          </div>
          <span style={{ fontSize: '16px', color: '#9ca3af', display: 'flex' }}>
            {c.url}
          </span>
        </div>

        {/* Bottom indigo bar */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '5px',
          background: 'linear-gradient(90deg, #4f46e5 0%, #818cf8 50%, #c4b5fd 100%)',
          display: 'flex',
        }} />
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
