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
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: 'No customer found' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id as string,
    return_url: `${appUrl}/billing`,
  })

  return NextResponse.json({ url: portalSession.url })
}
