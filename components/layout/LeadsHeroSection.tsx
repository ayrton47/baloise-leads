'use client'

interface LeadsHeroSectionProps {
  stats: {
    new: number
    inProgress: number
    quoted: number
    refused: number
  }
}

export default function LeadsHeroSection({ stats }: LeadsHeroSectionProps) {
  return (
    <section className="bg-gradient-to-r from-blue-900 to-blue-800 text-white px-8 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Title & Description */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold mb-3">Manage Your Sales Pipeline</h2>
          <p className="text-blue-100 text-lg max-w-2xl">
            Track, qualify, and convert leads faster with smart insights and actionable data.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'New Leads', value: stats.new, color: 'bg-blue-500/30', icon: '✨' },
            { label: 'In Progress', value: stats.inProgress, color: 'bg-orange-500/30', icon: '⏳' },
            { label: 'Quoted', value: stats.quoted, color: 'bg-green-500/30', icon: '📋' },
            { label: 'Refused', value: stats.refused, color: 'bg-red-500/30', icon: '❌' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.color} rounded-lg p-5 backdrop-blur-sm border border-blue-400/20`}
            >
              <p className="text-3xl mb-1">{stat.icon}</p>
              <p className="text-blue-100 text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
