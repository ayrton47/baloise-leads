'use client'

import { useState } from 'react'
import { Lead } from '@/lib/types'
import LeadActionPanel from './LeadActionPanel'

export default function LeadRow({
  lead,
  onActionComplete,
}: {
  lead: Lead
  onActionComplete: () => void
}) {
  const [showActions, setShowActions] = useState(false)

  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    TO_CONTACT: 'bg-orange-100 text-orange-800',
    QUOTED: 'bg-green-100 text-green-800',
    REFUSED: 'bg-red-100 text-red-800',
    CONVERTED: 'bg-purple-100 text-purple-800',
  }

  const statusLabels: Record<string, string> = {
    NEW: 'Nouveau',
    IN_PROGRESS: 'En cours',
    TO_CONTACT: 'À recontacter',
    QUOTED: 'Devis créé',
    REFUSED: 'Refusé',
    CONVERTED: 'Converti',
  }

  const lastAction = lead.actions[0]
  const lastActionText = lastAction
    ? `${lastAction.type === 'REFUSED' ? '❌ Refusé' : lastAction.type === 'QUOTE_CREATED' ? '📋 Devis' : lastAction.type === 'CALLBACK_SCHEDULED' ? '📅 Rappel' : '📝 Note'} • ${new Date(lastAction.createdAt).toLocaleDateString('fr-FR')}`
    : '—'

  const productEmojis: Record<string, string> = {
    DRIVE: '🚗',
    HOME: '🏠',
    PENSION_PLAN: '🏦',
  }

  return (
    <>
      <div
        onClick={() => setShowActions(!showActions)}
        className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition hover:shadow-md ${
          showActions ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
          <div>
            <p className="font-semibold text-gray-800">
              {lead.firstName} {lead.lastName}
            </p>
            <p className="text-sm text-gray-500">{lead.email || lead.phone || 'N/A'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Produit</p>
            <p className="text-sm text-gray-600">
              {productEmojis[lead.productInterest]} {lead.productInterest === 'DRIVE' ? 'Drive' : lead.productInterest === 'HOME' ? 'Home' : 'Pension Plan'}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Statut</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status]}`}>
              {statusLabels[lead.status]}
            </span>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Ajouté</p>
            <p className="text-sm text-gray-600">
              {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-700">Dernière action</p>
            <p className="text-sm text-gray-600">{lastActionText}</p>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="mt-2">
          <LeadActionPanel
            leadId={lead.id}
            onActionComplete={() => {
              setShowActions(false)
              onActionComplete()
            }}
          />
        </div>
      )}
    </>
  )
}
