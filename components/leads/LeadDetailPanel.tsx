'use client'

import { useState, useEffect } from 'react'
import { Lead, ProductType, Agent } from '@/lib/types'
import { api } from '@/lib/api'
import StatusBadge from './StatusBadge'
import LeadActionPanel from '@/components/LeadActionPanel'
import { motion, AnimatePresence } from 'framer-motion'

interface LeadDetailPanelProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onActionComplete: () => void
  currentUserRole?: string
}

const productLabels: Record<ProductType, string> = {
  DRIVE: 'Drive',
  HOME: 'Home',
  PENSION_PLAN: 'Pension Plan',
  OTHER: 'Autre',
}

const productColors: Record<ProductType, { bg: string; text: string }> = {
  DRIVE: { bg: 'bg-sky-50', text: 'text-sky-700' },
  HOME: { bg: 'bg-violet-50', text: 'text-violet-700' },
  PENSION_PLAN: { bg: 'bg-teal-50', text: 'text-teal-700' },
  OTHER: { bg: 'bg-gray-100', text: 'text-gray-600' },
}

const actionTypeLabels: Record<string, { label: string; icon: string; color: string }> = {
  REFUSED: { label: 'Lead refusé', icon: '×', color: 'text-red-500' },
  REFUSAL_CANCELLED: { label: 'Refus annulé', icon: '↩', color: 'text-amber-500' },
  QUOTE_CREATED: { label: 'Devis créé', icon: '📋', color: 'text-emerald-600' },
  CALLBACK_SCHEDULED: { label: 'Rappel planifié', icon: '📅', color: 'text-blue-600' },
  NOTE_ADDED: { label: 'Note ajoutée', icon: '📝', color: 'text-gray-600' },
  CONVERTED: { label: 'Lead converti', icon: '✅', color: 'text-purple-600' },
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
      return ''
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
  currentUserRole,
}: LeadDetailPanelProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [isEditingCallback, setIsEditingCallback] = useState(false)
  const [newCallbackDate, setNewCallbackDate] = useState('')
  const [callbackError, setCallbackError] = useState('')
  const [isSavingCallback, setIsSavingCallback] = useState(false)
  const [showAssignDropdown, setShowAssignDropdown] = useState(false)
  const [agencyAgents, setAgencyAgents] = useState<Agent[]>([])
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignError, setAssignError] = useState('')

  const isResponsable = currentUserRole === 'RESPONSABLE'

  // Fetch agency agents when responsable opens the panel
  useEffect(() => {
    if (isOpen && isResponsable) {
      api.get('/agents/agency').then((res) => {
        setAgencyAgents(res.data)
      }).catch(() => {})
    }
    if (!isOpen) {
      setShowAssignDropdown(false)
      setAssignError('')
    }
  }, [isOpen, isResponsable])

  if (!lead) return null

  const initials = ((lead.firstName[0] ?? '') + (lead.lastName[0] ?? '')).toUpperCase()
  const avatarColor = getAvatarColor(lead.firstName + lead.lastName)
  const leadProducts = lead.productInterest.split(',').map((p) => p.trim()).filter(Boolean)

  // Sort actions by date, most recent first
  const sortedActions = [...(lead.leadActions ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-[1px]"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed right-0 top-0 h-screen w-full md:w-[420px] bg-white shadow-2xl z-50 flex flex-col"
          >
        {/* Panel Header */}
        <div className="flex-shrink-0 border-b border-gray-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
              >
                {initials}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">
                  {lead.firstName} {lead.lastName}
                </h2>
                <div className="mt-1.5">
                  <StatusBadge status={lead.status} size="sm" />
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0 text-gray-400 hover:text-gray-600"
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
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Contact
            </h3>
            <div className="space-y-2.5">
              {lead.email ? (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 transition group"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
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
                  className="flex items-center gap-3 text-sm text-emerald-600 hover:text-emerald-700 transition group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span>{lead.phone}</span>
                </a>
              ) : null}
              {!lead.email && !lead.phone && (
                <p className="text-sm text-gray-400 italic">Aucun contact renseigné</p>
              )}
            </div>
          </div>

          {/* Lead Info */}
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Détails
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
                  {leadProducts.length > 1 ? 'Produits' : 'Produit'}
                </p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {leadProducts.map((p) => {
                    const style = productColors[p as ProductType] ?? productColors['OTHER']
                    return (
                      <span key={p} className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                        {productLabels[p as ProductType] ?? p}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Source</p>
                <p className="text-sm font-medium text-gray-700 mt-1.5">
                  {lead.source === 'API_EXTERNAL' ? 'API externe' : 'Manuelle'}
                </p>
              </div>
              {lead.agencyNumber && (
                <div className="bg-gray-50 rounded-lg px-3 py-2.5 col-span-2">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Agence</p>
                  <p className="text-sm font-medium text-gray-700 mt-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Agence {lead.agencyNumber}
                  </p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Créé le</p>
                <p className="text-xs text-gray-600 mt-1.5">
                  {new Date(lead.createdAt).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Mis à jour</p>
                <p className="text-xs text-gray-600 mt-1.5">
                  {new Date(lead.updatedAt).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Agent + Assignment */}
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Agent assigné
            </h3>
            {lead.assignedAgentName ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {lead.assignedAgentName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{lead.assignedAgentName}</p>
                  <p className="text-[11px] text-indigo-600 font-medium">
                    {lead.assignedAgentRole === 'RESPONSABLE' ? 'Responsable' : 'Employé'}
                  </p>
                </div>
                {isResponsable && lead.status !== 'CONVERTED' && (
                  <button
                    onClick={() => {
                      setShowAssignDropdown(!showAssignDropdown)
                      setAssignError('')
                    }}
                    className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-100 transition flex-shrink-0"
                    title="Réattribuer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  ?
                </div>
                <p className="text-sm text-gray-400 italic flex-1">Non attribué</p>
                {isResponsable && lead.status !== 'CONVERTED' && (
                  <button
                    onClick={() => {
                      setShowAssignDropdown(!showAssignDropdown)
                      setAssignError('')
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                  >
                    Attribuer
                  </button>
                )}
              </div>
            )}

            {/* Assignment dropdown */}
            {showAssignDropdown && isResponsable && (
              <div className="mt-3 p-3 rounded-xl bg-white border-2 border-indigo-200 shadow-lg">
                <p className="text-xs font-semibold text-gray-500 mb-2">Attribuer à un agent de l'agence :</p>
                {assignError && (
                  <p className="text-xs text-red-600 font-medium mb-2">{assignError}</p>
                )}
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {agencyAgents.map((agent) => (
                    <button
                      key={agent.id}
                      disabled={isAssigning || agent.id === lead.agentId}
                      onClick={async () => {
                        setIsAssigning(true)
                        setAssignError('')
                        try {
                          await api.patch(`/leads/${lead.id}/assign`, { agentId: agent.id })
                          setShowAssignDropdown(false)
                          onActionComplete()
                        } catch (err: any) {
                          setAssignError(err.response?.data?.error || 'Erreur lors de l\'attribution')
                        } finally {
                          setIsAssigning(false)
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                        agent.id === lead.agentId
                          ? 'bg-indigo-50 border border-indigo-200 cursor-default'
                          : 'hover:bg-gray-50 border border-transparent'
                      } ${isAssigning ? 'opacity-50' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${
                        agent.role === 'RESPONSABLE' ? 'bg-indigo-500' : 'bg-gray-400'
                      }`}>
                        {agent.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {agent.name}
                          {agent.id === lead.agentId && (
                            <span className="text-[10px] text-indigo-500 font-bold ml-1">(actuel)</span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {agent.role === 'RESPONSABLE' ? 'Responsable' : 'Employé'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Callback Date — for TO_CONTACT leads */}
          {lead.status === 'TO_CONTACT' && (() => {
            const latestCb = sortedActions.find((a) => a.type === 'CALLBACK_SCHEDULED' && a.callbackDate)
            if (!latestCb) return null
            const cbDate = new Date(latestCb.callbackDate!)
            const minDate = (() => {
              const tomorrow = new Date()
              tomorrow.setDate(tomorrow.getDate() + 1)
              tomorrow.setHours(8, 0, 0, 0)
              return tomorrow.toISOString().slice(0, 16)
            })()
            return (
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Prochain contact
                </h3>
                {!isEditingCallback ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-800">
                        {cbDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-yellow-600 mt-0.5">
                        à {cbDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setNewCallbackDate(cbDate.toISOString().slice(0, 16))
                        setIsEditingCallback(true)
                        setCallbackError('')
                      }}
                      className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-100 transition flex-shrink-0"
                      title="Modifier la date"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
                    <input
                      type="datetime-local"
                      value={newCallbackDate}
                      onChange={(e) => setNewCallbackDate(e.target.value)}
                      min={minDate}
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                    />
                    {callbackError && (
                      <p className="text-xs text-red-600 font-medium">{callbackError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          if (!newCallbackDate) {
                            setCallbackError('Sélectionnez une date')
                            return
                          }
                          const selected = new Date(newCallbackDate)
                          const today = new Date()
                          today.setHours(23, 59, 59, 999)
                          if (selected <= today) {
                            setCallbackError('La date doit être dans le futur')
                            return
                          }
                          setIsSavingCallback(true)
                          setCallbackError('')
                          try {
                            await api.post(`/leads/${lead.id}/callback`, { callbackDate: newCallbackDate })
                            setIsEditingCallback(false)
                            onActionComplete()
                          } catch (err: any) {
                            setCallbackError(err.response?.data?.error || 'Erreur lors de la modification')
                          } finally {
                            setIsSavingCallback(false)
                          }
                        }}
                        disabled={isSavingCallback}
                        className="flex-1 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold disabled:opacity-50 transition"
                      >
                        {isSavingCallback ? 'Enregistrement…' : 'Enregistrer'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingCallback(false)
                          setCallbackError('')
                        }}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* Quotes Section — deduplicated by product type, showing only the latest */}
          {(() => {
            const allQuotes = sortedActions.filter((a) => a.type === 'QUOTE_CREATED')
            if (allQuotes.length === 0) return null
            // Keep only the most recent quote per product type
            const latestByProduct = new Map<string, typeof allQuotes[0]>()
            for (const q of allQuotes) {
              const key = q.quotedProduct || 'UNKNOWN'
              if (!latestByProduct.has(key)) {
                latestByProduct.set(key, q)
              }
            }
            const quotes = Array.from(latestByProduct.values())
            return (
              <div className="px-6 py-4 border-b border-gray-50">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Devis ({quotes.length})
                </h3>
                <div className="space-y-2">
                  {quotes.map((q) => {
                    const qProduct = q.quotedProduct ? productLabels[q.quotedProduct as ProductType] : '—'
                    const qColor = q.quotedProduct ? productColors[q.quotedProduct as ProductType] : null
                    return (
                      <div
                        key={q.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-800">
                              {qProduct}
                            </span>
                            {qColor && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${qColor.bg} ${qColor.text}`}>
                                Devis
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {formatDate(q.createdAt)}
                          </p>
                        </div>
                        {q.quoteUrl && (
                          <a
                            href={q.quoteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition flex-shrink-0"
                            title="Voir le devis"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* Action History */}
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Historique
            </h3>
            {sortedActions.length > 0 ? (
              <div className="space-y-3">
                {sortedActions.map((action, index) => {
                  const config = actionTypeLabels[action.type] ?? { label: action.type, icon: '•', color: 'text-gray-500' }
                  const subtitle = getActionSubtitle(action)
                  return (
                    <div key={action.id} className="relative flex gap-3">
                      {/* Timeline line */}
                      {index < sortedActions.length - 1 && (
                        <div className="absolute left-[13px] top-6 w-px h-[calc(100%+4px)] bg-gray-100" />
                      )}
                      {/* Dot */}
                      <div className="relative z-10 mt-0.5 flex-shrink-0">
                        <div className={`w-6 h-6 rounded-full bg-gray-50 border-2 border-gray-100 flex items-center justify-center text-[10px] ${config.color}`}>
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
                        <p className="text-sm font-semibold text-gray-800">
                          {config.label}
                          {action.type === 'QUOTE_CREATED' && action.quotedProduct && (
                            <span className="text-gray-400 font-normal"> — {productLabels[action.quotedProduct as ProductType] ?? action.quotedProduct}</span>
                          )}
                        </p>
                        {subtitle && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{subtitle}</p>
                        )}
                        <p className="text-[11px] text-gray-400 mt-1">
                          {formatDate(action.createdAt)}
                          {action.agentName && (
                            <span className="ml-1">· par {action.agentName}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Aucune activité</p>
            )}
          </div>

          {/* Cancel Refusal — only if lead is REFUSED */}
          {lead.status === 'REFUSED' && (
            <div className="px-6 py-4 border-b border-gray-50">
              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-700 font-semibold text-sm hover:bg-amber-100 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Annuler le refus
                </button>
              ) : (
                <div className="space-y-3 p-4 rounded-xl bg-amber-50 border-2 border-amber-300">
                  <p className="text-sm font-semibold text-amber-800">
                    Confirmer l'annulation du refus ?
                  </p>
                  <p className="text-xs text-amber-600">
                    Le lead repassera en statut "En cours".
                  </p>
                  {cancelError && (
                    <p className="text-xs text-red-600 font-medium">{cancelError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        setIsCancelling(true)
                        setCancelError('')
                        try {
                          await api.post(`/leads/${lead.id}/cancel-refusal`, {})
                          setShowCancelConfirm(false)
                          onActionComplete()
                          onClose()
                        } catch (err: any) {
                          setCancelError(err.response?.data?.error || 'Erreur lors de l\'annulation')
                        } finally {
                          setIsCancelling(false)
                        }
                      }}
                      disabled={isCancelling}
                      className="flex-1 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold disabled:opacity-50 transition"
                    >
                      {isCancelling ? 'Annulation…' : 'Confirmer'}
                    </button>
                    <button
                      onClick={() => {
                        setShowCancelConfirm(false)
                        setCancelError('')
                      }}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-100 transition"
                    >
                      Non
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions Section */}
          <div className="px-6 py-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Actions
            </h3>
            <LeadActionPanel
              leadId={lead.id}
              leadStatus={lead.status}
              onActionComplete={() => {
                onActionComplete()
                onClose()
              }}
            />
          </div>
        </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
