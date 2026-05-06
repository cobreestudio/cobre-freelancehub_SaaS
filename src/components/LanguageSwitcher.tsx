'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'
import { useState } from 'react'

const langs = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const switchLocale = (newLocale: string) => {
    // Replace current locale in the path
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
    router.refresh()
    setOpen(false)
  }

  const current = langs.find(l => l.code === locale)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-all"
      >
        <Globe size={17} />
        <span>{current?.flag} {current?.label}</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-44 bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden z-50">
          {langs.map(lang => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                locale === lang.code
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
