import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' as any })
  }
  return _stripe
}
