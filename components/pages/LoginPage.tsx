'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

export default function LoginPage({
  onLogin,
}: {
  onLogin: (token: string, user: any) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const data = isRegister
        ? { email, name, password }
        : { email, password }

      const response = await api.post(endpoint, data)
      onLogin(response.data.token, response.data.agent)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-slate-200">
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-900">
          🎯 Baloise Leads
        </h1>
        <p className="text-center text-slate-600 mb-8 text-sm">
          Plateforme de suivi des opportunités commerciales
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Jean Dupont"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isLoading ? '⏳ Chargement...' : isRegister ? '✅ Créer un compte' : '🔓 Se connecter'}
          </button>
        </form>

        <div className="mt-7 text-center text-sm border-t border-slate-200 pt-6">
          <p className="text-slate-600">
            {isRegister ? 'Déjà inscrit ?' : 'Pas encore inscrit ?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
              }}
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition"
            >
              {isRegister ? 'Se connecter' : "Créer un compte"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
