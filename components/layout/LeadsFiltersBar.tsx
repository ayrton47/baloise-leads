'use client'

import { useState } from 'react'
import { Lead, LeadStatus, ProductType } from '@/lib/types'

interface LeadsFiltersBarProps {
  status: LeadStatus | 'ALL'
  product: ProductType | 'ALL'
  searchQuery: string
  onStatusChange: (status: LeadStatus | 'ALL') => void
  onProductChange: (product: ProductType | 'ALL') => void
  onSearchChange: (query: string) => void
  onAddLead: () => void
  activeFiltersCount: number
}

export default function LeadsFiltersBar({
  status,
  product,
  searchQuery,
  onStatusChange,
  onProductChange,
  onSearchChange,
  onAddLead,
  activeFiltersCount,
}: LeadsFiltersBarProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  return (
    <div className="bg-white border-b border-gray-100 sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
            />
            <svg
              className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap md:flex-nowrap">
            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="TO_CONTACT">To Contact</option>
              <option value="QUOTED">Quoted</option>
              <option value="REFUSED">Refused</option>
            </select>

            {/* Product Filter */}
            <select
              value={product}
              onChange={(e) => onProductChange(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white transition"
            >
              <option value="ALL">All Products</option>
              <option value="DRIVE">🚗 Drive</option>
              <option value="HOME">🏠 Home</option>
              <option value="PENSION_PLAN">🏦 Pension Plan</option>
            </select>

            {/* Add Lead Button */}
            <button
              onClick={onAddLead}
              className="bg-blue-900 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-950 transition whitespace-nowrap flex items-center gap-2"
            >
              <span>+</span> Add Lead
            </button>
          </div>

          {/* Active Filters Badge */}
          {activeFiltersCount > 0 && (
            <div className="text-xs text-gray-500">
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
