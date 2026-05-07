import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError) console.error('[stripe/checkout] auth error:', authError.message)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single()

  if (profileError) console.error('[stripe/checkout] profile error:', profileError.message)

  let customerId = profile?.stripe_customer_id as string | undefined

  if (!customerId) {
    try {
      const customer = await getStripe().customers.create({
        email: profile?.email || user.email || undefined,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    } catch (e) {
      console.error('[stripe/checkout] customer create error:', e)
      return NextResponse.json({ error: 'Stripe error' }, { status: 500 })
    }
  }

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
      success_url: `${origin}/billing?success=true`,
      cancel_url: `${origin}/billing`,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id },
      allow_promotion_codes: true,
    })
    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('[stripe/checkout] session create error:', e)
    return NextResponse.json({ error: 'Stripe error' }, { status: 500 })
  }
}
