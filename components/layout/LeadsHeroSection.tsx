'use client'

import { motion } from 'framer-motion'

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
    key: 'toContact' as const,
    label: 'À contacter',
    numColor: 'text-yellow-600',
    bg: 'from-yellow-50 to-yellow-100/50',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    ring: 'ring-yellow-200/50',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
    <section className="bg-white border-b border-gray-100 transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, delay: i * 0.08, ease: 'easeOut' }}
              whileHover={{ y: -2, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.1)' }}
              className={`bg-gradient-to-br ${card.bg} rounded-2xl px-5 py-4 flex items-center gap-4 ring-1 ${card.ring} transition-all`}
            >
              <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0 ${card.iconColor}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <motion.p
                  key={stats[card.key]}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`text-3xl font-extrabold ${card.numColor} leading-none mt-1`}
                >
                  {stats[card.key]}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
