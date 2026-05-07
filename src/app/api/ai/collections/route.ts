import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `Eres un agente especializado en cobros para autónomos y freelancers españoles.

Tu misión es redactar emails de recordatorio de pago profesionales y efectivos, manteniendo siempre una relación cordial con el cliente.

Reglas:
- Tono profesional y cercano, nunca agresivo ni amenazante
- Menciona el proyecto específico y el importe exacto
- Incluye la fecha de vencimiento original
- Si el retraso supera 30 días, el tono debe ser más firme pero siempre respetuoso
- Formato: primero la línea "Asunto: ..." y luego el cuerpo del email
- Escribe siempre en español
- Máximo 150 palabras en el cuerpo
- Finaliza con "Un saludo," dejando espacio para que el emisor firme
- NO uses markdown, asteriscos, negritas ni ningún tipo de formato especial. Solo texto plano.`

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, business_name, full_name')
      .eq('id', user.id)
      .single()

    if (profile?.plan !== 'pro') {
      return NextResponse.json({ error: 'pro_required' }, { status: 403 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI no configurada' }, { status: 500 })
    }

    const { invoice } = await req.json()
    const daysOverdue = Math.ceil((Date.now() - new Date(invoice.dueDate).getTime()) / 86400000)
    const issuerName = profile?.business_name || profile?.full_name || 'el emisor'

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Redacta un email de recordatorio de pago para esta factura vencida:

- Cliente: ${invoice.clientName}
- Proyecto: ${invoice.projectTitle}
- Importe: ${invoice.amount.toLocaleString('es-ES')} €
- Fecha de vencimiento: ${new Date(invoice.dueDate).toLocaleDateString('es-ES')}
- Días de retraso: ${daysOverdue} días
- Emisor: ${issuerName}`
      }]
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      }
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error('[ai/collections]', err)
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
