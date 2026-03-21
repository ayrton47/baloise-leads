'use client'

interface LeadsHeroSectionProps {
  stats: {
    new: number
    inProgress: number
    quoted: number
    refused: number
    converted?: number
    toContact?: number
    total?: number
  }
}

const kpiCards = [
  {
    key: 'new' as const,
    label: 'New',
    dot: 'bg-blue-500',
    numColor: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800',
    icon: (
      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    key: 'inProgress' as const,
    label: 'In Progress',
    dot: 'bg-amber-500',
    numColor: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-100 dark:border-amber-800',
    icon: (
      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'quoted' as const,
    label: 'Quoted',
    dot: 'bg-emerald-500',
    numColor: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-100 dark:border-emerald-800',
    icon: (
      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    key: 'refused' as const,
    label: 'Refused',
    dot: 'bg-red-500',
    numColor: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-100 dark:border-red-800',
    icon: (
      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
]

export default function LeadsHeroSection({ stats }: LeadsHeroSectionProps) {
  return (
    <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpiCards.map((card) => (
            <div
              key={card.key}
              className={`${card.bg} border ${card.border} rounded-xl px-4 py-3.5 flex items-center gap-3 transition-colors`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/60 dark:bg-white/10 flex-shrink-0`}>
                {card.icon}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {card.label}
                </p>
                <p className={`text-2xl font-bold ${card.numColor} leading-none mt-0.5`}>
                  {stats[card.key]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
