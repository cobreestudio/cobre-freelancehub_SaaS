import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null
    if (!file) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mediaType = (file.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'

    const client = new Anthropic()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `Analiza esta imagen de factura y extrae los datos. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional:
{
  "clientName": "nombre del cliente o empresa emisora (string o null)",
  "projectTitle": "concepto general o título del trabajo",
  "items": [{"description": "descripción del servicio o producto", "quantity": 1, "unitPrice": 0.00}],
  "ivaRate": 21,
  "irpfRate": 0,
  "dueDate": "YYYY-MM-DD o null",
  "invoiceNumber": "número de factura o null"
}
Reglas:
- Extrae cada línea de concepto como un item separado en el array items
- Si hay IVA, extrae el porcentaje exacto (ej: 21, 10, 4)
- Si hay IRPF, extrae el porcentaje (ej: 15, 7)
- Si no encuentras IRPF, devuelve irpfRate: 0
- Las fechas siempre en formato YYYY-MM-DD
- Si no puedes determinar un campo, usa null`,
          },
        ],
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ error: 'parse_failed' }, { status: 422 })

    const data = JSON.parse(match[0])
    return NextResponse.json(data)
  } catch (err) {
    console.error('[parse-invoice]', err)
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
