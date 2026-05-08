import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ token: string }> }

async function getInvoiceData(token: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: inv } = await supabase.from('invoices').select('*').eq('id', token).single()
  if (!inv) return null
  const { data: prof } = await supabase
    .from('profiles')
    .select('full_name, business_name, email, phone, address, tax_id, payment_info')
    .eq('id', inv.user_id)
    .single()
  return { inv, prof }
}

const statusLabel: Record<string, { text: string; color: string }> = {
  draft:   { text: 'Borrador',  color: '#6b7280' },
  sent:    { text: 'Enviada',   color: '#2563eb' },
  paid:    { text: 'Cobrada',   color: '#059669' },
  overdue: { text: 'Vencida',   color: '#dc2626' },
}

export default async function PublicInvoicePage({ params }: Props) {
  const { token } = await params
  const result = await getInvoiceData(token)
  if (!result) notFound()

  const { inv, prof } = result
  const iva = inv.iva_rate ?? 21
  const irpf = inv.irpf_rate ?? 0
  const base = inv.amount ?? 0
  const ivaAmt = base * (iva / 100)
  const irpfAmt = base * (irpf / 100)
  const total = base + ivaAmt - irpfAmt
  const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const status = statusLabel[inv.status] ?? statusLabel.sent
  const invoiceNumber = inv.invoice_number || `FAC-001`
  const items: { description: string; quantity: number; unitPrice: number }[] = inv.items || []

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '32px 16px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', background: 'white', borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: '#4f46e5', padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600 }}>
                {prof?.business_name || prof?.full_name || 'Freelancer'}
              </span>
            </div>
            <div style={{ color: 'white', fontSize: 28, fontWeight: 800 }}>{invoiceNumber}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-block', background: 'white', color: status.color, borderRadius: 999, padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>
              {status.text}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 8 }}>
              Vencimiento: {new Date(inv.due_date).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>

        <div style={{ padding: '32px 40px' }}>

          {/* De / Para */}
          <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>De</div>
              <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{prof?.business_name || prof?.full_name || '—'}</div>
              {prof?.full_name && prof.business_name && <div style={{ color: '#6b7280', fontSize: 13 }}>{prof.full_name}</div>}
              {prof?.address && <div style={{ color: '#6b7280', fontSize: 13 }}>{prof.address}</div>}
              {prof?.tax_id && <div style={{ color: '#6b7280', fontSize: 13 }}>NIF/CIF: {prof.tax_id}</div>}
              {prof?.email && <div style={{ color: '#6b7280', fontSize: 13 }}>{prof.email}</div>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Para</div>
              <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{inv.client_name}</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>{inv.project_title}</div>
            </div>
          </div>

          {/* Items o concepto único */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #f3f4f6' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Concepto</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Uds.</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>P. unit.</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length > 0 ? items.map((item, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', color: '#111827' }}>{item.description}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#6b7280' }}>{item.quantity}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#6b7280' }}>{fmt(item.unitPrice)} €</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#111827' }}>{fmt(item.quantity * item.unitPrice)} €</td>
                    </tr>
                  )) : (
                    <tr style={{ borderTop: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', color: '#111827' }}>{inv.project_title}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#6b7280' }}>1</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#6b7280' }}>{fmt(base)} €</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#111827' }}>{fmt(base)} €</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: 260 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, color: '#6b7280' }}>
                <span>Base imponible</span><span>{fmt(base)} €</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, color: '#6b7280' }}>
                <span>IVA ({iva}%)</span><span>+{fmt(ivaAmt)} €</span>
              </div>
              {irpf > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, color: '#6b7280' }}>
                  <span>IRPF ({irpf}%)</span><span>−{fmt(irpfAmt)} €</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 18, fontWeight: 800, color: '#111827', borderTop: '2px solid #4f46e5', marginTop: 6 }}>
                <span>Total</span><span style={{ color: '#4f46e5' }}>{fmt(total)} €</span>
              </div>
            </div>
          </div>

          {/* Datos de pago */}
          {prof?.payment_info && (
            <div style={{ marginTop: 28, background: '#f0f0ff', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#4338ca' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Datos de pago</div>
              <div style={{ whiteSpace: 'pre-line', color: '#6b7280' }}>{prof.payment_info}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 40px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'center' }}>
          <a href="https://cobre-rho.vercel.app" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#9ca3af', textDecoration: 'none' }}>
            <div style={{ width: 16, height: 16, background: '#4f46e5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />
            </div>
            Creado con Cobre
          </a>
        </div>
      </div>
    </div>
  )
}
