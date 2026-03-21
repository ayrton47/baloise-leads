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

  const lastAction = lead.leadActions?.[0]
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
        className={`bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-600 p-5 cursor-pointer transition hover:shadow-xl hover:border-red-500 ${
          showActions ? 'ring-2 ring-red-500' : ''
        } text-white`}
      >
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
          <div>
            <p className="font-semibold text-white text-lg">
              {lead.firstName} {lead.lastName}
            </p>
            <p className="text-sm text-slate-400">{lead.email || lead.phone || 'N/A'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-300">Produit</p>
            <p className="text-sm text-slate-200">
              {productEmojis[lead.productInterest]} {lead.productInterest === 'DRIVE' ? 'Drive' : lead.productInterest === 'HOME' ? 'Home' : 'Pension Plan'}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-300">Statut</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${statusColors[lead.status]}`}>
              {statusLabels[lead.status]}
            </span>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-300">Ajouté</p>
            <p className="text-sm text-slate-200">
              {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm font-medium text-slate-300">Dernière action</p>
            <p className="text-sm text-slate-200">{lastActionText}</p>
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
