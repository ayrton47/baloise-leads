'use client'

import BaloiseLogo from '@/components/BaloiseLogo'
import ThemeToggle from '@/components/ThemeToggle'

interface LeadsHeaderProps {
  userName: string
  onLogout: () => void
}

export default function LeadsHeader({ userName, onLogout }: LeadsHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-blue-50 dark:bg-blue-900 rounded-lg transition-colors">
            <BaloiseLogo />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Baloise Leads</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 transition-colors">Sales Pipeline Manager</p>
          </div>
        </div>

        {/* Actions & User Menu */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 dark:text-white transition-colors">{userName}</p>
            <button
              onClick={onLogout}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition mt-1 hover:underline"
            >
              Sign out
            </button>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}
