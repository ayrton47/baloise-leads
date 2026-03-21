'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import {
  BalButton,
  BalButtonGroup,
  BalCard,
  BalField,
  BalFieldGroup,
  BalForm,
  BalFormGroup,
  BalHeading,
  BalInput,
  BalText,
} from 'baloise-design-system'
import 'baloise-design-system/css'

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <BalCard>
        <div style={{ padding: '2rem', width: '100%', maxWidth: '400px' }}>
          <BalHeading level="1" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
            🎯 Baloise Leads
          </BalHeading>
          <BalText style={{ textAlign: 'center', marginBottom: '2rem', opacity: 0.7 }}>
            Plateforme de suivi des opportunités commerciales
          </BalText>

          <BalForm onSubmit={handleSubmit}>
            <BalFormGroup>
              {isRegister && (
                <BalField>
                  <BalInput
                    type="text"
                    value={name}
                    onChange={(e: any) => setName(e.target.value)}
                    placeholder="Jean Dupont"
                    label="Nom complet"
                    required
                  />
                </BalField>
              )}

              <BalField>
                <BalInput
                  type="email"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  label="Email"
                  required
                />
              </BalField>

              <BalField>
                <BalInput
                  type="password"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  label="Mot de passe"
                  required
                />
              </BalField>

              {error && (
                <div style={{ background: '#fee', border: '1px solid #f99', color: '#c00', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <BalButton
                type="submit"
                disabled={isLoading}
                style={{ width: '100%' }}
              >
                {isLoading ? 'Chargement...' : isRegister ? 'Créer un compte' : 'Se connecter'}
              </BalButton>
            </BalFormGroup>
          </BalForm>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
            <BalText>
              {isRegister ? 'Déjà inscrit ?' : 'Pas encore inscrit ?'}{' '}
              <BalButton
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister)
                  setError('')
                }}
                is-text
                style={{ padding: 0, color: '#0066cc' }}
              >
                {isRegister ? 'Se connecter' : "Créer un compte"}
              </BalButton>
            </BalText>
          </div>
        </div>
      </BalCard>
    </div>
  )
}
