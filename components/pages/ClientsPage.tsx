'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Bilan360Wizard, { ClientPrefillData } from '@/components/clients/Bilan360Wizard'
import AddClientModal from '@/components/clients/AddClientModal'
import { Client } from '@/lib/types'

const FAMILY_STATUS_LABELS: Record<string, string> = {
  SINGLE: 'Célibataire',
  MARRIED: 'Marié(e)',
  PACS: 'Pacsé(e)',
  COHABITING: 'En concubinage',
  DIVORCED: 'Divorcé(e)',
  WIDOWED: 'Veuf/Veuve',
}

export default function ClientsPage({ user }: { user: any }) {
  const [showBilan360, setShowBilan360] = useState(false)
  const [bilan360ClientId, setBilan360ClientId] = useState<string | undefined>()
  const [bilan360BilanId, setBilan360BilanId] = useState<string | undefined>()
  const [bilan360ClientData, setBilan360ClientData] = useState<ClientPrefillData | undefined>()
  const [showAddClient, setShowAddClient] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientBilans, setClientBilans] = useState<any[]>([])
  const [loadingBilans, setLoadingBilans] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [detailTab, setDetailTab] = useState<'info' | 'bilans' | 'notes'>('info')
  const [currentPage, setCurrentPage] = useState(1)
  const CLIENTS_PER_PAGE = 10

  // Fetch bilans when a client is selected
  useEffect(() => {
    if (!selectedClient) {
      setClientBilans([])
      return
    }
    setLoadingBilans(true)
    const token = localStorage.getItem('token')
    fetch(`/api/bilan360?clientId=${selectedClient.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        // API now returns array of bilans
        setClientBilans(Array.isArray(data) ? data : data ? [data] : [])
      })
      .catch(() => setClientBilans([]))
      .finally(() => setLoadingBilans(false))
  }, [selectedClient])

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

  const startNewBilan360 = (client?: Client) => {
    setBilan360BilanId(undefined) // Force new bilan
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

  const openExistingBilan360 = (bilanId: string, client: Client) => {
    setBilan360BilanId(bilanId)
    setBilan360ClientId(client.id)
    setBilan360ClientData({
      firstName: client.firstName,
      lastName: client.lastName,
      familyStatus: client.familyStatus,
      childrenCount: client.childrenCount,
      dateOfBirth: client.dateOfBirth,
    })
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
            bilanId={bilan360BilanId}
            clientData={bilan360ClientData}
            clientName={bilan360ClientData ? `${bilan360ClientData.firstName} ${bilan360ClientData.lastName}` : undefined}
            onClose={() => {
              setShowBilan360(false)
              setBilan360ClientId(undefined)
              setBilan360BilanId(undefined)
              setBilan360ClientData(undefined)
            }}
          />
        </div>
      ) : selectedClient ? (
        /* Client detail view — redesigned */
        <div className="space-y-4">
          {/* Header card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedClient(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600 -ml-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-14 h-14 bg-[#00358E] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-white">
                    {selectedClient.firstName[0]}{selectedClient.lastName[0]}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </h3>
                    <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Actif</span>
                  </div>
                  {selectedClient.familyStatus && (
                    <p className="text-sm text-gray-500">{FAMILY_STATUS_LABELS[selectedClient.familyStatus] || selectedClient.familyStatus}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">Client depuis le {formatDate(selectedClient.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifier
                </button>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-xs text-gray-500">Enfants</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{selectedClient.childrenCount}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs text-gray-500">Contrats actifs</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-gray-500">Bilans 360°</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{clientBilans.length}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {selectedClient.phone && (
                <a
                  href={`tel:${selectedClient.phone}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Appeler
                </a>
              )}
              {selectedClient.email && (
                <a
                  href={`mailto:${selectedClient.email}`}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
              )}
              <button
                onClick={() => startNewBilan360(selectedClient)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Nouveau Bilan 360°
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6">
              <nav className="flex gap-6 -mb-px">
                {[
                  { key: 'info', label: 'Informations' },
                  { key: 'bilans', label: `Vue 360° (${clientBilans.length})` },
                  { key: 'notes', label: 'Notes' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setDetailTab(tab.key as any)}
                    className={`py-3.5 text-sm font-medium border-b-2 transition ${
                      detailTab === tab.key
                        ? 'border-[#00358E] text-[#00358E]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Informations tab */}
              {detailTab === 'info' && (
                      <div className="grid sm:grid-cols-2 gap-6">
                        {/* Coordonnées */}
                        <div className="border border-gray-200 rounded-xl p-5">
                          <h4 className="text-sm font-bold text-gray-900 mb-4">Coordonnées</h4>
                          <div className="space-y-3">
                            {selectedClient.email && (
                              <div className="flex items-center gap-3 text-sm">
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-700">{selectedClient.email}</span>
                              </div>
                            )}
                            {selectedClient.phone && (
                              <div className="flex items-center gap-3 text-sm">
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span className="text-gray-700">{selectedClient.phone}</span>
                              </div>
                            )}
                            {selectedClient.address && (
                              <div className="flex items-start gap-3 text-sm">
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div>
                                  <p className="text-gray-700">{selectedClient.address}</p>
                                  {(selectedClient.postalCode || selectedClient.city) && (
                                    <p className="text-gray-500">
                                      {selectedClient.postalCode}{selectedClient.postalCode && selectedClient.city ? ' ' : ''}{selectedClient.city}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            {!selectedClient.email && !selectedClient.phone && !selectedClient.address && (
                              <p className="text-sm text-gray-400 italic">Aucune information de contact</p>
                            )}
                          </div>
                        </div>

                        {/* Informations personnelles */}
                        <div className="border border-gray-200 rounded-xl p-5">
                          <h4 className="text-sm font-bold text-gray-900 mb-4">Informations personnelles</h4>
                          <div className="space-y-3">
                            {selectedClient.dateOfBirth && (
                              <div className="flex items-center gap-3 text-sm">
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-700">Né(e) le {formatDate(selectedClient.dateOfBirth)}</span>
                              </div>
                            )}
                            {selectedClient.familyStatus && (
                              <div className="flex items-center gap-3 text-sm">
                                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="text-gray-700">{FAMILY_STATUS_LABELS[selectedClient.familyStatus] || selectedClient.familyStatus}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                              <span className="text-gray-700">{selectedClient.childrenCount} enfant{selectedClient.childrenCount !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Vue 360° tab */}
                    {detailTab === 'bilans' && (
                      <div>
                        {loadingBilans ? (
                          <p className="text-sm text-gray-400">Chargement...</p>
                        ) : clientBilans.length > 0 ? (
                          <div className="space-y-2">
                            {clientBilans.map((bilan: any) => {
                              const isFinalized = bilan.status === 'FINALIZED'
                              const status = isFinalized ? 'Finalisé' : 'En cours'
                              const statusColor = isFinalized ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              const updatedAt = bilan.updatedAt || bilan.createdAt

                              return (
                                <div
                                  key={bilan.id}
                                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                                  onClick={() => openExistingBilan360(bilan.id, selectedClient)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <svg className="w-4 h-4 text-[#00358E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-900">Bilan 360°</p>
                                      <p className="text-xs text-gray-500">
                                        {bilan.createdByName && <span>Par {bilan.createdByName} — </span>}
                                        Dernière mise à jour : {formatDate(updatedAt)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColor}`}>
                                      {status}
                                    </span>
                                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                              <svg className="w-6 h-6 text-[#00358E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-600 font-medium mb-1">Aucun bilan 360° pour ce client</p>
                            <p className="text-xs text-gray-400 mb-3">Lancez une analyse complète de la situation du client</p>
                            <button
                              onClick={() => startNewBilan360(selectedClient)}
                              className="text-sm text-[#00358E] font-medium hover:underline"
                            >
                              Lancer un Bilan 360°
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes tab */}
                    {detailTab === 'notes' && (
                      <div>
                        {selectedClient.notes ? (
                          <div className="bg-gray-50 rounded-xl p-5">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedClient.notes}</p>
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-sm text-gray-400">Aucune note pour ce client</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Client list */}
          {clients.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-4">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-gray-900 flex-shrink-0">
                  Mes clients ({clients.length})
                </h3>
                <div className="relative max-w-xs w-full">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Rechercher un client..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              {(() => {
                const filteredClients = clients
                  .filter(client => {
                    if (!searchQuery.trim()) return true
                    const q = searchQuery.toLowerCase()
                    return (
                      client.firstName.toLowerCase().includes(q) ||
                      client.lastName.toLowerCase().includes(q) ||
                      (client.email && client.email.toLowerCase().includes(q)) ||
                      (client.phone && client.phone.includes(q)) ||
                      (client.city && client.city.toLowerCase().includes(q))
                    )
                  })
                  .sort((a, b) => {
                    const lastNameCmp = a.lastName.localeCompare(b.lastName, 'fr')
                    if (lastNameCmp !== 0) return lastNameCmp
                    return a.firstName.localeCompare(b.firstName, 'fr')
                  })

                const totalPages = Math.ceil(filteredClients.length / CLIENTS_PER_PAGE)
                const safePage = Math.min(currentPage, totalPages || 1)
                const paginatedClients = filteredClients.slice(
                  (safePage - 1) * CLIENTS_PER_PAGE,
                  safePage * CLIENTS_PER_PAGE
                )

                return (
                  <>
                    <div className="divide-y divide-gray-100">
                      {paginatedClients.map(client => (
                        <button
                          key={client.id}
                          onClick={() => { setSelectedClient(client); setDetailTab('info') }}
                          className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition text-left"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-blue-700">
                              {client.firstName[0]}{client.lastName[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {client.lastName} {client.firstName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {client.email || client.phone || 'Pas de contact'}
                              {client.city && ` — ${client.city}`}
                            </p>
                          </div>
                          <div className="hidden sm:block text-right flex-shrink-0">
                            <p className="text-xs text-gray-400">{client.dateOfBirth ? formatDate(client.dateOfBirth) : ''}</p>
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
                      {filteredClients.length === 0 && (
                        <div className="px-6 py-8 text-center">
                          <p className="text-sm text-gray-500">Aucun client trouvé pour &quot;{searchQuery}&quot;</p>
                        </div>
                      )}
                    </div>
                    {totalPages > 1 && (
                      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} — Page {safePage}/{totalPages}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={safePage <= 1}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            ← Précédent
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 text-xs font-medium rounded-lg transition ${
                                page === safePage
                                  ? 'bg-[#00358E] text-white'
                                  : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage >= totalPages}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                          >
                            Suivant →
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          )}

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
