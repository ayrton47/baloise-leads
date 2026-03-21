'use client'

import { Lead, ProductType } from '@/lib/types'
import StatusBadge from './StatusBadge'
import LeadActionPanel from '@/components/LeadActionPanel'

interface LeadDetailPanelProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onActionComplete: () => void
}

const productLabels: Record<ProductType, string> = {
  DRIVE: 'Drive',
  HOME: 'Home',
  PENSION_PLAN: 'Pension Plan',
}

const productColors: Record<ProductType, { bg: string; text: string; darkBg: string; darkText: string }> = {
  DRIVE: { bg: 'bg-sky-50', text: 'text-sky-700', darkBg: 'dark:bg-sky-900/20', darkText: 'dark:text-sky-300' },
  HOME: { bg: 'bg-violet-50', text: 'text-violet-700', darkBg: 'dark:bg-violet-900/20', darkText: 'dark:text-violet-300' },
  PENSION_PLAN: { bg: 'bg-teal-50', text: 'text-teal-700', darkBg: 'dark:bg-teal-900/20', darkText: 'dark:text-teal-300' },
}

const actionTypeLabels: Record<string, { label: string; icon: string; color: string }> = {
  REFUSED: { label: 'Lead refusé', icon: '×', color: 'text-red-500 dark:text-red-400' },
  QUOTE_CREATED: { label: 'Devis créé', icon: '📋', color: 'text-emerald-600 dark:text-emerald-400' },
  CALLBACK_SCHEDULED: { label: 'Rappel planifié', icon: '📅', color: 'text-blue-600 dark:text-blue-400' },
  NOTE_ADDED: { label: 'Note ajoutée', icon: '📝', color: 'text-gray-600 dark:text-gray-400' },
}

const refusalReasonLabels: Record<string, string> = {
  NO_ASSET: 'Pas de bien à assurer',
  PRICE_TOO_HIGH: 'Tarif trop élevé',
  ALREADY_INSURED: 'Déjà assuré',
  OTHER: 'Autre',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getAvatarColor(name: string): string {
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500', 'bg-rose-500', 'bg-indigo-500']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getActionSubtitle(action: Record<string, any>): string {
  switch (action.type) {
    case 'REFUSED':
      return refusalReasonLabels[action.refusalReason as string] ?? 'Aucun motif'
    case 'QUOTE_CREATED':
      return productLabels[action.quotedProduct as ProductType] ?? 'Produit inconnu'
    case 'CALLBACK_SCHEDULED':
      return formatDate(action.callbackDate as string)
    case 'NOTE_ADDED':
      return `"${action.note as string}"`
    default:
      return ''
  }
}

export default function LeadDetailPanel({
  lead,
  isOpen,
  onClose,
  onActionComplete,
}: LeadDetailPanelProps) {
  if (!lead) return null

  const initials = ((lead.firstName[0] ?? '') + (lead.lastName[0] ?? '')).toUpperCase()
  const avatarColor = getAvatarColor(lead.firstName + lead.lastName)
  const productStyle = productColors[lead.productInterest]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/50 z-40 backdrop-blur-[1px] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-full md:w-[420px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="flex-shrink-0 border-b border-gray-100 dark:border-gray-800 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
              >
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  {lead.firstName} {lead.lastName}
                </h2>
                <div className="mt-1.5">
                  <StatusBadge status={lead.status} size="sm" />
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Fermer le panneau"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Contact */}
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
              Contact
            </h3>
            <div className="space-y-2.5">
              {lead.email ? (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="truncate">{lead.email}</span>
                </a>
              ) : null}
              {lead.phone ? (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-3 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span>{lead.phone}</span>
                </a>
              ) : null}
              {!lead.email && !lead.phone && (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">Aucun contact renseigné</p>
              )}
            </div>
          </div>

          {/* Lead Info */}
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
              Détails
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5">
                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Produit</p>
                <span className={`inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${productStyle.bg} ${productStyle.text} ${productStyle.darkBg} ${productStyle.darkText}`}>
                  {productLabels[lead.productInterest]}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5">
                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Source</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1.5">
                  {lead.source === 'API_EXTERNAL' ? 'API externe' : 'Manuelle'}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5">
                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Créé le</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                  {new Date(lead.createdAt).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5">
                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Mis à jour</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">
                  {new Date(lead.updatedAt).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Action History */}
          <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
              Historique
            </h3>
            {lead.leadActions && lead.leadActions.length > 0 ? (
              <div className="space-y-3">
                {lead.leadActions.map((action, index) => {
                  const config = actionTypeLabels[action.type] ?? { label: action.type, icon: '•', color: 'text-gray-500' }
                  const subtitle = getActionSubtitle(action)
                  return (
                    <div key={action.id} className="relative flex gap-3">
                      {/* Timeline line */}
                      {index < lead.leadActions.length - 1 && (
                        <div className="absolute left-[13px] top-6 w-px h-[calc(100%+4px)] bg-gray-100 dark:bg-gray-800" />
                      )}
                      {/* Dot */}
                      <div className="relative z-10 mt-0.5 flex-shrink-0">
                        <div className={`w-6 h-6 rounded-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center text-[10px] ${config.color}`}>
                          {action.type === 'REFUSED' ? (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          ) : (
                            <span>{config.icon}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {config.label}
                        </p>
                        {subtitle && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{subtitle}</p>
                        )}
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                          {formatDate(action.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">Aucune activité</p>
            )}
          </div>

          {/* Actions Section */}
          <div className="px-6 py-4">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
              Actions
            </h3>
            <LeadActionPanel
              leadId={lead.id}
              onActionComplete={() => {
                onActionComplete()
                onClose()
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
