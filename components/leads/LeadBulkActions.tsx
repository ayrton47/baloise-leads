'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { Lead, Agent } from '@/lib/types'

interface LeadBulkActionsProps {
  selectedLeadIds: Set<string>
  leads: Lead[]
  onActionComplete: () => void
  onClearSelection: () => void
  currentUserRole?: string
}

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText: string
  isDangerous?: boolean
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-white font-semibold transition ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700 disabled:opacity-50'
                : 'bg-[#00358E] hover:bg-[#00266b] disabled:opacity-50'
            }`}
          >
            {isLoading ? 'En cours…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-20 right-4 px-4 py-3 rounded-xl text-white font-medium shadow-lg z-50 ${
        type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
      }`}
    >
      {message}
    </div>
  )
}

export default function LeadBulkActions({
  selectedLeadIds,
  leads,
  onActionComplete,
  onClearSelection,
  currentUserRole,
}: LeadBulkActionsProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'refuse' | 'delete' | null
  }>({ isOpen: false, type: null })
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showAssignMenu, setShowAssignMenu] = useState(false)
  const [agencyAgents, setAgencyAgents] = useState<Agent[]>([])
  const [isAssigning, setIsAssigning] = useState(false)
  const assignMenuRef = useRef<HTMLDivElement>(null)

  const isResponsable = currentUserRole === 'RESPONSABLE'
  const selectedCount = selectedLeadIds.size

  // Fetch agents when assign menu is opened
  useEffect(() => {
    if (showAssignMenu && isResponsable && agencyAgents.length === 0) {
      api.get('/agents/agency').then((res) => setAgencyAgents(res.data)).catch(() => {})
    }
  }, [showAssignMenu, isResponsable])

  // Close assign menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (assignMenuRef.current && !assignMenuRef.current.contains(e.target as Node)) {
        setShowAssignMenu(false)
      }
    }
    if (showAssignMenu) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showAssignMenu])

  const handleBulkAssign = async (agentId: string, agentName: string) => {
    setIsAssigning(true)
    try {
      await Promise.all(
        Array.from(selectedLeadIds).map((leadId) =>
          api.patch(`/leads/${leadId}/assign`, { agentId })
        )
      )
      setToast({
        message: `${selectedCount} lead${selectedCount > 1 ? 's' : ''} attribué${selectedCount > 1 ? 's' : ''} à ${agentName}`,
        type: 'success',
      })
      setShowAssignMenu(false)
      onClearSelection()
      onActionComplete()
      setTimeout(() => setToast(null), 3000)
    } catch {
      setToast({ message: 'Erreur lors de l\'attribution', type: 'error' })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setIsAssigning(false)
    }
  }

  const handleBulkRefuse = async () => {
    setIsProcessing(true)
    try {
      await Promise.all(
        Array.from(selectedLeadIds).map((leadId) =>
          api.post(`/leads/${leadId}/refuse`, {
            refusalReason: 'OTHER',
            refusalNote: 'Refus groupé',
          })
        )
      )

      setToast({
        message: `${selectedCount} lead${selectedCount > 1 ? 's' : ''} refusé${selectedCount > 1 ? 's' : ''}`,
        type: 'success',
      })
      onClearSelection()
      onActionComplete()
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      setToast({
        message: 'Erreur lors du refus. Veuillez réessayer.',
        type: 'error',
      })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setIsProcessing(false)
      setConfirmDialog({ isOpen: false, type: null })
    }
  }

  const handleBulkDelete = async () => {
    setIsProcessing(true)
    try {
      await Promise.all(
        Array.from(selectedLeadIds).map((leadId) =>
          api.delete(`/leads/${leadId}`)
        )
      )

      setToast({
        message: `${selectedCount} lead${selectedCount > 1 ? 's' : ''} supprimé${selectedCount > 1 ? 's' : ''}`,
        type: 'success',
      })
      onClearSelection()
      onActionComplete()
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      setToast({
        message: 'Erreur lors de la suppression. Veuillez réessayer.',
        type: 'error',
      })
      setTimeout(() => setToast(null), 3000)
    } finally {
      setIsProcessing(false)
      setConfirmDialog({ isOpen: false, type: null })
    }
  }

  if (selectedCount === 0) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-[#00358E] border-t border-[#002a72] shadow-2xl z-40">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#00358E] text-sm font-bold">
              {selectedCount}
            </div>
            <span className="font-semibold text-white">
              lead{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={onClearSelection}
              className="text-sm text-gray-400 hover:text-white ml-1 transition underline underline-offset-2"
            >
              Désélectionner
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Assign button — responsable only */}
            {isResponsable && (
              <div className="relative" ref={assignMenuRef}>
                <button
                  onClick={() => setShowAssignMenu(!showAssignMenu)}
                  disabled={isProcessing || isAssigning}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {isAssigning ? 'Attribution…' : 'Attribuer'}
                </button>

                {/* Agent dropdown */}
                {showAssignMenu && (
                  <div className="absolute bottom-full mb-2 right-0 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                    <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                      <p className="text-xs font-semibold text-gray-500">Attribuer à :</p>
                    </div>
                    <div className="max-h-56 overflow-y-auto py-1">
                      {agencyAgents.map((agent) => (
                        <button
                          key={agent.id}
                          disabled={isAssigning}
                          onClick={() => handleBulkAssign(agent.id, agent.name)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 transition text-left disabled:opacity-50"
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${
                            agent.role === 'RESPONSABLE' ? 'bg-indigo-500' : 'bg-gray-400'
                          }`}>
                            {agent.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{agent.name}</p>
                            <p className="text-[10px] text-gray-400">
                              {agent.role === 'RESPONSABLE' ? 'Responsable' : 'Employé'}
                            </p>
                          </div>
                        </button>
                      ))}
                      {agencyAgents.length === 0 && (
                        <p className="text-sm text-gray-400 italic px-3 py-2">Chargement…</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setConfirmDialog({ isOpen: true, type: 'refuse' })}
              disabled={isProcessing}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold disabled:opacity-50 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              Tout refuser
            </button>
            <button
              onClick={() => setConfirmDialog({ isOpen: true, type: 'delete' })}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold disabled:opacity-50 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'refuse'}
        title="Refuser les leads ?"
        message={`Êtes-vous sûr de vouloir refuser ${selectedCount} lead${selectedCount > 1 ? 's' : ''} ?`}
        confirmText="Tout refuser"
        isDangerous={true}
        isLoading={isProcessing}
        onConfirm={handleBulkRefuse}
        onCancel={() => setConfirmDialog({ isOpen: false, type: null })}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'delete'}
        title="Supprimer les leads ?"
        message={`Êtes-vous sûr de vouloir supprimer ${selectedCount} lead${selectedCount > 1 ? 's' : ''} ?`}
        confirmText="Supprimer"
        isDangerous={true}
        isLoading={isProcessing}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, type: null })}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  )
}
