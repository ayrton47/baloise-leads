'use client'

import BaloiseLogo from '@/components/BaloiseLogo'

export type AppTab = 'leads' | 'tasks' | 'clients'

interface LeadsHeaderProps {
  userName: string
  agencyNumber?: string
  role?: string
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  onLogout: () => void
  onOpenProfile?: () => void
}

const tabs: { key: AppTab; label: string; icon: React.ReactNode }[] = [
  {
    key: 'tasks',
    label: 'Tâches',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: 'leads',
    label: 'Leads',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: 'clients',
    label: 'Clients',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export default function LeadsHeader({ userName, agencyNumber, role, activeTab, onTabChange, onLogout, onOpenProfile }: LeadsHeaderProps) {
  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  return (
    <header className="sticky top-0 z-50 bg-[#00358E] shadow-lg">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Top row: logo + right actions */}
        <div className="h-14 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <BaloiseLogo />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">
                Baloise Hub
              </h1>
              <p className="text-[11px] text-blue-200 mt-0.5 leading-none">
                Gestion d&apos;agence
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Agency badge */}
            {agencyNumber && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur">
                <svg className="w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-xs font-semibold text-white">Agence {agencyNumber}</span>
              </div>
            )}

            {/* Documentation button */}
            <a
              href="/Baloise_Lead_Manager_Guide_Utilisateur_v2.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 transition cursor-pointer"
              title="Guide utilisateur (PDF)"
            >
              <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="hidden sm:inline text-xs font-medium text-white">Guide</span>
            </a>

            {/* User info */}
            <div
              className="flex items-center gap-2.5 cursor-pointer hover:bg-white/10 rounded-xl px-2.5 py-1.5 -mx-2.5 transition"
              onClick={onOpenProfile}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 ring-2 ring-white/10">
                {initials}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-white leading-none">
                  {userName}
                </p>
                <p className="text-[11px] text-blue-200 mt-0.5 leading-none">
                  {role === 'RESPONSABLE' ? 'Responsable' : 'Employé'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex gap-1 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-[#00358E] shadow-sm'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
