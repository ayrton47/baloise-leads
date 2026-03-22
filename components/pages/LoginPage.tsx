'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { motion } from 'framer-motion'

function BaloiseLogoBlue() {
  return (
    <svg viewBox="0 0 1511 1506" width="44" height="44" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" fill="#00358E" d="m780.3 5.8c-7.8-3.4-16.1-4.8-24.8-4.8-8.3 0-17 1.4-24.8 4.8-7.8 3.4-15 7.8-20.9 14.1l-690.4 687.9c-12.1 12.2-18.9 28.2-18.9 45.7 0 17 6.8 33.5 18.9 45.7l690.4 687.9c5.9 5.8 13.1 10.6 20.9 14 8.3 3 16.5 4.9 24.8 4.9 8.7 0 17-1.9 25.3-4.9 7.7-3.4 15-8.2 20.9-14l382.8-381.9-233.2-232.2-195.8 194.8-315.8-314.3 315.8-314.8 549 547 187.6-186.5c5.8-5.9 10.6-13.2 14-20.9 3.4-7.8 4.9-16.6 4.9-24.8 0-8.8-1.5-17-4.9-24.8-3.4-7.8-8.2-15.1-14-20.9l-690.4-687.9c-6.4-6.3-13.2-10.7-21.4-14.1z"/>
    </svg>
  )
}

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
    <div className="min-h-screen flex">
      {/* Left — Background image */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=1920&q=80"
          alt="Modern glass office building at night"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00358E]/80 via-[#00358E]/60 to-[#001f55]/80" />

        {/* Content on image */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Top — Logo */}
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 1511 1506" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" fill="#ffffff" d="m780.3 5.8c-7.8-3.4-16.1-4.8-24.8-4.8-8.3 0-17 1.4-24.8 4.8-7.8 3.4-15 7.8-20.9 14.1l-690.4 687.9c-12.1 12.2-18.9 28.2-18.9 45.7 0 17 6.8 33.5 18.9 45.7l690.4 687.9c5.9 5.8 13.1 10.6 20.9 14 8.3 3 16.5 4.9 24.8 4.9 8.7 0 17-1.9 25.3-4.9 7.7-3.4 15-8.2 20.9-14l382.8-381.9-233.2-232.2-195.8 194.8-315.8-314.3 315.8-314.8 549 547 187.6-186.5c5.8-5.9 10.6-13.2 14-20.9 3.4-7.8 4.9-16.6 4.9-24.8 0-8.8-1.5-17-4.9-24.8-3.4-7.8-8.2-15.1-14-20.9l-690.4-687.9c-6.4-6.3-13.2-10.7-21.4-14.1z"/>
            </svg>
            <span className="text-white font-bold text-xl tracking-tight">Bâloise Assurances</span>
          </div>

          {/* Bottom — Tagline */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl font-extrabold text-white leading-tight max-w-lg"
            >
              Gérez vos leads.
              <br />
              <span className="text-blue-200">Convertissez plus.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-blue-100/80 mt-4 text-lg max-w-md"
            >
              Plateforme de suivi des opportunités commerciales pour les agents Bâloise Luxembourg.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Logo + Title (visible always, especially on mobile) */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <BaloiseLogoBlue />
            <h1 className="text-3xl font-extrabold text-[#00358E]">
              Baloise Leads
            </h1>
          </div>
          <p className="text-center text-gray-500 mb-10 text-sm">
            {isRegister ? 'Créer votre compte agent' : 'Connectez-vous à votre espace'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00358E] focus:border-[#00358E] transition text-sm"
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Numéro d'agence
                  </label>
                  <input
                    type="text"
                    value={agencyNumber}
                    onChange={(e) => setAgencyNumber(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00358E] focus:border-[#00358E] transition text-sm"
                    placeholder="001"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00358E] focus:border-[#00358E] transition text-sm"
                placeholder="vous@exemple.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00358E] focus:border-[#00358E] transition text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#00358E] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#00266b] disabled:opacity-50 transition shadow-lg shadow-[#00358E]/20"
            >
              {isLoading
                ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connexion...
                  </span>
                )
                : isRegister
                ? 'Créer mon compte'
                : 'Se connecter'}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {isRegister
                ? 'Vous avez déjà un compte ?'
                : 'Pas encore de compte ?'}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister)
                  setError('')
                }}
                className="text-[#00358E] font-bold hover:underline ml-1 transition"
              >
                {isRegister ? 'Se connecter' : "S'inscrire"}
              </button>
            </p>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Chiffré SSL
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>PostgreSQL</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span>RGPD</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
