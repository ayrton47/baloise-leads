'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Lead } from '@/lib/types'

interface LeadBulkActionsProps {
  selectedLeadIds: Set<string>
  leads: Lead[]
  onActionComplete: () => void
  onClearSelection: () => void
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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700 disabled:opacity-50'
                : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg text-white font-medium shadow-lg z-50 ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
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
}: LeadBulkActionsProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'refuse' | 'delete' | null
  }>({ isOpen: false, type: null })
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const selectedCount = selectedLeadIds.size
  const selectedLeadsList = leads.filter((lead) => selectedLeadIds.has(lead.id))

  const handleBulkRefuse = async () => {
    setIsProcessing(true)
    try {
      await Promise.all(
        Array.from(selectedLeadIds).map((leadId) =>
          api.post(`/leads/${leadId}/refuse`, {
            refusalReason: 'OTHER',
            refusalNote: 'Bulk refused',
          })
        )
      )

      setToast({
        message: `${selectedCount} lead${selectedCount > 1 ? 's' : ''} refused successfully`,
        type: 'success',
      })
      onClearSelection()
      onActionComplete()
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      setToast({
        message: 'Failed to refuse leads. Please try again.',
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
        message: `${selectedCount} lead${selectedCount > 1 ? 's' : ''} deleted successfully`,
        type: 'success',
      })
      onClearSelection()
      onActionComplete()
      setTimeout(() => setToast(null), 3000)
    } catch (error) {
      setToast({
        message: 'Failed to delete leads. Please try again.',
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
        <div className="max-w-full mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              checked={true}
              disabled
              className="w-5 h-5 rounded accent-blue-900 cursor-pointer"
            />
            <span className="font-semibold text-gray-900">
              {selectedCount} lead{selectedCount > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-sm text-gray-500 hover:text-gray-700 ml-2"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setConfirmDialog({ isOpen: true, type: 'refuse' })}
              disabled={isProcessing}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium disabled:opacity-50 transition"
            >
              Refuse All
            </button>
            <button
              onClick={() => setConfirmDialog({ isOpen: true, type: 'delete' })}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium disabled:opacity-50 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'refuse'}
        title="Refuse Leads?"
        message={`Are you sure you want to refuse ${selectedCount} lead${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Refuse All"
        isDangerous={true}
        isLoading={isProcessing}
        onConfirm={handleBulkRefuse}
        onCancel={() => setConfirmDialog({ isOpen: false, type: null })}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'delete'}
        title="Delete Leads?"
        message={`Are you sure you want to delete ${selectedCount} lead${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous={true}
        isLoading={isProcessing}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, type: null })}
      />

      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  )
}
