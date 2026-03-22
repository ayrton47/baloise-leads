'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import BaloiseLogo from '@/components/BaloiseLogo'

export default function LoginPage({
  onLogin,
}: {
  onLogin: (token: string, user: any) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [agencyNumber, setAgencyNumber] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const data = isRegister
        ? { email, name, password, agencyNumber }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md border border-slate-200 transition-colors">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10">
            <BaloiseLogo />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 transition-colors">
            Baloise Leads
          </h1>
        </div>
        <p className="text-center text-slate-600 mb-8 text-sm transition-colors">
          Plateforme de suivi des opportunités commerciales
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 transition-colors">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 transition-colors">
                  Numéro d'agence
                </label>
                <input
                  type="text"
                  value={agencyNumber}
                  onChange={(e) => setAgencyNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
                  placeholder="AG-001"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 transition-colors">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
              placeholder="vous@exemple.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 transition-colors">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm transition-colors">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-900 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-950 disabled:opacity-50 transition"
          >
            {isLoading
              ? 'Connexion...'
              : isRegister
              ? 'Créer un compte'
              : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 pt-6">
          <p className="text-center text-slate-600 text-sm transition-colors">
            {isRegister
              ? 'Vous avez déjà un compte?'
              : 'Pas encore de compte?'}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
              }}
              className="text-blue-900 font-semibold hover:underline ml-1 transition"
            >
              {isRegister ? 'Se connecter' : "S'inscrire"}
            </button>
          </p>
        </div>

        <p className="text-xs text-slate-500 text-center mt-6 transition-colors">
          Données sécurisées • PostgreSQL • Chiffré en transit
        </p>
      </div>
    </div>
  )
}
