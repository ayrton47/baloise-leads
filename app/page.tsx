'use client'

import { useEffect, useState } from 'react'
import LoginPage from '@/components/pages/LoginPage'
import LeadsPage from '@/components/pages/LeadsPage'
import { AuthContext } from '@/lib/context'

export default function Home() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const savedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
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
        <LeadsPage user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </AuthContext.Provider>
  )
}
