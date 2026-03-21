'use client'

import BaloiseLogo from '@/components/BaloiseLogo'

interface LeadsHeaderProps {
  userName: string
  onLogout: () => void
}

export default function LeadsHeader({ userName, onLogout }: LeadsHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-lg">
            <BaloiseLogo />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Baloise Leads</h1>
            <p className="text-xs text-gray-500 mt-0.5">Sales Pipeline Manager</p>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{userName}</p>
            <button
              onClick={onLogout}
              className="text-xs text-gray-500 hover:text-gray-700 transition mt-1 hover:underline"
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
