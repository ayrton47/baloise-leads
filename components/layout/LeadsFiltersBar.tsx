'use client'

import { LeadStatus, ProductType } from '@/lib/types'

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
  activeClass: string
  countKey: keyof LeadsFiltersBarStats
}

const statusOptions: StatusOption[] = [
  { value: 'ALL', label: 'All', dot: 'bg-gray-400', activeClass: 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent', countKey: 'total' },
  { value: 'NEW', label: 'New', dot: 'bg-blue-500', activeClass: 'bg-blue-600 text-white border-transparent', countKey: 'new' },
  { value: 'IN_PROGRESS', label: 'In Progress', dot: 'bg-amber-500', activeClass: 'bg-amber-500 text-white border-transparent', countKey: 'inProgress' },
  { value: 'TO_CONTACT', label: 'To Contact', dot: 'bg-yellow-500', activeClass: 'bg-yellow-500 text-white border-transparent', countKey: 'toContact' },
  { value: 'QUOTED', label: 'Quoted', dot: 'bg-emerald-500', activeClass: 'bg-emerald-600 text-white border-transparent', countKey: 'quoted' },
  { value: 'REFUSED', label: 'Refused', dot: 'bg-red-500', activeClass: 'bg-red-600 text-white border-transparent', countKey: 'refused' },
  { value: 'CONVERTED', label: 'Converted', dot: 'bg-purple-500', activeClass: 'bg-purple-600 text-white border-transparent', countKey: 'converted' },
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
    <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-[72px] z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-8">

        {/* Top row: Search + Product + CTA */}
        <div className="flex items-center gap-3 py-3.5 border-b border-gray-50 dark:border-gray-800/80">
          {/* Search */}
          <div className="relative w-72">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, phone…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pl-9 pr-8 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition rounded"
                aria-label="Clear search"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Product filter */}
          <div className="relative">
            <select
              value={product}
              onChange={(e) => onProductChange(e.target.value as ProductType | 'ALL')}
              className={`appearance-none border rounded-lg px-3.5 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer ${
                product !== 'ALL'
                  ? 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-600 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <option value="ALL">All Products</option>
              <option value="DRIVE">Drive Insurance</option>
              <option value="HOME">Home Insurance</option>
              <option value="PENSION_PLAN">Pension Plan</option>
            </select>
            <svg
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          <div className="flex-1" />

          {/* Add Lead CTA */}
          <button
            onClick={onAddLead}
            className="flex items-center gap-2 bg-[#00358E] hover:bg-[#00266b] active:bg-[#001f55] text-white px-4 py-2 rounded-lg font-semibold text-sm transition shadow-sm hover:shadow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Lead
          </button>
        </div>

        {/* Bottom row: Status pill chips */}
        <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto scrollbar-none">
          {statusOptions.map((opt) => {
            const count = stats ? stats[opt.countKey] : undefined
            const isActive = status === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onStatusChange(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                  isActive
                    ? `${opt.activeClass} shadow-sm`
                    : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                {!isActive && (
                  <span className={`w-1.5 h-1.5 rounded-full ${opt.dot} flex-shrink-0`} />
                )}
                <span>{opt.label}</span>
                {count !== undefined && (
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      isActive ? 'opacity-75' : 'text-gray-400 dark:text-gray-500'
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
