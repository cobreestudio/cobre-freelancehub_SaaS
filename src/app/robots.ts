import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/es/landing', '/en/landing', '/fr/landing', '/es/login', '/en/login', '/fr/login', '/es/register', '/en/register', '/fr/register'],
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://cobre-rho.vercel.app/sitemap.xml',
  }
}
