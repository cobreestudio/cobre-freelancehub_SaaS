export const FREE_LIMITS = {
  clients: 3,
  invoices: 5,
} as const

export type Plan = 'free' | 'pro'
