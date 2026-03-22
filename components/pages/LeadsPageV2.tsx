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
  const [allLeads, setAllLeads] = useState<Lead[]>([])
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
      // Always fetch ALL leads — filtering is done client-side
      const response = await api.get('/leads')
      setAllLeads(response.data)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Client-side filtering by status, product, and search query
  useEffect(() => {
    const q = searchQuery.toLowerCase()
    let filtered = allLeads

    // Filter by status
    if (status === 'IN_PROGRESS') {
      filtered = filtered.filter((l) => l.status === 'IN_PROGRESS' || l.status === 'QUOTED')
    } else if (status !== 'ALL') {
      filtered = filtered.filter((l) => l.status === status)
    }

    // Filter by product
    if (product !== 'ALL') {
      filtered = filtered.filter((l) => l.productInterest.includes(product))
    }

    // Filter by search
    if (q) {
      filtered = filtered.filter(
        (lead) =>
          lead.firstName.toLowerCase().includes(q) ||
          lead.lastName.toLowerCase().includes(q) ||
          (lead.email?.toLowerCase().includes(q) ?? false) ||
          (lead.phone?.toLowerCase().includes(q) ?? false)
      )
    }

    setFilteredLeads(filtered)
    setCurrentPage(1)
  }, [allLeads, searchQuery, status, product])

  useEffect(() => {
    fetchLeads()
  }, [])

  // KPI stats always from ALL leads (not filtered)
  const kpiStats = {
    new: allLeads.filter((l) => l.status === 'NEW').length,
    inProgress: allLeads.filter((l) => l.status === 'IN_PROGRESS' || l.status === 'QUOTED').length,
    quoted: 0,
    refused: allLeads.filter((l) => l.status === 'REFUSED').length,
    converted: allLeads.filter((l) => l.status === 'CONVERTED').length,
    toContact: allLeads.filter((l) => l.status === 'TO_CONTACT').length,
    total: allLeads.length,
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

  // Split filtered leads into 3 groups
  const currentUserId = user?.id
  const myLeads = filteredLeads.filter((l) => l.agentId === currentUserId)
  const unassignedLeads = filteredLeads.filter((l) => !l.agentId)
  const otherLeads = filteredLeads.filter((l) => l.agentId && l.agentId !== currentUserId)

  // Collapsed state for sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const toggleSection = (key: string) =>
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }))

  const renderLeadRow = (lead: Lead) => (
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
  )

  const sections = [
    {
      key: 'my',
      label: 'Mes leads',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'text-indigo-700',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      badgeBg: 'bg-indigo-600',
      leads: myLeads,
    },
    {
      key: 'unassigned',
      label: 'Non attribués',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-600',
      leads: unassignedLeads,
    },
    {
      key: 'others',
      label: 'Leads des autres agents',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      badgeBg: 'bg-gray-500',
      leads: otherLeads,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 transition-colors">
      {/* Header */}
      <LeadsHeader userName={user?.name} agencyNumber={user?.agencyNumber} role={user?.role} onLogout={onLogout} onOpenProfile={() => setShowProfileModal(true)} />

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
            type={allLeads.length === 0 ? 'no-leads' : 'no-results'}
            onAddLead={() => setShowAddModal(true)}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <div className="space-y-6">
            {sections.map((section) => {
              const isCollapsed = collapsedSections[section.key] ?? false
              if (section.leads.length === 0) return null
              return (
                <div key={section.key}>
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${section.bg} border ${section.border} mb-3 hover:shadow-sm transition group`}
                  >
                    <span className={section.color}>{section.icon}</span>
                    <span className={`text-sm font-bold ${section.color}`}>
                      {section.label}
                    </span>
                    <span className={`text-xs font-bold text-white px-2 py-0.5 rounded-full ${section.badgeBg}`}>
                      {section.leads.length}
                    </span>
                    <div className="flex-1" />
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Section Content */}
                  {!isCollapsed && (
                    <div className="space-y-2">
                      {section.leads.map(renderLeadRow)}
                    </div>
                  )}
                </div>
              )
            })}
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
          currentUserRole={user?.role}
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
        currentUserRole={user?.role}
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
