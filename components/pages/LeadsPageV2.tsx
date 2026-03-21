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
import LeadsPagination from '@/components/leads/LeadsPagination'
import LeadBulkActions from '@/components/leads/LeadBulkActions'

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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())

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
    // Reset to page 1 when filters change
    setCurrentPage(1)
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

  // Bulk selection handlers
  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(leadId)) {
        newSet.delete(leadId)
      } else {
        newSet.add(leadId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(filteredLeads.map((lead) => lead.id)))
    }
  }

  const clearSelection = () => {
    setSelectedLeads(new Set())
  }

  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const allPaginatedLeadsSelected = paginatedLeads.length > 0 && paginatedLeads.every((lead) => selectedLeads.has(lead.id))

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
      <main className={`max-w-7xl mx-auto px-8 py-10 ${selectedLeads.size > 0 ? 'pb-32' : ''}`}>
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
            {/* Pagination - Top */}
            <div className="flex items-center justify-between">
              <LeadsPagination
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredLeads.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
              {/* Select All Checkbox */}
              {paginatedLeads.length > 0 && (
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                  <input
                    type="checkbox"
                    checked={allPaginatedLeadsSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded accent-blue-900"
                    aria-label="Select all leads on this page"
                  />
                  Select all on page
                </label>
              )}
            </div>

            {/* Leads List */}
            <div className="space-y-4">
              {paginatedLeads.map((lead) => (
                <div key={lead.id}>
                  <EnhancedLeadRow
                    lead={lead}
                    onActionComplete={() => {
                      fetchLeads()
                      clearSelection()
                    }}
                    onClick={() => setSelectedLead(lead)}
                    isSelected={selectedLeads.has(lead.id)}
                    onToggleSelection={toggleLeadSelection}
                  />
                </div>
              ))}
            </div>

            {/* Pagination - Bottom */}
            <LeadsPagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredLeads.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </main>

      {/* Bulk Actions Bar */}
      {selectedLeads.size > 0 && (
        <LeadBulkActions
          selectedLeadIds={selectedLeads}
          leads={filteredLeads}
          onActionComplete={() => {
            fetchLeads()
            clearSelection()
          }}
          onClearSelection={clearSelection}
        />
      )}

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
