'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Lead, LeadStatus, ProductType } from '@/lib/types'
import LeadsHeader from '@/components/layout/LeadsHeader'
import LeadsHeroSection from '@/components/layout/LeadsHeroSection'
import LeadsFiltersBar from '@/components/layout/LeadsFiltersBar'
import EnhancedLeadRow from '@/components/leads/EnhancedLeadRow'
import EmptyState from '@/components/leads/EmptyState'
import AddLeadModal from '@/components/AddLeadModal'

export default function LeadsPageV2({
  user,
  onLogout,
}: {
  user: any
  onLogout: () => void
}) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [status, setStatus] = useState<LeadStatus | 'ALL'>('ALL')
  const [product, setProduct] = useState<ProductType | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  // Fetch leads
  const fetchLeads = async () => {
    try {
      setIsLoading(true)
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

  // Filter leads by search query
  useEffect(() => {
    const filtered = leads.filter((lead) => {
      const searchLower = searchQuery.toLowerCase()
      return (
        lead.firstName.toLowerCase().includes(searchLower) ||
        lead.lastName.toLowerCase().includes(searchLower) ||
        (lead.email?.toLowerCase().includes(searchLower) ?? false) ||
        (lead.phone?.toLowerCase().includes(searchLower) ?? false)
      )
    })
    setFilteredLeads(filtered)
  }, [leads, searchQuery])

  // Fetch leads on filter change
  useEffect(() => {
    fetchLeads()
  }, [status, product])

  // Calculate stats
  const stats = {
    new: leads.filter((l) => l.status === 'NEW').length,
    inProgress: leads.filter((l) => l.status === 'IN_PROGRESS').length,
    quoted: leads.filter((l) => l.status === 'QUOTED').length,
    refused: leads.filter((l) => l.status === 'REFUSED').length,
  }

  // Count active filters
  const activeFiltersCount = [status !== 'ALL' ? 1 : 0, product !== 'ALL' ? 1 : 0, searchQuery ? 1 : 0].reduce((a, b) => a + b, 0)

  const handleClearFilters = () => {
    setStatus('ALL')
    setProduct('ALL')
    setSearchQuery('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <LeadsHeader userName={user?.name} onLogout={onLogout} />

      {/* Hero Section */}
      <LeadsHeroSection stats={stats} />

      {/* Filters Bar */}
      <LeadsFiltersBar
        status={status}
        product={product}
        searchQuery={searchQuery}
        onStatusChange={setStatus}
        onProductChange={setProduct}
        onSearchChange={setSearchQuery}
        onAddLead={() => setShowAddModal(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-10">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full"></div>
            <p className="text-gray-500 mt-4">Loading leads...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <EmptyState
            type={leads.length === 0 ? 'no-leads' : 'no-results'}
            onAddLead={() => setShowAddModal(true)}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div key={lead.id}>
                <EnhancedLeadRow
                  lead={lead}
                  onActionComplete={fetchLeads}
                  onClick={() => setSelectedLead(lead)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

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
