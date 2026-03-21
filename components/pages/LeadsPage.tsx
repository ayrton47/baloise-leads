'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Lead, LeadStatus, ProductType } from '@/lib/types'
import LeadRow from '@/components/LeadRow'
import AddLeadModal from '@/components/AddLeadModal'

export default function LeadsPage({
  user,
  onLogout,
}: {
  user: any
  onLogout: () => void
}) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [status, setStatus] = useState<LeadStatus | 'ALL'>('ALL')
  const [product, setProduct] = useState<ProductType | 'ALL'>('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams()
      if (status !== 'ALL') params.append('status', status)
      if (product !== 'ALL') params.append('product', product)

      const response = await api.get(`/leads?${params}`)
      setLeads(response.data)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [status, product])

  const statusCounts = {
    NEW: leads.filter((l) => l.status === 'NEW').length,
    IN_PROGRESS: leads.filter((l) => l.status === 'IN_PROGRESS').length,
    QUOTED: leads.filter((l) => l.status === 'QUOTED').length,
    REFUSED: leads.filter((l) => l.status === 'REFUSED').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📊 Suivi des Leads</h1>
            <p className="text-sm text-gray-600">Bienvenue, {user?.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'NEW', label: 'Nouveaux', icon: '✨', count: statusCounts.NEW },
              { key: 'IN_PROGRESS', label: 'En cours', icon: '⏳', count: statusCounts.IN_PROGRESS },
              { key: 'QUOTED', label: 'Devis créé', icon: '📋', count: statusCounts.QUOTED },
              { key: 'REFUSED', label: 'Refusés', icon: '❌', count: statusCounts.REFUSED },
            ].map((stat) => (
              <div
                key={stat.key}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
              >
                <p className="text-2xl mb-1">{stat.icon}</p>
                <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-blue-600">{stat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-4 items-center flex-wrap">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="NEW">Nouveau</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="TO_CONTACT">À recontacter</option>
            <option value="QUOTED">Devis créé</option>
            <option value="REFUSED">Refusé</option>
          </select>

          <select
            value={product}
            onChange={(e) => setProduct(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tous les produits</option>
            <option value="DRIVE">🚗 Drive</option>
            <option value="HOME">🏠 Home</option>
            <option value="PENSION_PLAN">🏦 Pension Plan</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            + Ajouter un lead
          </button>
        </div>
      </div>

      {/* Leads List */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Aucun lead trouvé</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              Créer le premier lead
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {leads.map((lead) => (
              <LeadRow key={lead.id} lead={lead} onActionComplete={fetchLeads} />
            ))}
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            fetchLeads()
          }}
        />
      )}
    </div>
  )
}
