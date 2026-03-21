'use client'

import BaloiseLogo from '@/components/BaloiseLogo'
import ThemeToggle from '@/components/ThemeToggle'

interface LeadsHeaderProps {
  userName: string
  onLogout: () => void
}

export default function LeadsHeader({ userName, onLogout }: LeadsHeaderProps) {
  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?'

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-8 h-[72px] flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center bg-[#00358E] rounded-lg flex-shrink-0">
            <BaloiseLogo />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 dark:text-white leading-none transition-colors">
              Baloise Leads
            </h1>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 leading-none transition-colors">
              Sales Pipeline
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />

          {/* User info */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00358E] to-blue-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-800 dark:text-white leading-none transition-colors">
                {userName}
              </p>
              <button
                onClick={onLogout}
                className="text-[11px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition mt-0.5 leading-none hover:underline"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
