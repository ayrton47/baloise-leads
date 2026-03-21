'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

interface ProfileModalProps {
  user: { id: string; email: string; name: string }
  onClose: () => void
  onUpdate: (token: string, user: any) => void
  onLogout?: () => void
}

export default function ProfileModal({ user, onClose, onUpdate, onLogout }: ProfileModalProps) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordSection, setShowPasswordSection] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!name.trim() || !email.trim()) {
      setError('Nom et email sont requis')
      return
    }

    if (showPasswordSection && newPassword) {
      if (!currentPassword) {
        setError('Entrez votre mot de passe actuel')
        return
      }
      if (newPassword.length < 6) {
        setError('Le nouveau mot de passe doit contenir au moins 6 caractères')
        return
      }
      if (newPassword !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        return
      }
    }

    setIsLoading(true)
    try {
      const payload: Record<string, string> = { name: name.trim(), email: email.trim() }
      if (showPasswordSection && newPassword) {
        payload.currentPassword = currentPassword
        payload.newPassword = newPassword
      }
      const response = await api.put('/auth/profile', payload)
      onUpdate(response.data.token, response.data.agent)
      setSuccess('Profil mis à jour avec succès')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordSection(false)
      setTimeout(() => onClose(), 1200)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Mon profil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Nom complet
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Password section toggle */}
          {!showPasswordSection ? (
            <button
              type="button"
              onClick={() => setShowPasswordSection(true)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Modifier le mot de passe
            </button>
          ) : (
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Changer le mot de passe
              </p>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Mot de passe actuel"
                className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le nouveau mot de passe"
                className="w-full border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => {
                  setShowPasswordSection(false)
                  setCurrentPassword('')
                  setNewPassword('')
                  setConfirmPassword('')
                }}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:underline"
              >
                Annuler le changement de mot de passe
              </button>
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-700">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-700">
              {success}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#00358E] hover:bg-[#00266b] text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-50 transition shadow-md"
            >
              {isLoading ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              Annuler
            </button>
          </div>

          {/* Logout */}
          {onLogout && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onLogout}
                className="w-full text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium hover:underline transition"
              >
                Se déconnecter
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
