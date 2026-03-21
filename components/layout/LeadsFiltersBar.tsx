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
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-20 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 dark:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 pl-10 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as LeadStatus | 'ALL')}
              className="w-full appearance-none border-2 border-gray-400 dark:border-gray-500 rounded-lg px-4 py-3 pr-10 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 dark:focus:border-blue-500 hover:border-gray-500 dark:hover:border-gray-400 transition cursor-pointer"
            >
              <option value="ALL">📊 All Status</option>
              <option value="NEW">🆕 New</option>
              <option value="IN_PROGRESS">⏳ In Progress</option>
              <option value="TO_CONTACT">📞 To Contact</option>
              <option value="QUOTED">📋 Quoted</option>
              <option value="REFUSED">❌ Refused</option>
              <option value="CONVERTED">✅ Converted</option>
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Product Filter */}
          <div className="relative">
            <select
              value={product}
              onChange={(e) => onProductChange(e.target.value as ProductType | 'ALL')}
              className="w-full appearance-none border-2 border-gray-400 dark:border-gray-500 rounded-lg px-4 py-3 pr-10 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 dark:focus:border-blue-500 hover:border-gray-500 dark:hover:border-gray-400 transition cursor-pointer"
            >
              <option value="ALL">🛍️ All Products</option>
              <option value="DRIVE">🚗 Drive Insurance</option>
              <option value="HOME">🏠 Home Insurance</option>
              <option value="PENSION_PLAN">🏦 Pension Plan</option>
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Add Lead Button */}
          <button
            onClick={onAddLead}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-3 rounded-lg font-medium text-sm transition"
          >
            + Add Lead
          </button>

          {/* Mobile Filters Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            ⚙️ {activeFiltersCount > 0 && <span className="ml-2">({activeFiltersCount})</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
