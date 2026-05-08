import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { invoiceId } = await req.json()
  if (!invoiceId) return NextResponse.json({ error: 'invoiceId required' }, { status: 400 })

  const { data: inv } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single()

  if (!inv) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const { data: client } = await supabase
    .from('clients')
    .select('email, name')
    .eq('id', inv.client_id)
    .eq('user_id', user.id)
    .single()

  if (!client?.email) return NextResponse.json({ error: 'Client email not found' }, { status: 400 })

  const { data: prof } = await supabase
    .from('profiles')
    .select('full_name, business_name')
    .eq('id', user.id)
    .single()

  const senderName = prof?.business_name || prof?.full_name || 'Tu proveedor'
  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
  const dueDate = new Date(inv.due_date).toLocaleDateString('es-ES')
  const amount = Number(inv.amount).toLocaleString('es-ES')
  const invoiceLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://cobre-rho.vercel.app'}/es/invoice/${inv.id}`

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from,
    to: client.email,
    subject: `Recordatorio de pago — ${inv.invoice_number || 'Factura pendiente'}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#1f2937;">
        <div style="margin-bottom:24px;">
          <div style="background:#4f46e5;border-radius:8px;padding:8px 14px;display:inline-block;">
            <span style="color:white;font-weight:700;font-size:14px;">Cobre</span>
          </div>
        </div>
        <h2 style="font-size:22px;font-weight:700;margin-bottom:8px;">Recordatorio de pago</h2>
        <p style="color:#6b7280;margin-bottom:20px;">Hola <strong style="color:#1f2937;">${inv.client_name}</strong>,</p>
        <p style="margin-bottom:4px;">${senderName} te recuerda que tienes una factura pendiente:</p>
        <div style="background:#f9fafb;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #e5e7eb;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:5px 0;color:#6b7280;font-size:14px;">Proyecto</td><td style="padding:5px 0;font-weight:600;text-align:right;">${inv.project_title}</td></tr>
            <tr><td style="padding:5px 0;color:#6b7280;font-size:14px;">Importe</td><td style="padding:5px 0;font-weight:700;font-size:18px;color:#4f46e5;text-align:right;">${amount} €</td></tr>
            <tr><td style="padding:5px 0;color:#6b7280;font-size:14px;">Vencimiento</td><td style="padding:5px 0;font-weight:600;color:#dc2626;text-align:right;">${dueDate}</td></tr>
          </table>
        </div>
        <a href="${invoiceLink}" style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:15px;margin-bottom:20px;">
          Ver factura completa →
        </a>
        <p style="color:#9ca3af;font-size:13px;">Si ya realizaste el pago, por favor ignora este mensaje.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="color:#9ca3af;font-size:12px;margin:0;">Enviado con <strong>Cobre</strong> · Facturación para freelancers</p>
      </div>
    `,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
