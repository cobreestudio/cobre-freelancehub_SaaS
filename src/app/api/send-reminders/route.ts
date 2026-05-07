import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const resend = new Resend(process.env.RESEND_API_KEY)
  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, amount, due_date, project_title, client_name, client_id')
    .in('status', ['sent', 'overdue'])
    .lte('due_date', today)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!invoices?.length) {
    return NextResponse.json({ sent: 0, total: 0 })
  }

  let sent = 0

  for (const invoice of invoices) {
    const { data: recentLog } = await supabase
      .from('reminder_logs')
      .select('id')
      .eq('invoice_id', invoice.id)
      .gte('sent_at', sevenDaysAgo)
      .maybeSingle()

    if (recentLog) continue

    const { data: client } = await supabase
      .from('clients')
      .select('email')
      .eq('id', invoice.client_id)
      .single()

    if (!client?.email) continue

    const dueDate = new Date(invoice.due_date).toLocaleDateString('es-ES')
    const amount = Number(invoice.amount).toLocaleString('es-ES')

    const { error: emailError } = await resend.emails.send({
      from,
      to: client.email,
      subject: `Recordatorio: tienes una factura pendiente de pago`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#1f2937;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
            <div style="background:#4f46e5;border-radius:8px;padding:6px 10px;display:inline-block;">
              <span style="color:white;font-weight:700;font-size:14px;">Cobre</span>
            </div>
          </div>
          <h2 style="font-size:20px;font-weight:700;margin-bottom:8px;">Recordatorio de pago</h2>
          <p style="color:#6b7280;margin-bottom:20px;">Hola <strong style="color:#1f2937;">${invoice.client_name}</strong>,</p>
          <p style="margin-bottom:16px;">Te recordamos que tienes una factura pendiente de pago con los siguientes datos:</p>
          <div style="background:#f9fafb;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #e5e7eb;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Proyecto</td><td style="padding:4px 0;font-weight:600;text-align:right;">${invoice.project_title}</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Importe</td><td style="padding:4px 0;font-weight:700;font-size:18px;color:#4f46e5;text-align:right;">${amount} €</td></tr>
              <tr><td style="padding:4px 0;color:#6b7280;font-size:14px;">Vencimiento</td><td style="padding:4px 0;font-weight:600;color:#dc2626;text-align:right;">${dueDate}</td></tr>
            </table>
          </div>
          <p style="color:#6b7280;font-size:14px;">Si ya realizaste el pago, por favor ignora este mensaje. Gracias.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">Enviado automáticamente por <strong>Cobre</strong> · Gestión de facturas para freelancers</p>
        </div>
      `,
    })

    if (!emailError) {
      await supabase.from('reminder_logs').insert({
        invoice_id: invoice.id,
        recipient_email: client.email,
      })
      sent++
    }
  }

  return NextResponse.json({ sent, total: invoices.length })
}
