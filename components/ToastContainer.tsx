'use client'

import { useToast } from '@/components/ToastProvider'
import { Toast } from './Toast'

export function ToastContainer() {
  const { toasts } = useToast()

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  )
}
