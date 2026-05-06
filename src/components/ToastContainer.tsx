'use client'

import { Toast } from '@/hooks/useToast'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface Props {
  toasts: Toast[]
  dismiss: (id: string) => void
}

export default function ToastContainer({ toasts, dismiss }: Props) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-gray-900 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success'
            ? <CheckCircle size={16} className="text-green-400 shrink-0" />
            : <XCircle size={16} className="text-red-200 shrink-0" />
          }
          {toast.message}
          <button onClick={() => dismiss(toast.id)} className="ml-2 opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
