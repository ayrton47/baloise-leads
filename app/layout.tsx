import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
