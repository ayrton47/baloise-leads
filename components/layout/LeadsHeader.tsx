'use client'

import BaloiseLogo from '@/components/BaloiseLogo'
import ThemeToggle from '@/components/ThemeToggle'

interface LeadsHeaderProps {
  userName: string
  onLogout: () => void
  onOpenProfile?: () => void
}

export default function LeadsHeader({ userName, onLogout, onOpenProfile }: LeadsHeaderProps) {
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
          <div className="w-9 h-9 flex items-center justify-center bg-white/15 backdrop-blur rounded-lg flex-shrink-0">
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
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="h-5 w-px bg-white/20" />

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
                Mon profil
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
