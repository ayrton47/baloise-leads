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
    <div className="border rounded-xl p-4 space-y-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 shadow-sm transition-colors">
      <h3 className="font-semibold text-gray-900 dark:text-white transition-colors">Actions possibles</h3>

      <div className="flex gap-2 flex-wrap">
        {(['refuse', 'quote', 'callback'] as ActionType[]).map((action) => (
          <button
            key={action}
            onClick={() => {
              setActiveAction(activeAction === action ? null : action)
              setError('')
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition ${
              activeAction === action
                ? 'bg-blue-600 dark:bg-blue-700 text-white border-blue-600 dark:border-blue-700'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-400 dark:border-gray-600 hover:border-gray-500 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
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
        <div className="space-y-2 pt-2 border-t border-blue-200 dark:border-blue-700 transition-colors">
          <select
            value={refusalReason}
            onChange={(e) => setRefusalReason(e.target.value)}
            className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
              className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
              rows={2}
            />
          )}
        </div>
      )}

      {activeAction === 'quote' && (
        <div className="space-y-2 pt-2 border-t border-blue-200 dark:border-blue-700 transition-colors">
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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
        <div className="space-y-2 pt-2 border-t border-blue-200 dark:border-blue-700 transition-colors">
          <input
            type="datetime-local"
            value={callbackDate}
            onChange={(e) => setCallbackDate(e.target.value)}
            className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          <textarea
            value={callbackNote}
            onChange={(e) => setCallbackNote(e.target.value)}
            placeholder="Note (optionnelle)..."
            className="w-full border-2 border-gray-400 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition font-medium"
            rows={2}
          />
        </div>
      )}

      {error && <p className="text-red-700 dark:text-red-400 text-sm font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-700 transition-colors">{error}</p>}

      {activeAction && (
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-blue-600 dark:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-bold hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 transition shadow-md hover:shadow-lg"
        >
          {isLoading ? 'Enregistrement...' : 'Confirmer'}
        </button>
      )}
    </div>
  )
}
