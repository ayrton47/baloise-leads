'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

const PRODUCTS = [
  { value: 'DRIVE', label: 'Drive' },
  { value: 'HOME', label: 'Home' },
  { value: 'PENSION_PLAN', label: 'Pension Plan' },
  { value: 'OTHER', label: 'Autre' },
]

export default function AddLeadModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const toggleProduct = (value: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev)
      next.has(value) ? next.delete(value) : next.add(value)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!firstName || !lastName || selectedProducts.size === 0) {
      setError('Remplissez tous les champs obligatoires')
      return
    }

    setIsLoading(true)

    try {
      await api.post('/leads', {
        firstName,
        lastName,
        email: email || undefined,
        phone: phone || undefined,
        productInterest: Array.from(selectedProducts).join(','),
      })
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-colors">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md transition-colors">
        <h2 className="text-xl font-bold mb-4 text-gray-800 transition-colors">➕ Ajouter un lead</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors">
              Prénom *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors">
              Nom *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="exemple@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors">
              Téléphone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="+352 621 123 456"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors">
              Produit(s) intéressé(s) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRODUCTS.map((p) => {
                const isChecked = selectedProducts.has(p.value)
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => toggleProduct(p.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border-2 transition ${
                      isChecked
                        ? 'border-[#00358E] bg-[#00358E]/10 text-[#00358E]'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                        isChecked
                          ? 'border-[#00358E] bg-[#00358E]'
                          : 'border-gray-300'
                      }`}
                    >
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg text-sm transition-colors">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {isLoading ? 'Création...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
