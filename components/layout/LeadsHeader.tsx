'use client'

import BaloiseLogo from '@/components/BaloiseLogo'

interface LeadsHeaderProps {
  userName: string
  agencyNumber?: string
  role?: string
  onLogout: () => void
  onOpenProfile?: () => void
}

export default function LeadsHeader({ userName, agencyNumber, role, onLogout, onOpenProfile }: LeadsHeaderProps) {
  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  return (
    <header className="sticky top-0 z-50 bg-[#00358E] shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
            <BaloiseLogo />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-none">
              Baloise Leads
            </h1>
            <p className="text-[11px] text-blue-200 mt-0.5 leading-none">
              Gestion des prospects
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
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
    </header>
  )
}
