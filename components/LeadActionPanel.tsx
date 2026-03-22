'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

import { LeadStatus } from '@/lib/types'

type ActionType = 'refuse' | 'quote' | 'callback' | 'convert' | 'note' | null

const REFUSAL_REASONS = [
  { value: 'NO_ASSET', label: 'Pas de bien à assurer' },
  { value: 'PRICE_TOO_HIGH', label: 'Tarif trop cher' },
  { value: 'ALREADY_INSURED', label: 'Déjà assuré à la concurrence' },
  { value: 'OTHER', label: 'Autre' },
]

const PRODUCTS = [
  { value: 'DRIVE', label: 'Drive' },
  { value: 'HOME', label: 'Home' },
  { value: 'PENSION_PLAN', label: 'Pension Plan' },
  { value: 'OTHER', label: 'Autre' },
]

export default function LeadActionPanel({
  leadId,
  leadStatus,
  onActionComplete,
}: {
  leadId: string
  leadStatus?: LeadStatus
  onActionComplete: () => void
}) {
  const [activeAction, setActiveAction] = useState<ActionType>(null)
  const [refusalReason, setRefusalReason] = useState('')
  const [refusalNote, setRefusalNote] = useState('')
  const [product, setProduct] = useState('')
  const [callbackDate, setCallbackDate] = useState('')
  const [callbackNote, setCallbackNote] = useState('')
  const [noteText, setNoteText] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setIsLoading(true)

    try {
      if (activeAction === 'refuse') {
        if (!refusalReason) {
          setError('Sélectionnez un motif')
          setIsLoading(false)
          return
        }
        await api.post(`/leads/${leadId}/refuse`, {
          reason: refusalReason,
          note: refusalNote,
        })
      } else if (activeAction === 'quote') {
        if (!product) {
          setError('Sélectionnez un produit')
          setIsLoading(false)
          return
        }
        await api.post(`/leads/${leadId}/quote`, { product })
        // Open external quote tool in new tab
        const quoteUrls: Record<string, string> = {
          DRIVE: 'https://v2.bisa.lu/production/home/quote',
          HOME: 'https://v2.bisa.lu/production/home/quote',
          PENSION_PLAN: 'https://v2.bisa.lu/production/pension-plan/proposition',
        }
        if (quoteUrls[product]) {
          window.open(quoteUrls[product], '_blank')
        }
      } else if (activeAction === 'callback') {
        if (!callbackDate) {
          setError('Sélectionnez une date')
          setIsLoading(false)
          return
        }
        const selected = new Date(callbackDate)
        const today = new Date()
        today.setHours(23, 59, 59, 999)
        if (selected <= today) {
          setError('La date doit être dans le futur (à partir de demain)')
          setIsLoading(false)
          return
        }
        await api.post(`/leads/${leadId}/callback`, {
          callbackDate,
          note: callbackNote,
        })
      } else if (activeAction === 'note') {
        if (!noteText.trim()) {
          setError('Écrivez une remarque')
          setIsLoading(false)
          return
        }
        await api.post(`/leads/${leadId}/note`, { note: noteText })
      } else if (activeAction === 'convert') {
        await api.post(`/leads/${leadId}/convert`, {})
      }

      onActionComplete()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue')
      setIsLoading(false)
    }
  }

  if (leadStatus === 'CONVERTED') {
    return (
      <div className="border rounded-xl p-4 bg-purple-50 border-purple-200 shadow-sm transition-colors">
        <div className="flex items-center gap-2 text-purple-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-semibold">Ce lead est converti — aucune action disponible</p>
        </div>
      </div>
    )
  }

  const actionButtons: { key: ActionType; label: string }[] = [
    { key: 'refuse', label: '❌ Refus client' },
    { key: 'quote', label: '📋 Créer un tarif' },
    { key: 'callback', label: '📅 Recontacter' },
    { key: 'note', label: '💬 Remarque' },
    { key: 'convert', label: '✅ Convertir' },
  ]

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-blue-50 border-blue-200 shadow-sm transition-colors">
      <h3 className="font-semibold text-gray-900 transition-colors">Actions possibles</h3>

      <div className="flex gap-2 flex-wrap">
        {actionButtons.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setActiveAction(activeAction === key ? null : key)
              setError('')
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition ${
              activeAction === key
                ? key === 'convert'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-900 border-gray-400 hover:border-gray-500 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeAction === 'refuse' && (
        <div className="space-y-2 pt-2 border-t border-blue-200 transition-colors">
          <select
            value={refusalReason}
            onChange={(e) => setRefusalReason(e.target.value)}
            className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="">-- Motif de refus --</option>
            {REFUSAL_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {refusalReason === 'OTHER' && (
            <textarea
              value={refusalNote}
              onChange={(e) => setRefusalNote(e.target.value)}
              placeholder="Précisez le motif..."
              className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
              rows={2}
            />
          )}
        </div>
      )}

      {activeAction === 'quote' && (
        <div className="space-y-2 pt-2 border-t border-blue-200 transition-colors">
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="">-- Choisir un produit --</option>
            {PRODUCTS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeAction === 'callback' && (
        <div className="space-y-2 pt-2 border-t border-blue-200 transition-colors">
          <input
            type="datetime-local"
            value={callbackDate}
            onChange={(e) => setCallbackDate(e.target.value)}
            min={(() => {
              const tomorrow = new Date()
              tomorrow.setDate(tomorrow.getDate() + 1)
              tomorrow.setHours(8, 0, 0, 0)
              return tomorrow.toISOString().slice(0, 16)
            })()}
            className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          <textarea
            value={callbackNote}
            onChange={(e) => setCallbackNote(e.target.value)}
            placeholder="Note (optionnelle)..."
            className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
            rows={2}
          />
        </div>
      )}

      {activeAction === 'note' && (
        <div className="space-y-2 pt-2 border-t border-blue-200 transition-colors">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Écrire une remarque sur ce lead..."
            className="w-full border-2 border-gray-400 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
            rows={3}
          />
        </div>
      )}

      {activeAction === 'convert' && (
        <div className="space-y-2 pt-2 border-t border-blue-200 transition-colors">
          <p className="text-sm text-purple-700 font-medium">
            Marquer ce lead comme converti ? Aucune action ne sera possible après cette étape.
          </p>
        </div>
      )}

      {error && <p className="text-red-700 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg border border-red-200 transition-colors">{error}</p>}

      {activeAction && (
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-md hover:shadow-lg"
        >
          {isLoading ? 'Enregistrement...' : 'Confirmer'}
        </button>
      )}
    </div>
  )
}
