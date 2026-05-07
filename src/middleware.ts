import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const handleI18n = createMiddleware(routing)

function detectLocale(request: NextRequest): string {
  const lang = request.headers.get('accept-language') || ''
  if (/\ben\b/i.test(lang)) return 'en'
  if (/\bfr\b/i.test(lang)) return 'fr'
  return 'es'
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'TU_URL_AQUI') {
    return handleI18n(request)
  }

  const isPublicPage = /^\/(es|en|fr)\/(login|register|landing)$/.test(pathname)
  let response = handleI18n(request)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const localeMatch = pathname.match(/^\/(es|en|fr)/)
  const locale = localeMatch ? localeMatch[1] : detectLocale(request)

  if (!user && !isPublicPage) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/landing`
    return NextResponse.redirect(url)
  }

  if (user && isPublicPage) {
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}`
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
