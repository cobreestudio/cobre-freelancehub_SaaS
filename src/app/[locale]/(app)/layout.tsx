'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { Menu, Zap } from 'lucide-react'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <Sidebar isOpen={open} onClose={() => setOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 bg-gray-950 text-white px-4 py-3 shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500 p-1 rounded-md">
              <Zap size={13} className="text-white" />
            </div>
            <span className="font-bold text-sm">FreelanceHub</span>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
