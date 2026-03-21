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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 dark:from-gray-950 to-slate-100 dark:to-gray-900 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md border border-slate-200 dark:border-gray-700 transition-colors">
        <h1 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-white transition-colors">
          🎯 Baloise Leads
        </h1>
        <p className="text-center text-slate-600 dark:text-gray-400 mb-8 text-sm transition-colors">
          Plateforme de suivi des opportunités commerciales
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2 transition-colors">
                Nom complet
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
                placeholder="Jean Dupont"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2 transition-colors">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
              placeholder="vous@exemple.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-2 transition-colors">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg text-sm transition-colors">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-900 dark:bg-blue-700 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-950 dark:hover:bg-blue-800 disabled:opacity-50 transition"
          >
            {isLoading
              ? 'Connexion...'
              : isRegister
              ? 'Créer un compte'
              : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-200 dark:border-gray-700 pt-6">
          <p className="text-center text-slate-600 dark:text-gray-400 text-sm transition-colors">
            {isRegister
              ? 'Vous avez déjà un compte?'
              : 'Pas encore de compte?'}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
              }}
              className="text-blue-900 dark:text-blue-400 font-semibold hover:underline ml-1 transition"
            >
              {isRegister ? 'Se connecter' : "S'inscrire"}
            </button>
          </p>
        </div>

        <p className="text-xs text-slate-500 dark:text-gray-500 text-center mt-6 transition-colors">
          Données sécurisées • PostgreSQL • Chiffré en transit
        </p>
      </div>
    </div>
  )
}
