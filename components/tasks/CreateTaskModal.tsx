'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Agent, Lead, TaskPriority, TaskCategory } from '@/lib/types'

interface CreateTaskModalProps {
  currentUser: any
  onClose: () => void
  onSuccess: () => void
}

export default function CreateTaskModal({ currentUser, onClose, onSuccess }: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TaskCategory>('OTHER')
  const [priority, setPriority] = useState<TaskPriority>('NORMAL')
  const [dueDate, setDueDate] = useState('')
  const [assignedTo, setAssignedTo] = useState<string>('')
  const [leadId, setLeadId] = useState<string>('')
  const [agents, setAgents] = useState<Agent[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch agents for assignment
    api.get('/agents/agency').then(res => setAgents(res.data)).catch(() => {})
    // Fetch leads for linking
    api.get('/leads').then(res => setLeads(res.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Le titre est obligatoire')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await api.post('/tasks', {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        dueDate: dueDate || undefined,
        assignedTo: assignedTo || undefined,
        leadId: leadId || undefined,
      })
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Nouvelle tâche</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Appeler M. Dupont pour renouvellement"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00358E]/20 focus:border-[#00358E]"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Détails supplémentaires..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00358E]/20 focus:border-[#00358E] resize-none"
            />
          </div>

          {/* Priority + Category row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00358E]/20 focus:border-[#00358E]"
              >
                <option value="URGENT">🔴 Urgente</option>
                <option value="HIGH">🟠 Haute</option>
                <option value="NORMAL">🔵 Normale</option>
                <option value="LOW">⚪ Basse</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as TaskCategory)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00358E]/20 focus:border-[#00358E]"
              >
                <option value="ADMIN">📋 Administrative</option>
                <option value="COMMERCIAL">💼 Commerciale</option>
                <option value="SINISTRE">⚠️ Sinistre</option>
                <option value="RENEWAL">🔄 Renouvellement</option>
                <option value="OTHER">📌 Autre</option>
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d&apos;échéance</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00358E]/20 focus:border-[#00358E]"
            />
          </div>

          {/* Assign to agent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attribuer à</label>
            <select
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00358E]/20 focus:border-[#00358E]"
              disabled={currentUser?.role !== 'RESPONSABLE'}
            >
              <option value="">Non attribuée</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} {agent.role === 'RESPONSABLE' ? '(R)' : '(E)'}
                </option>
              ))}
            </select>
            {currentUser?.role !== 'RESPONSABLE' && (
              <p className="text-xs text-gray-400 mt-1">Seuls les responsables peuvent attribuer des tâches</p>
            )}
          </div>

          {/* Link to lead */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lier à un lead</label>
            <select
              value={leadId}
              onChange={e => setLeadId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00358E]/20 focus:border-[#00358E]"
            >
              <option value="">Aucun lead</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.firstName} {lead.lastName} — {lead.status}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#00358E] text-white text-sm font-medium hover:bg-[#002a70] transition disabled:opacity-50"
            >
              {isSubmitting ? 'Création...' : 'Créer la tâche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
