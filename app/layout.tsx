import type { Metadata } from 'next'
import './globals.css'
import ToastProvider from '@/components/ToastProvider'
import { ToastContainer } from '@/components/ToastContainer'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Baloise Hub - Gestion d\'agence',
  description: 'Plateforme de gestion pour les agences Baloise',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-white text-gray-900">
        <ThemeProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
