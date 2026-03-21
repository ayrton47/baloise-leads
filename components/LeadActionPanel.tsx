'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

type ActionType = 'refuse' | 'quote' | 'callback' | null

const REFUSAL_REASONS = [
  { value: 'NO_ASSET', label: 'Pas de bien à assurer' },
  { value: 'PRICE_TOO_HIGH', label: 'Tarif trop cher' },
  { value: 'ALREADY_INSURED', label: 'Déjà assuré à la concurrence' },
  { value: 'OTHER', label: 'Autre' },
]

const PRODUCTS = [
  { value: 'DRIVE', label: '🚗 Drive' },
  { value: 'HOME', label: '🏠 Home' },
  { value: 'PENSION_PLAN', label: '🏦 Pension Plan' },
]

export default function LeadActionPanel({
  leadId,
  onActionComplete,
}: {
  leadId: string
  onActionComplete: () => void
}) {
  const [activeAction, setActiveAction] = useState<ActionType>(null)
  const [refusalReason, setRefusalReason] = useState('')
  const [refusalNote, setRefusalNote] = useState('')
  const [product, setProduct] = useState('')
  const [callbackDate, setCallbackDate] = useState('')
  const [callbackNote, setCallbackNote] = useState('')
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
      } else if (activeAction === 'callback') {
        if (!callbackDate) {
          setError('Sélectionnez une date')
          setIsLoading(false)
          return
        }
        await api.post(`/leads/${leadId}/callback`, {
          callbackDate,
          note: callbackNote,
        })
      }

      onActionComplete()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue')
      setIsLoading(false)
    }
  }

  return (
    <div className="border rounded-xl p-4 space-y-4 bg-blue-50 border-blue-200 shadow-sm">
      <h3 className="font-semibold text-gray-700">Actions possibles</h3>

      <div className="flex gap-2 flex-wrap">
        {(['refuse', 'quote', 'callback'] as ActionType[]).map((action) => (
          <button
            key={action}
            onClick={() => {
              setActiveAction(activeAction === action ? null : action)
              setError('')
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
              activeAction === action
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {action === 'refuse'
              ? '❌ Refus client'
              : action === 'quote'
              ? '📋 Créer un tarif'
              : '📅 Recontacter'}
          </button>
        ))}
      </div>

      {activeAction === 'refuse' && (
        <div className="space-y-2 pt-2 border-t border-blue-200">
          <select
            value={refusalReason}
            onChange={(e) => setRefusalReason(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          )}
        </div>
      )}

      {activeAction === 'quote' && (
        <div className="space-y-2 pt-2 border-t border-blue-200">
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="space-y-2 pt-2 border-t border-blue-200">
          <input
            type="datetime-local"
            value={callbackDate}
            onChange={(e) => setCallbackDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={callbackNote}
            onChange={(e) => setCallbackNote(e.target.value)}
            placeholder="Note (optionnelle)..."
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {activeAction && (
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {isLoading ? 'Enregistrement...' : 'Confirmer'}
        </button>
      )}
    </div>
  )
}
