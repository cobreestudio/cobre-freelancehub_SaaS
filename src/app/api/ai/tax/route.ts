import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `Eres un asesor fiscal especializado en autónomos y freelancers españoles.

Tu misión es analizar los datos de facturación del usuario y darle orientación fiscal práctica y accionable adaptada al sistema tributario español.

Marco fiscal que aplicas:
- IVA: tipo general 21%, declaración trimestral mediante Modelo 303 (plazo: primeros 20 días del mes siguiente al trimestre; T1→abril, T2→julio, T3→octubre, T4→enero)
- IRPF: retención habitual del 15% (7% los primeros 2 años de actividad). Pagos fraccionados trimestrales con Modelo 130 si no supera el 70% de retención en fuente
- IVA devengado: se declara cuando se emite la factura, independientemente de si se ha cobrado
- Gastos deducibles comunes: cuota de autónomo, material de trabajo, teléfono/internet (50%), formación, software

Reglas de respuesta:
- Máximo 6 puntos, cada uno en una línea empezando por un guion (-)
- Usa importes exactos basados en los datos del usuario
- Si hay IVA pendiente de declarar, indica el importe exacto y la fecha límite
- Alerta si hay facturas impagadas con IVA ya devengado (obligatorio declararlo aunque no esté cobrado)
- No uses markdown, asteriscos ni negritas. Solo texto plano con guiones
- Termina con el próximo paso fiscal prioritario con fecha concreta si aplica
- Escribe en español, tono profesional pero directo`

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
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profile?.plan !== 'pro') {
      return NextResponse.json({ error: 'pro_required' }, { status: 403 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'AI no configurada' }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Petición inválida' }, { status: 400 })
    }
    const { taxData } = body
    if (!taxData || typeof taxData !== 'object') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const formatQ = (q: { base: number; iva: number; irpf: number; paid: number; pending: number; count: number }, label: string) => {
      if (q.count === 0) return `${label}: Sin facturas`
      return `${label}: base ${q.base.toLocaleString('es-ES')} €, IVA devengado ${q.iva.toFixed(2)} €, IRPF retenido ${q.irpf.toFixed(2)} €, cobrado ${q.paid.toLocaleString('es-ES')} €, pendiente de cobro ${q.pending.toLocaleString('es-ES')} €`
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Analiza la situación fiscal de este autónomo. Fecha actual: ${new Date().toLocaleDateString('es-ES')}, trimestre en curso: T${taxData.currentQuarter} ${taxData.year}.

Facturación ${taxData.year} por trimestres:
${formatQ(taxData.q1, 'T1 (ene-mar)')}
${formatQ(taxData.q2, 'T2 (abr-jun)')}
${formatQ(taxData.q3, 'T3 (jul-sep)')}
${formatQ(taxData.q4, 'T4 (oct-dic)')}

Total año ${taxData.year}: base ${taxData.yearTotal.base.toLocaleString('es-ES')} €, IVA devengado ${taxData.yearTotal.iva.toFixed(2)} €, IRPF retenido ${taxData.yearTotal.irpf.toFixed(2)} €
IVA en facturas impagadas (devengado pero sin cobrar aún): ${taxData.unpaidIva.toFixed(2)} €`
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
    console.error('[ai/tax]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
