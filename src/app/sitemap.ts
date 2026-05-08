import { MetadataRoute } from 'next'

const BASE_URL = 'https://cobre-rho.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['es', 'en', 'fr']

  return locales.flatMap(locale => [
    {
      url: `${BASE_URL}/${locale}/landing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/${locale}/register`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/${locale}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
  ])
}
