'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { LayoutDashboard, Users, FolderKanban, FileText, Zap, LogOut, UserCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import LanguageSwitcher from './LanguageSwitcher'
import Link from 'next/link'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('sidebar')

  const links = [
    { href: `/${locale}`, label: t('dashboard'), icon: LayoutDashboard },
    { href: `/${locale}/clients`, label: t('clients'), icon: Users },
    { href: `/${locale}/projects`, label: t('projects'), icon: FolderKanban },
    { href: `/${locale}/invoices`, label: t('invoices'), icon: FileText },
    { href: `/${locale}/profile`, label: t('profile'), icon: UserCircle },
  ]

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === `/${locale}` : pathname.startsWith(href)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  return (
    <aside className="w-56 min-h-screen bg-gray-950 text-white flex flex-col shrink-0">
      <div className="px-5 py-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-indigo-500 p-1.5 rounded-lg">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight">FreelanceHub</span>
        </div>
        <p className="text-xs text-gray-500 pl-8">{t('tagline')}</p>
      </div>

      <div className="px-3 mb-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-1">Menú</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive(href)
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 pb-4 space-y-1 border-t border-gray-800 pt-3">
        <LanguageSwitcher />
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-all"
        >
          <LogOut size={17} />
          {t('logout')}
        </button>
        <p className="text-xs text-gray-600 px-3 pt-1">v1.0 free</p>
      </div>
    </aside>
  )
}
