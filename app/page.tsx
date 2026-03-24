'use client'

import { useEffect, useState } from 'react'
import LoginPage from '@/components/pages/LoginPage'
import LeadsPage from '@/components/pages/LeadsPageV2'
import TasksPage from '@/components/pages/TasksPage'
import ClientsPage from '@/components/pages/ClientsPage'
import LeadsHeader, { AppTab } from '@/components/layout/LeadsHeader'
import ProfileModal from '@/components/ProfileModal'
import { AuthContext } from '@/lib/context'

export default function Home() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<AppTab>('tasks')
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [navigateToLeadId, setNavigateToLeadId] = useState<string | null>(null)
  const [navigateToTaskId, setNavigateToTaskId] = useState<string | null>(null)

  const handleNavigateToLead = (leadId: string) => {
    setNavigateToLeadId(leadId)
    setActiveTab('leads')
  }

  const handleNavigateToTask = (taskId: string) => {
    setNavigateToTaskId(taskId)
    setActiveTab('tasks')
  }

  useEffect(() => {
    // Load from localStorage
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        // Invalid JSON in localStorage, clear it
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (newToken: string, newUser: any) => {
    setToken(newToken)
    setUser(newUser)
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(newUser))
    }
  }

  const handleLogout = () => {
    setToken(null)
    setUser(null)
    setActiveTab('leads')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
  }

  return (
    <AuthContext.Provider value={{ token, user, handleLogin, handleLogout }}>
      {token ? (
        <div className="min-h-screen bg-gray-50">
          <LeadsHeader
            userName={user?.name}
            agencyNumber={user?.agencyNumber}
            role={user?.role}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onLogout={handleLogout}
            onOpenProfile={() => setShowProfileModal(true)}
          />

          {activeTab === 'leads' && (
            <LeadsPage
              user={user}
              onLogout={handleLogout}
              onUpdateUser={handleLogin}
              navigateToLeadId={navigateToLeadId}
              onClearNavigateToLead={() => setNavigateToLeadId(null)}
              onNavigateToTask={handleNavigateToTask}
            />
          )}
          {activeTab === 'tasks' && (
            <TasksPage
              user={user}
              navigateToTaskId={navigateToTaskId}
              onClearNavigateToTask={() => setNavigateToTaskId(null)}
              onNavigateToLead={handleNavigateToLead}
            />
          )}
          {activeTab === 'clients' && (
            <ClientsPage user={user} />
          )}

          {/* Profile Modal */}
          {showProfileModal && user && (
            <ProfileModal
              user={user}
              onClose={() => setShowProfileModal(false)}
              onUpdate={(token, updatedUser) => {
                handleLogin(token, updatedUser)
              }}
              onLogout={handleLogout}
            />
          )}
        </div>
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </AuthContext.Provider>
  )
}
