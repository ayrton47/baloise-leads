'use client'

import { ReactNode } from 'react'
import { ToastContext, Toast, ToastType } from '@/lib/toast'
import { createContext, useContext, useState, useCallback } from 'react'

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

const defaultContextValue: ToastContextType = {
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
}

const ToastProviderContext = createContext<ToastContextType>(defaultContextValue)

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000): void => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: Toast = { id, message, type, duration }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  return (
    <ToastProviderContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastProviderContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastProviderContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
