import { MetadataRoute } from 'next'

const BASE_URL = 'https://cobre-rho.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['es', 'en', 'fr']
  const publicRoutes = ['/landing', '/login', '/register']

  return locales.flatMap(locale => [
    {
      url: `${BASE_URL}/${locale}/landing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1.0,
    },
    ...publicRoutes.slice(1).map(route => ({
      url: `${BASE_URL}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
  ])
}
