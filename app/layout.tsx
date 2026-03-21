import type { Metadata } from 'next'
import './globals.css'
import ToastProvider from '@/components/ToastProvider'
import { ToastContainer } from '@/components/ToastContainer'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Baloise Leads - Suivi des Opportunités',
  description: 'Plateforme de gestion des leads pour les agents Baloise',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
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
