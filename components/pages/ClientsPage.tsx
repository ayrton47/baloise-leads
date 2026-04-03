'use client'

import { useState, useEffect, useCallback } from 'react'
import Bilan360Wizard, { ClientPrefillData } from '@/components/clients/Bilan360Wizard'
import AddClientModal from '@/components/clients/AddClientModal'
import { Client } from '@/lib/types'

const FAMILY_STATUS_LABELS: Record<string, string> = {
  SINGLE: 'Célibataire',
  MARRIED: 'Marié(e)',
  COHABITING: 'En concubinage',
  DIVORCED: 'Divorcé(e)',
  WIDOWED: 'Veuf/Veuve',
}

export default function ClientsPage({ user }: { user: any }) {
  const [showBilan360, setShowBilan360] = useState(false)
  const [bilan360ClientId, setBilan360ClientId] = useState<string | undefined>()
  const [bilan360ClientData, setBilan360ClientData] = useState<ClientPrefillData | undefined>()
  const [showAddClient, setShowAddClient] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const fetchClients = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleClientCreated = () => {
    setShowAddClient(false)
    fetchClients()
  }

  const startBilan360 = (client?: Client) => {
    if (client) {
      setBilan360ClientId(client.id)
      setBilan360ClientData({
        firstName: client.firstName,
        lastName: client.lastName,
        familyStatus: client.familyStatus,
        childrenCount: client.childrenCount,
        dateOfBirth: client.dateOfBirth,
      })
    } else {
      setBilan360ClientId(undefined)
      setBilan360ClientData(undefined)
    }
    setShowBilan360(true)
    setSelectedClient(null)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Clients</h2>
          <p className="text-sm text-gray-500 mt-0.5">Bilan 360° de vos clients</p>
        </div>
        <button
          onClick={() => setShowAddClient(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00358E] text-white rounded-xl font-medium text-sm hover:bg-[#002a70] transition shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Nouveau client</span>
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-blue-700 uppercase">Clients</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{clients.length}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-green-700 uppercase">Contrats actifs</span>
          </div>
          <p className="text-2xl font-bold text-green-900">0</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-amber-700 uppercase">Renouvellements</span>
          </div>
          <p className="text-2xl font-bold text-amber-900">0</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xs font-medium text-purple-700 uppercase">Cross-sell</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">0</p>
        </div>
      </div>

      {/* Bilan 360° section */}
      {showBilan360 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <Bilan360Wizard
            clientId={bilan360ClientId}
            clientData={bilan360ClientData}
            clientName={bilan360ClientData ? `${bilan360ClientData.firstName} ${bilan360ClientData.lastName}` : undefined}
            onClose={() => {
              setShowBilan360(false)
              setBilan360ClientId(undefined)
              setBilan360ClientData(undefined)
            }}
          />
        </div>
      ) : selectedClient ? (
        /* Client detail view */
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          {/* Detail header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedClient(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedClient.firstName} {selectedClient.lastName}
                </h3>
                <p className="text-xs text-gray-500">
                  Client depuis le {formatDate(selectedClient.createdAt)}
                </p>
              </div>
            </div>
            <button
              onClick={() => startBilan360(selectedClient)}
              className="flex items-center gap-2 px-4 py-2 bg-[#00358E] text-white rounded-xl text-sm font-medium hover:bg-[#002a70] transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Bilan 360°
            </button>
          </div>

          <div className="p-6 grid sm:grid-cols-2 gap-6">
            {/* Contact */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contact</p>
              <div className="space-y-2">
                {selectedClient.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{selectedClient.email}</span>
                  </div>
                )}
                {selectedClient.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700">{selectedClient.phone}</span>
                  </div>
                )}
                {selectedClient.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">
                      {selectedClient.address}
                      {selectedClient.postalCode && `, ${selectedClient.postalCode}`}
                      {selectedClient.city && ` ${selectedClient.city}`}
                    </span>
                  </div>
                )}
                {!selectedClient.email && !selectedClient.phone && !selectedClient.address && (
                  <p className="text-sm text-gray-400 italic">Aucune information de contact</p>
                )}
              </div>
            </div>

            {/* Situation personnelle */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Situation personnelle</p>
              <div className="space-y-2">
                {selectedClient.dateOfBirth && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">{formatDate(selectedClient.dateOfBirth)}</span>
                  </div>
                )}
                {selectedClient.familyStatus && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-gray-700">{FAMILY_STATUS_LABELS[selectedClient.familyStatus] || selectedClient.familyStatus}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-gray-700">{selectedClient.childrenCount} enfant{selectedClient.childrenCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedClient.notes && (
              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Notes</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4">{selectedClient.notes}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Client list */}
          {clients.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-4">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">
                  Mes clients ({clients.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {clients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition text-left"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-700">
                        {client.firstName[0]}{client.lastName[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {client.firstName} {client.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {client.email || client.phone || 'Pas de contact'}
                        {client.city && ` — ${client.city}`}
                      </p>
                    </div>
                    <div className="hidden sm:block text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">{formatDate(client.createdAt)}</p>
                      {client.familyStatus && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {FAMILY_STATUS_LABELS[client.familyStatus]}
                        </p>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* CTA Card — Bilan 360° */}
          <div className="bg-gradient-to-br from-[#00358E] to-[#0052D4] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold mb-1">Analyse de la situation client</h3>
                  <p className="text-blue-100 text-sm leading-relaxed mb-4">
                    Lancez un bilan 360° pour analyser les besoins de votre client, identifier les risques
                    et recommander les meilleures couvertures d&apos;assurance.
                  </p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    {[
                      { icon: '👤', label: 'Situation' },
                      { icon: '⚠️', label: 'Risques' },
                      { icon: '🛡️', label: 'Couvertures' },
                      { icon: '📋', label: 'Synthèse' },
                    ].map((step) => (
                      <div key={step.label} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/10 backdrop-blur rounded-lg text-xs">
                        <span>{step.icon}</span>
                        <span>{step.label}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => startBilan360()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#00358E] font-semibold text-sm rounded-xl hover:bg-blue-50 hover:shadow-lg transition-all duration-200"
                  >
                    Commencer le Bilan 360°
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Empty state when no clients */}
          {clients.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-600">Aucun client pour le moment</p>
              <p className="text-xs text-gray-400 mt-1">Cliquez sur &quot;Nouveau client&quot; pour en ajouter un</p>
            </div>
          )}

          {/* Feature hints */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Fiche client</h4>
                <p className="text-xs text-gray-500 mt-0.5">Informations personnelles et contact</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Portefeuille</h4>
                <p className="text-xs text-gray-500 mt-0.5">Contrats actifs et historique</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Cross-sell</h4>
                <p className="text-xs text-gray-500 mt-0.5">Opportunités de ventes additionnelles</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add client modal */}
      {showAddClient && (
        <AddClientModal
          onClose={() => setShowAddClient(false)}
          onCreated={handleClientCreated}
        />
      )}
    </div>
  )
}
