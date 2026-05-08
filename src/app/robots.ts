import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/es/landing', '/en/landing', '/fr/landing', '/es/login', '/en/login', '/fr/login', '/es/register', '/en/register', '/fr/register'],
        disallow: ['/api/', '/es/dashboard', '/en/dashboard', '/fr/dashboard', '/es/clients', '/en/clients', '/fr/clients', '/es/projects', '/en/projects', '/fr/projects', '/es/invoices', '/en/invoices', '/fr/invoices', '/es/stats', '/en/stats', '/fr/stats', '/es/profile', '/en/profile', '/fr/profile', '/es/billing', '/en/billing', '/fr/billing'],
      },
    ],
    sitemap: 'https://cobre-rho.vercel.app/sitemap.xml',
  }
}
