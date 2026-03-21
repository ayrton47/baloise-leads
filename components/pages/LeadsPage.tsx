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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 sticky top-0 z-10 bg-white">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Baloise Leads</h1>
            <p className="text-sm text-gray-500 mt-1">Bienvenue, <span className="text-gray-700 font-medium">{user?.name}</span></p>
          </div>
          <button
            onClick={onLogout}
            className="px-5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { key: 'NEW', label: 'Nouveaux', count: statusCounts.NEW, color: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
            { key: 'IN_PROGRESS', label: 'En cours', count: statusCounts.IN_PROGRESS, color: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
            { key: 'QUOTED', label: 'Devis créé', count: statusCounts.QUOTED, color: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
            { key: 'REFUSED', label: 'Refusés', count: statusCounts.REFUSED, color: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
          ].map((stat) => (
            <div
              key={stat.key}
              className={`${stat.color} border ${stat.borderColor} rounded-lg p-5`}
            >
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>{stat.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="max-w-7xl mx-auto px-8 py-6 flex gap-3 items-center flex-wrap border-b border-gray-200">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
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
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
        >
          <option value="ALL">Tous les produits</option>
          <option value="DRIVE">🚗 Drive</option>
          <option value="HOME">🏠 Home</option>
          <option value="PENSION_PLAN">🏦 Pension Plan</option>
        </select>

        <button
          onClick={() => setShowAddModal(true)}
          className="ml-auto bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
        >
          + Ajouter un lead
        </button>
      </div>

      {/* Leads List */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        {isLoading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="animate-spin w-6 h-6 border-3 border-red-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4">Chargement...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Aucun lead trouvé</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-6 text-red-600 font-medium hover:text-red-700 transition"
            >
              Créer le premier lead
            </button>
          </div>
        ) : (
          <div className="space-y-3">
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
