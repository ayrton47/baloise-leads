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
    label: 'Nouveaux',
    numColor: 'text-blue-600',
    bg: 'from-blue-50 to-blue-100/50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    ring: 'ring-blue-200/50',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    key: 'inProgress' as const,
    label: 'En cours',
    numColor: 'text-amber-600',
    bg: 'from-amber-50 to-amber-100/50',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    ring: 'ring-amber-200/50',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'quoted' as const,
    label: 'Devis créé',
    numColor: 'text-emerald-600',
    bg: 'from-emerald-50 to-emerald-100/50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    ring: 'ring-emerald-200/50',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'refused' as const,
    label: 'Refusés',
    numColor: 'text-red-500',
    bg: 'from-red-50 to-red-100/50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    ring: 'ring-red-200/50',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
]

export default function LeadsHeroSection({ stats }: LeadsHeroSectionProps) {
  return (
    <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((card) => (
            <div
              key={card.key}
              className={`bg-gradient-to-br ${card.bg} rounded-2xl px-5 py-4 flex items-center gap-4 ring-1 ${card.ring} transition-all hover:shadow-md`}
            >
              <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0 ${card.iconColor}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className={`text-3xl font-extrabold ${card.numColor} leading-none mt-1`}>
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
