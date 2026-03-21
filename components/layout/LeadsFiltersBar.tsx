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

interface LeadsFiltersBarProps {
  status: LeadStatus | 'ALL'
  product: ProductType | 'ALL'
  searchQuery: string
  onStatusChange: (status: LeadStatus | 'ALL') => void
  onProductChange: (product: ProductType | 'ALL') => void
  onSearchChange: (query: string) => void
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
  { value: 'QUOTED', label: 'Devis créé', dot: 'bg-emerald-500', activeBg: 'bg-emerald-600', activeText: 'text-white', countKey: 'quoted' },
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
]

export default function LeadsFiltersBar({
  status,
  product,
  searchQuery,
  onStatusChange,
  onProductChange,
  onSearchChange,
  onAddLead,
  stats,
}: LeadsFiltersBarProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-40 transition-colors shadow-sm">
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
              className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 pl-11 pr-9 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
                aria-label="Effacer la recherche"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
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
                      ? 'border-[#00358E] bg-[#00358E]/10 text-[#00358E] dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
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
