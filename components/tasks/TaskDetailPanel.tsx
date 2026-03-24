'use client'

import { useState, useEffect, useRef } from 'react'
import { api } from '@/lib/api'
import { Task, TaskStatus, TaskPriority, TaskCategory, Agent } from '@/lib/types'

const priorityConfig: Record<TaskPriority, { label: string; dot: string }> = {
  URGENT: { label: 'Urgente', dot: 'bg-red-500' },
  HIGH: { label: 'Haute', dot: 'bg-orange-500' },
  NORMAL: { label: 'Normale', dot: 'bg-blue-500' },
  LOW: { label: 'Basse', dot: 'bg-gray-400' },
}

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  TODO: { label: 'À faire', color: 'text-blue-700', bg: 'bg-blue-100' },
  IN_PROGRESS: { label: 'En cours', color: 'text-orange-700', bg: 'bg-orange-100' },
  DONE: { label: 'Clôturée', color: 'text-green-700', bg: 'bg-green-100' },
  CANCELLED: { label: 'Annulée', color: 'text-gray-500', bg: 'bg-gray-100' },
}

const categoryLabels: Record<TaskCategory, string> = {
  ADMIN: '📋 Administrative',
  COMMERCIAL: '💼 Commerciale',
  SINISTRE: '⚠️ Sinistre',
  RENEWAL: '🔄 Renouvellement',
  OTHER: '📌 Autre',
}

interface TaskDetailPanelProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
  currentUser: any
}

export default function TaskDetailPanel({ task, isOpen, onClose, onUpdate, currentUser }: TaskDetailPanelProps) {
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const commentsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      api.get('/agents/agency').then(res => setAgents(res.data)).catch(() => {})
    }
  }, [isOpen])

  if (!isOpen || !task) return null

  const isOverdue = () => {
    if (task.status === 'DONE' || task.status === 'CANCELLED') return false
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatRelative = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `il y a ${minutes}min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `il y a ${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `il y a ${days}j`
    return formatDate(dateStr)
  }

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true)
    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus })
      onUpdate()
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAssignChange = async (agentId: string) => {
    setIsUpdating(true)
    try {
      await api.patch(`/tasks/${task.id}`, { assignedTo: agentId || null })
      onUpdate()
    } catch (error) {
      console.error('Failed to reassign:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    setIsUpdating(true)
    try {
      await api.patch(`/tasks/${task.id}`, { priority: newPriority })
      onUpdate()
    } catch (error) {
      console.error('Failed to update priority:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer cette tâche ?')) return
    try {
      await api.delete(`/tasks/${task.id}`)
      onClose()
      onUpdate()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      await api.post(`/tasks/${task.id}/comments`, { content: newComment.trim() })
      setNewComment('')
      onUpdate()
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const priority = priorityConfig[task.priority]
  const status = statusConfig[task.status]
  const overdue = isOverdue()

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${priority.dot}`} />
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
              {status.label}
            </span>
            {overdue && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                En retard
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
              title="Supprimer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>

            {/* Description */}
            {task.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
            )}

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Statut</label>
                <select
                  value={task.status}
                  onChange={e => handleStatusChange(e.target.value as TaskStatus)}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00358E]/20"
                >
                  <option value="TODO">À faire</option>
                  <option value="IN_PROGRESS">En cours</option>
                  <option value="DONE">Clôturée</option>
                  <option value="CANCELLED">Annulée</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Priorité</label>
                <select
                  value={task.priority}
                  onChange={e => handlePriorityChange(e.target.value as TaskPriority)}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00358E]/20"
                >
                  <option value="URGENT">🔴 Urgente</option>
                  <option value="HIGH">🟠 Haute</option>
                  <option value="NORMAL">🔵 Normale</option>
                  <option value="LOW">⚪ Basse</option>
                </select>
              </div>

              {/* Assigned to */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Attribuée à</label>
                <select
                  value={task.assignedTo || ''}
                  onChange={e => handleAssignChange(e.target.value)}
                  disabled={isUpdating || currentUser?.role !== 'RESPONSABLE'}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00358E]/20"
                >
                  <option value="">Non attribuée</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} {agent.role === 'RESPONSABLE' ? '(R)' : '(E)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Catégorie</label>
                <p className="px-3 py-2 text-sm text-gray-700">{categoryLabels[task.category] || task.category}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex flex-wrap gap-4 text-sm">
              {task.dueDate && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Échéance</span>
                  <p className={`mt-0.5 font-medium ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              )}
              {task.leadName && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase">Lead lié</span>
                  <p className="mt-0.5 font-medium text-[#00358E]">{task.leadName}</p>
                </div>
              )}
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Créée par</span>
                <p className="mt-0.5 text-gray-700">{task.createdByName}</p>
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase">Créée le</span>
                <p className="mt-0.5 text-gray-700">{formatDate(task.createdAt)}</p>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-gray-100" />

            {/* Comments section */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Commentaires ({task.comments?.length || 0})
              </h3>

              {/* Comments list */}
              <div className="space-y-3 mb-4">
                {(!task.comments || task.comments.length === 0) && (
                  <p className="text-sm text-gray-400 italic">Aucun commentaire</p>
                )}
                {task.comments?.map(comment => (
                  <div key={comment.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700">{comment.agentName || 'Agent'}</span>
                      <span className="text-xs text-gray-400">{formatRelative(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>

              {/* Add comment form */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00358E]/20 focus:border-[#00358E]"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="px-4 py-2.5 bg-[#00358E] text-white rounded-xl text-sm font-medium hover:bg-[#002a70] transition disabled:opacity-50 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Quick status actions at bottom */}
        <div className="border-t border-gray-100 px-6 py-3 flex gap-2">
          {task.status !== 'DONE' && (
            <button
              onClick={() => handleStatusChange('DONE')}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition border border-green-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Clôturer
            </button>
          )}
          {task.status === 'TODO' && (
            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 rounded-xl text-sm font-medium hover:bg-orange-100 transition border border-orange-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Commencer
            </button>
          )}
          {task.status === 'DONE' && (
            <button
              onClick={() => handleStatusChange('TODO')}
              disabled={isUpdating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition border border-blue-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réouvrir
            </button>
          )}
        </div>
      </div>
    </>
  )
}
