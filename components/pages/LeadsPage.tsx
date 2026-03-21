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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">🎯 Baloise Leads</h1>
            <p className="text-red-100 text-sm mt-1">Bienvenue, <span className="font-semibold">{user?.name}</span></p>
          </div>
          <button
            onClick={onLogout}
            className="px-6 py-2 rounded-lg text-sm font-semibold text-red-600 bg-white hover:bg-red-50 transition duration-200"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { key: 'NEW', label: 'Nouveaux', icon: '✨', count: statusCounts.NEW, color: 'from-blue-500 to-blue-600' },
              { key: 'IN_PROGRESS', label: 'En cours', icon: '⏳', count: statusCounts.IN_PROGRESS, color: 'from-orange-500 to-orange-600' },
              { key: 'QUOTED', label: 'Devis créé', icon: '📋', count: statusCounts.QUOTED, color: 'from-green-500 to-green-600' },
              { key: 'REFUSED', label: 'Refusés', icon: '❌', count: statusCounts.REFUSED, color: 'from-red-500 to-red-600' },
            ].map((stat) => (
              <div
                key={stat.key}
                className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105`}
              >
                <p className="text-4xl mb-2">{stat.icon}</p>
                <p className="text-sm font-medium opacity-90">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-8 py-6 flex gap-4 items-center flex-wrap">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="border border-slate-600 bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
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
            className="border border-slate-600 bg-slate-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          >
            <option value="ALL">Tous les produits</option>
            <option value="DRIVE">🚗 Drive</option>
            <option value="HOME">🏠 Home</option>
            <option value="PENSION_PLAN">🏦 Pension Plan</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="ml-auto bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:from-red-700 hover:to-red-800 transition shadow-lg"
          >
            + Ajouter un lead
          </button>
        </div>
      </div>

      {/* Leads List */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {isLoading ? (
          <div className="text-center py-16 text-slate-400">
            <div className="inline-block">
              <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full"></div>
            </div>
            <p className="mt-4">Chargement...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg">Aucun lead trouvé</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-6 text-red-400 font-semibold hover:text-red-300 transition"
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
