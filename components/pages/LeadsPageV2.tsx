'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Lead, LeadStatus, ProductType } from '@/lib/types'
import LeadsHeroSection from '@/components/layout/LeadsHeroSection'
import LeadsFiltersBar, { DateRange } from '@/components/layout/LeadsFiltersBar'
import EnhancedLeadRow from '@/components/leads/EnhancedLeadRow'
import EmptyState from '@/components/leads/EmptyState'
import AddLeadModal from '@/components/AddLeadModal'
import LeadsPagination from '@/components/leads/LeadsPagination'
import LeadBulkActions from '@/components/leads/LeadBulkActions'
import LeadDetailPanel from '@/components/leads/LeadDetailPanel'
import { AnimatePresence, motion } from 'framer-motion'

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
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())

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

  // Compute the cutoff date from dateRange
  const getDateCutoff = (range: DateRange): Date | null => {
    if (range === 'ALL') return null
    const now = new Date()
    switch (range) {
      case '7d': now.setDate(now.getDate() - 7); break
      case '30d': now.setDate(now.getDate() - 30); break
      case '90d': now.setDate(now.getDate() - 90); break
      case '6m': now.setMonth(now.getMonth() - 6); break
      case '1y': now.setFullYear(now.getFullYear() - 1); break
    }
    now.setHours(0, 0, 0, 0)
    return now
  }

  // Client-side filtering by status, product, date range, and search query
  useEffect(() => {
    const q = searchQuery.toLowerCase()
    let filtered = allLeads

    // Filter by date range (but keep TO_CONTACT leads with future callback)
    const cutoff = getDateCutoff(dateRange)
    if (cutoff) {
      filtered = filtered.filter((lead) => {
        // Always keep TO_CONTACT leads that have a future callback date
        if (lead.status === 'TO_CONTACT') {
          const callbacks = (lead.leadActions ?? [])
            .filter((a) => a.type === 'CALLBACK_SCHEDULED' && a.callbackDate)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          if (callbacks.length > 0 && new Date(callbacks[0].callbackDate!) >= new Date()) {
            return true
          }
        }
        return new Date(lead.createdAt) >= cutoff
      })
    }

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
  }, [allLeads, searchQuery, status, product, dateRange])

  useEffect(() => {
    fetchLeads()
  }, [])

  // KPI stats from date-filtered leads (but not status/product/search filtered)
  const dateFilteredLeads = (() => {
    const cutoff = getDateCutoff(dateRange)
    if (!cutoff) return allLeads
    return allLeads.filter((lead) => {
      if (lead.status === 'TO_CONTACT') {
        const callbacks = (lead.leadActions ?? [])
          .filter((a) => a.type === 'CALLBACK_SCHEDULED' && a.callbackDate)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        if (callbacks.length > 0 && new Date(callbacks[0].callbackDate!) >= new Date()) {
          return true
        }
      }
      return new Date(lead.createdAt) >= cutoff
    })
  })()

  const kpiStats = {
    new: dateFilteredLeads.filter((l) => l.status === 'NEW').length,
    inProgress: dateFilteredLeads.filter((l) => l.status === 'IN_PROGRESS' || l.status === 'QUOTED').length,
    quoted: 0,
    refused: dateFilteredLeads.filter((l) => l.status === 'REFUSED').length,
    converted: dateFilteredLeads.filter((l) => l.status === 'CONVERTED').length,
    toContact: dateFilteredLeads.filter((l) => l.status === 'TO_CONTACT').length,
    total: dateFilteredLeads.length,
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
    setDateRange('30d')
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

  // Leads to contact today (from ALL leads, regardless of filters)
  const todayStr = new Date().toISOString().slice(0, 10)
  const todayLeads = allLeads.filter((lead) => {
    if (lead.status !== 'TO_CONTACT') return false
    const callbacks = (lead.leadActions ?? [])
      .filter((a) => a.type === 'CALLBACK_SCHEDULED' && a.callbackDate)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (callbacks.length === 0) return false
    const latestDate = callbacks[0].callbackDate!
    return latestDate.slice(0, 10) === todayStr
  })

  // Split filtered leads into 3 groups
  const currentUserId = user?.id
  const myLeads = filteredLeads.filter((l) => l.agentId === currentUserId)
  const unassignedLeads = filteredLeads.filter((l) => !l.agentId)
  const otherLeads = filteredLeads.filter((l) => l.agentId && l.agentId !== currentUserId)

  // Collapsed state for sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const toggleSection = (key: string) =>
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }))

  const renderLeadRow = (lead: Lead, index: number) => (
    <EnhancedLeadRow
      key={lead.id}
      lead={lead}
      index={index}
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
      color: 'text-purple-700',
      bg: 'bg-[#f9f3ff]',
      border: 'border-purple-200',
      badgeBg: 'bg-purple-500',
      leads: otherLeads,
    },
  ]

  return (
    <div className="bg-gray-50 transition-colors">
      {/* KPI Stats Strip */}
      <LeadsHeroSection stats={kpiStats} />

      {/* Filters Bar */}
      <LeadsFiltersBar
        status={status}
        product={product}
        searchQuery={searchQuery}
        dateRange={dateRange}
        onStatusChange={setStatus}
        onProductChange={setProduct}
        onSearchChange={setSearchQuery}
        onDateRangeChange={setDateRange}
        onAddLead={() => setShowAddModal(true)}
        activeFiltersCount={activeFiltersCount}
        stats={kpiStats}
      />

      {/* Today's Callbacks Banner */}
      {!isLoading && todayLeads.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <div className="rounded-2xl border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 overflow-hidden">
            {/* Banner Header */}
            <button
              onClick={() => toggleSection('today')}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-orange-100/40 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <span className="text-sm font-bold text-orange-800">
                  À contacter aujourd'hui
                </span>
                <span className="ml-2 text-xs font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full">
                  {todayLeads.length}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-orange-400 transition-transform ${collapsedSections['today'] ? '-rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Banner Content */}
            {!collapsedSections['today'] && (
              <div className="px-5 pb-4 space-y-2">
                {todayLeads.map((lead) => {
                  const latestCb = [...(lead.leadActions ?? [])]
                    .filter((a) => a.type === 'CALLBACK_SCHEDULED' && a.callbackDate)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
                  const cbTime = latestCb ? new Date(latestCb.callbackDate!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : null

                  return (
                    <div
                      key={lead.id}
                      onClick={() => openPanel(lead)}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white border border-orange-200 hover:border-orange-400 hover:shadow-md cursor-pointer transition group"
                    >
                      {/* Time badge */}
                      {cbTime && (
                        <div className="flex-shrink-0 w-14 text-center">
                          <span className="text-sm font-bold text-orange-700">{cbTime}</span>
                        </div>
                      )}
                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {lead.firstName} {lead.lastName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {lead.email || lead.phone || 'Pas de contact'}
                        </p>
                      </div>
                      {/* Product */}
                      <div className="flex-shrink-0 hidden sm:block">
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                          {lead.productInterest.split(',')[0]}
                        </span>
                      </div>
                      {/* Agent */}
                      {lead.assignedAgentName && (
                        <div className="flex-shrink-0 hidden md:flex items-center gap-1.5">
                          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-xs text-gray-500">{lead.assignedAgentName}</span>
                        </div>
                      )}
                      {/* Phone quick action */}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-shrink-0 p-2 rounded-lg text-orange-400 hover:text-orange-600 hover:bg-orange-50 transition"
                          title={`Appeler ${lead.phone}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </a>
                      )}
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 ${selectedLeads.size > 0 ? 'pb-28' : ''}`}>
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
            {sections.map((section, sectionIndex) => {
              const isCollapsed = collapsedSections[section.key] ?? false
              if (section.leads.length === 0) return null
              return (
                <div
                  key={section.key}
                  className="overflow-hidden"
                >
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
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Section Content */}
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        key={`content-${section.key}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="space-y-2">
                          {section.leads.map(renderLeadRow)}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
      <AnimatePresence>
        {showAddModal && (
          <AddLeadModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false)
              fetchLeads()
            }}
            currentUser={user}
          />
        )}
      </AnimatePresence>

    </div>
  )
}
