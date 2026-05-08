export const FREE_LIMITS = {
  clients: 10,
  projects: 10,
  invoices: 30,
} as const

export type Plan = 'free' | 'pro'
