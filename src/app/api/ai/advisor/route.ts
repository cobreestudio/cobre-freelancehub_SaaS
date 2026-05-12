import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { aiRatelimit } from '@/lib/ratelimit'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `Eres un asesor financiero especializado en autónomos y freelancers españoles.

Tu misión es analizar los datos financieros del usuario y darle insights accionables y concretos.

Reglas:
- Sé directo y útil, sin rodeos
- Identifica riesgos reales (clientes morosos, baja tasa de cobro, ingresos bajos)
- Destaca puntos fuertes y oportunidades de mejora
- Máximo 5 puntos, cada uno en una línea nueva empezando por un guion (-)
- No uses markdown, asteriscos ni negritas. Solo texto plano con guiones.
- Escribe en español, tono profesional pero cercano
- Si hay facturas vencidas, menciona el importe exacto y urge a actuar
- Termina siempre con un consejo prioritario claro`

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

    const { success } = await aiRatelimit.limit(user.id)
    if (!success) {
      return NextResponse.json({ error: 'Demasiadas solicitudes. Inténtalo más tarde.' }, { status: 429 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profile?.plan !== 'pro') {
      return NextResponse.json({ error: 'pro_required' }, { status: 403 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI no configurada' }, { status: 500 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Petición inválida' }, { status: 400 })
    }
    const { stats } = body as { stats: Record<string, unknown> }
    if (!stats || typeof stats !== 'object') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Analiza la situación financiera de este autónomo:

- Clientes activos: ${stats.activeClients} de ${stats.totalClients} totales
- Proyectos en curso: ${stats.activeProjects}
- Total facturado: ${Number(stats.totalInvoiced).toLocaleString('es-ES')} €
- Total cobrado: ${Number(stats.totalCollected).toLocaleString('es-ES')} €
- Pendiente de cobro: ${Number(stats.totalPending).toLocaleString('es-ES')} €
- Facturas vencidas: ${stats.overdueCount} (${Number(stats.overdueAmount).toLocaleString('es-ES')} €)
- Tasa de cobro global: ${stats.collectionRate}%
- Mejor cliente: ${stats.topClient} (${Number(stats.topClientAmount).toLocaleString('es-ES')} €)
- Clientes con tasa de cobro 0%: ${stats.zeroRateClients}`
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
    console.error('[ai/advisor]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
