import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import { aiRatelimit } from '@/lib/ratelimit'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `Eres un especialista en propuestas comerciales para autónomos y freelancers españoles.

Tu misión es redactar propuestas de proyecto profesionales, persuasivas y personalizadas que ayuden al freelancer a conseguir el proyecto.

Estructura que debes seguir (sin encabezados, texto corrido):
1. Saludo y apertura: conecta con el cliente, menciona el proyecto por su nombre
2. Entendimiento: 2-3 frases que demuestren que comprendes exactamente qué necesita
3. Tu propuesta: cómo lo vas a abordar, qué metodología o enfoque usas
4. Entregables: lista corta de 3-5 puntos con lo que recibirá el cliente
5. Inversión: presenta el precio como inversión, con contexto del valor entregado
6. Siguiente paso: propuesta concreta de avance (llamada, reunión breve) sin presión

Reglas:
- Tono profesional pero cercano, en primera persona singular
- No uses asteriscos, guiones de lista, markdown ni negritas. Solo texto plano natural
- Máximo 280 palabras
- Menciona el nombre del cliente y el proyecto siempre que sea natural
- Si hay historial previo con el cliente, haz una referencia natural a la relación
- Finaliza con una llamada a la acción clara y sin presión
- Escribe siempre en español`

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
      .select('plan, business_name, full_name')
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
    const { project } = body
    if (!project || typeof project !== 'object') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }
    const freelancerName = profile?.business_name || profile?.full_name || 'el freelancer'

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const pastContext = project.pastProjectsCount > 0
      ? `Historial con este cliente: ${project.pastProjectsCount} proyecto${project.pastProjectsCount > 1 ? 's' : ''} anterior${project.pastProjectsCount > 1 ? 'es' : ''}, ${project.pastInvoicedTotal.toLocaleString('es-ES')} € facturados en total.`
      : 'Es el primer proyecto con este cliente.'

    const stream = anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Redacta una propuesta comercial para este proyecto:

Freelancer: ${freelancerName}
Cliente: ${project.clientName}${project.clientCompany ? ` (empresa: ${project.clientCompany})` : ''}
Nombre del proyecto: ${project.title}
${project.description ? `Descripción: ${project.description}` : ''}
Presupuesto: ${project.budget.toLocaleString('es-ES')} €
${pastContext}
Total de proyectos completados por el freelancer: ${project.completedProjects}`
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
    console.error('[ai/proposal]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
