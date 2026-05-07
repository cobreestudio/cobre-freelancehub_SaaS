'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Users, FolderKanban, FileText, Coins, LogOut, UserCircle, X, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import LanguageSwitcher from './LanguageSwitcher'
import Link from 'next/link'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('sidebar')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null)
    })
  }, [])

  const links = [
    { href: `/${locale}`,          label: t('dashboard'), icon: LayoutDashboard },
    { href: `/${locale}/clients`,  label: t('clients'),   icon: Users },
    { href: `/${locale}/projects`, label: t('projects'),  icon: FolderKanban },
    { href: `/${locale}/invoices`, label: t('invoices'),  icon: FileText },
    { href: `/${locale}/stats`,    label: t('stats'),     icon: BarChart2 },
    { href: `/${locale}/profile`,  label: t('profile'),   icon: UserCircle },
  ]

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === `/${locale}` : pathname.startsWith(href)

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-30
      w-60 min-h-screen bg-gray-950 text-white flex flex-col shrink-0
      transition-transform duration-200 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      {/* Logo */}
      <div className="px-5 py-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-indigo-500 p-1.5 rounded-lg">
              <Coins size={14} className="text-white" />
            </div>
            <span className="text-base font-bold tracking-tight">Cobre</span>
          </div>
          <p className="text-xs text-gray-500 pl-8">{t('tagline')}</p>
        </div>
        <button onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 mt-0.5">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 mb-2">Menú</p>
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(href)
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-100'
            }`}>
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 pt-3 border-t border-white/5 space-y-1">
        {userEmail && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        )}
        <LanguageSwitcher />
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-red-400 transition-all">
          <LogOut size={17} />
          {t('logout')}
        </button>
      </div>
    </aside>
  )
}
