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
import LeadDetailPanel from '@/components/leads/LeadDetailPanel'
import ProfileModal from '@/components/ProfileModal'

export default function LeadsPageV2({
  user,
  onLogout,
  onUpdateUser,
}: {
  user: any
  onLogout: () => void
  onUpdateUser?: (token: string, user: any) => void
}) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [status, setStatus] = useState<LeadStatus | 'ALL'>('ALL')
  const [product, setProduct] = useState<ProductType | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [showProfileModal, setShowProfileModal] = useState(false)

  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      // When filtering IN_PROGRESS, also include QUOTED leads
      if (status !== 'ALL' && status !== 'IN_PROGRESS') params.append('status', status)
      if (product !== 'ALL') params.append('product', product)
      const response = await api.get(`/leads?${params}`)
      setLeads(response.data)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter leads by search query and status
  useEffect(() => {
    const q = searchQuery.toLowerCase()
    let filtered = leads.filter(
      (lead) =>
        lead.firstName.toLowerCase().includes(q) ||
        lead.lastName.toLowerCase().includes(q) ||
        (lead.email?.toLowerCase().includes(q) ?? false) ||
        (lead.phone?.toLowerCase().includes(q) ?? false)
    )
    // Client-side filter for IN_PROGRESS (includes QUOTED)
    if (status === 'IN_PROGRESS') {
      filtered = filtered.filter((l) => l.status === 'IN_PROGRESS' || l.status === 'QUOTED')
    }
    setFilteredLeads(filtered)
    setCurrentPage(1)
  }, [leads, searchQuery, status])

  useEffect(() => {
    fetchLeads()
  }, [status, product])

  // KPI stats from the full leads list
  const kpiStats = {
    new: leads.filter((l) => l.status === 'NEW').length,
    inProgress: leads.filter((l) => l.status === 'IN_PROGRESS' || l.status === 'QUOTED').length,
    quoted: 0,
    refused: leads.filter((l) => l.status === 'REFUSED').length,
    converted: leads.filter((l) => l.status === 'CONVERTED').length,
    toContact: leads.filter((l) => l.status === 'TO_CONTACT').length,
    total: leads.length,
  }

  const activeFiltersCount = [
    status !== 'ALL' ? 1 : 0,
    product !== 'ALL' ? 1 : 0,
    searchQuery ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const handleClearFilters = () => {
    setStatus('ALL')
    setProduct('ALL')
    setSearchQuery('')
  }

  // Detail panel
  const openPanel = (lead: Lead) => {
    setSelectedLead(lead)
    setIsPanelOpen(true)
  }
  const closePanel = () => {
    setIsPanelOpen(false)
    setTimeout(() => setSelectedLead(null), 300)
  }

  // Bulk selection
  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads((prev) => {
      const next = new Set(prev)
      next.has(leadId) ? next.delete(leadId) : next.add(leadId)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(filteredLeads.map((l) => l.id)))
    }
  }

  const clearSelection = () => setSelectedLeads(new Set())

  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const allPaginatedSelected =
    paginatedLeads.length > 0 && paginatedLeads.every((l) => selectedLeads.has(l.id))

  return (
    <div className="min-h-screen bg-gray-50 transition-colors">
      {/* Header */}
      <LeadsHeader userName={user?.name} onLogout={onLogout} onOpenProfile={() => setShowProfileModal(true)} />

      {/* KPI Stats Strip */}
      <LeadsHeroSection stats={kpiStats} />

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
        stats={kpiStats}
      />

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-8 py-6 ${selectedLeads.size > 0 ? 'pb-28' : ''}`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-8 h-8 border-[3px] border-[#00358E] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Chargement des leads…</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <EmptyState
            type={leads.length === 0 ? 'no-leads' : 'no-results'}
            onAddLead={() => setShowAddModal(true)}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <div className="space-y-3">
            {/* Leads List */}
            <div className="space-y-2">
              {paginatedLeads.map((lead) => (
                <EnhancedLeadRow
                  key={lead.id}
                  lead={lead}
                  onActionComplete={() => {
                    fetchLeads()
                    clearSelection()
                  }}
                  onClick={() => openPanel(lead)}
                  isSelected={selectedLeads.has(lead.id)}
                  onToggleSelection={toggleLeadSelection}
                />
              ))}
            </div>

            {/* Pagination — bottom */}
            <div className="pt-2">
              <LeadsPagination
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredLeads.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
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

      {/* Lead Detail Panel */}
      <LeadDetailPanel
        lead={selectedLead}
        isOpen={isPanelOpen}
        onClose={closePanel}
        onActionComplete={() => {
          fetchLeads()
          clearSelection()
        }}
      />

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

      {/* Profile Modal */}
      {showProfileModal && user && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onUpdate={(token, updatedUser) => {
            onUpdateUser?.(token, updatedUser)
          }}
          onLogout={onLogout}
        />
      )}
    </div>
  )
}
