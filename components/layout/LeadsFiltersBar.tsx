'use client'

import { LeadStatus, ProductType } from '@/lib/types'
import DriveIcon from '@/components/icons/DriveIcon'
import HomeIcon from '@/components/icons/HomeIcon'
import PensionIcon from '@/components/icons/PensionIcon'
import { ReactNode } from 'react'

interface LeadsFiltersBarStats {
  new: number
  inProgress: number
  toContact: number
  quoted: number
  refused: number
  converted: number
  total: number
}

export type DateRange = '7d' | '30d' | '90d' | '6m' | '1y' | 'ALL'

interface LeadsFiltersBarProps {
  status: LeadStatus | 'ALL'
  product: ProductType | 'ALL'
  searchQuery: string
  dateRange: DateRange
  onStatusChange: (status: LeadStatus | 'ALL') => void
  onProductChange: (product: ProductType | 'ALL') => void
  onSearchChange: (query: string) => void
  onDateRangeChange: (range: DateRange) => void
  onAddLead: () => void
  activeFiltersCount: number
  stats?: LeadsFiltersBarStats
}

type StatusOption = {
  value: LeadStatus | 'ALL'
  label: string
  dot: string
  activeBg: string
  activeText: string
  countKey: keyof LeadsFiltersBarStats
}

const statusOptions: StatusOption[] = [
  { value: 'ALL', label: 'Tous', dot: 'bg-gray-400', activeBg: 'bg-gray-800', activeText: 'text-white', countKey: 'total' },
  { value: 'NEW', label: 'Nouveaux', dot: 'bg-blue-500', activeBg: 'bg-blue-600', activeText: 'text-white', countKey: 'new' },
  { value: 'IN_PROGRESS', label: 'En cours', dot: 'bg-amber-500', activeBg: 'bg-amber-500', activeText: 'text-white', countKey: 'inProgress' },
  { value: 'TO_CONTACT', label: 'À contacter', dot: 'bg-yellow-500', activeBg: 'bg-yellow-500', activeText: 'text-white', countKey: 'toContact' },
  { value: 'REFUSED', label: 'Refusés', dot: 'bg-red-500', activeBg: 'bg-red-500', activeText: 'text-white', countKey: 'refused' },
  { value: 'CONVERTED', label: 'Convertis', dot: 'bg-purple-500', activeBg: 'bg-purple-600', activeText: 'text-white', countKey: 'converted' },
]

type ProductOption = {
  value: ProductType | 'ALL'
  label: string
  icon: ReactNode
}

const productOptions: ProductOption[] = [
  { value: 'ALL', label: 'Tous les produits', icon: <span className="text-base">📦</span> },
  { value: 'DRIVE', label: 'Drive', icon: <DriveIcon size={18} /> },
  { value: 'HOME', label: 'Home', icon: <HomeIcon size={18} /> },
  { value: 'PENSION_PLAN', label: 'Pension Plan', icon: <PensionIcon size={18} /> },
  { value: 'OTHER', label: 'Autre', icon: <span className="text-base">📋</span> },
]

const dateRangeOptions: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '1 mois' },
  { value: '90d', label: '3 mois' },
  { value: '6m', label: '6 mois' },
  { value: '1y', label: '1 an' },
  { value: 'ALL', label: 'Tout' },
]

export default function LeadsFiltersBar({
  status,
  product,
  searchQuery,
  dateRange,
  onStatusChange,
  onProductChange,
  onSearchChange,
  onDateRangeChange,
  onAddLead,
  stats,
}: LeadsFiltersBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">

        {/* Top row: Search + Product pills + CTA */}
        <div className="flex items-center gap-4 py-4">
          {/* Search */}
          <div className="relative w-80">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher par nom, email, téléphone…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 pl-11 pr-9 text-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 transition rounded-full hover:bg-gray-200"
                aria-label="Effacer la recherche"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Date range filter */}
          <div className="relative flex-shrink-0">
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
              className={`appearance-none border-2 rounded-xl px-3 py-2.5 pr-8 text-sm font-semibold cursor-pointer transition-all ${
                dateRange !== '30d'
                  ? 'border-[#00358E] bg-[#00358E]/10 text-[#00358E]'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
              }`}
            >
              {dateRangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Product pills */}
          <div className="flex items-center gap-2">
            {productOptions.map((opt) => {
              const isActive = product === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => onProductChange(opt.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border-2 ${
                    isActive
                      ? 'border-[#00358E] bg-[#00358E]/10 text-[#00358E] shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>

          <div className="flex-1" />

          {/* Add Lead CTA */}
          <button
            onClick={onAddLead}
            className="flex items-center gap-2 bg-[#00358E] hover:bg-[#00266b] active:bg-[#001f55] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un lead
          </button>
        </div>

        {/* Bottom row: Status filter chips */}
        <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-none">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 flex-shrink-0">
            Statut
          </span>
          {statusOptions.map((opt) => {
            const count = stats ? stats[opt.countKey] : undefined
            const isActive = status === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onStatusChange(opt.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border-2 ${
                  isActive
                    ? `${opt.activeBg} ${opt.activeText} border-transparent shadow-md`
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {!isActive && (
                  <span className={`w-2.5 h-2.5 rounded-full ${opt.dot} flex-shrink-0`} />
                )}
                <span>{opt.label}</span>
                {count !== undefined && (
                  <span
                    className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-white/25'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
