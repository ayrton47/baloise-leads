'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { api } from '@/lib/api'
import { Task, TaskStatus, TaskPriority, TaskCategory } from '@/lib/types'
import CreateTaskModal from '@/components/tasks/CreateTaskModal'
import TaskDetailPanel from '@/components/tasks/TaskDetailPanel'

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string; dot: string }> = {
  URGENT: { label: 'Urgente', color: 'text-red-700', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500' },
  HIGH: { label: 'Haute', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
  NORMAL: { label: 'Normale', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  LOW: { label: 'Basse', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
}

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  TODO: { label: 'À faire', color: 'text-blue-700', bg: 'bg-blue-100' },
  IN_PROGRESS: { label: 'En cours', color: 'text-orange-700', bg: 'bg-orange-100' },
  DONE: { label: 'Clôturée', color: 'text-green-700', bg: 'bg-green-100' },
  CANCELLED: { label: 'Annulée', color: 'text-gray-500', bg: 'bg-gray-100' },
}

const categoryConfig: Record<TaskCategory, { label: string; icon: string }> = {
  ADMIN: { label: 'Administrative', icon: '📋' },
  COMMERCIAL: { label: 'Commerciale', icon: '💼' },
  SINISTRE: { label: 'Sinistre', icon: '⚠️' },
  RENEWAL: { label: 'Renouvellement', icon: '🔄' },
  OTHER: { label: 'Autre', icon: '📌' },
}

type FilterStatus = TaskStatus | 'ALL' | 'OVERDUE'

// Reusable section component for task grouping
function TaskSection({
  sectionKey, icon, title, badge, count, isCollapsed, onToggle, bgColor, tasks, onOpenTask, isOverdue, formatRelative, priorityConfig, statusConfig, categoryConfig,
}: {
  sectionKey: string
  icon: React.ReactNode
  title: string
  badge?: string
  count: number
  isCollapsed: boolean
  onToggle: () => void
  bgColor: string
  tasks: Task[]
  onOpenTask: (task: Task) => void
  isOverdue: (task: Task) => boolean
  formatRelative: (date: string) => string
  priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string; dot: string }>
  statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }>
  categoryConfig: Record<TaskCategory, { label: string; icon: string }>
}) {
  return (
    <div className={`rounded-2xl ${bgColor} p-3 sm:p-4`}>
      {/* Section header */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left mb-2 group"
      >
        <span className="text-gray-600">{icon}</span>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        {badge && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00358E]/10 text-[#00358E]">{badge}</span>
        )}
        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#00358E] text-white">{count}</span>
        <div className="flex-1" />
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Tasks */}
      {!isCollapsed && (
        <div className="space-y-2">
          {tasks.map(task => {
            const priority = priorityConfig[task.priority]
            const status = statusConfig[task.status]
            const category = categoryConfig[task.category] || categoryConfig.OTHER
            const overdue = isOverdue(task)
            const isDone = task.status === 'DONE' || task.status === 'CANCELLED'

            return (
              <div
                key={task.id}
                onClick={() => onOpenTask(task)}
                className={`group flex items-center gap-4 px-4 sm:px-5 py-3.5 border-2 rounded-2xl transition-all cursor-pointer hover:shadow-md ${
                  overdue
                    ? 'border-red-300 bg-red-50/50 hover:border-red-400'
                    : isDone
                    ? 'border-gray-200 bg-gray-50 opacity-60 hover:opacity-80'
                    : 'border-gray-200 bg-white hover:border-[#00358E]/30'
                }`}
              >
                {/* Priority dot */}
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${priority.dot}`} title={priority.label} />

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={`text-sm font-semibold truncate ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>{category.icon} {category.label}</span>
                    {task.leadName && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                          </svg>
                          {task.leadName}
                        </span>
                      </>
                    )}
                    {task.comments && task.comments.length > 0 && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          {task.comments.length}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right side: status + due date */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {task.dueDate && (
                    <span className={`text-xs font-medium ${overdue ? 'text-red-600' : 'text-gray-500'}`}>
                      {overdue && (
                        <svg className="w-3 h-3 inline mr-0.5 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                        </svg>
                      )}
                      {formatRelative(task.dueDate)}
                    </span>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TasksPage({ user }: { user: any }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'ALL'>('ALL')
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const selectedTaskRef = useRef<Task | null>(null)
  // Keep ref in sync with state
  useEffect(() => { selectedTaskRef.current = selectedTask }, [selectedTask])
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/tasks')
      setTasks(response.data)
      // Refresh selected task if panel is open (use ref to avoid stale closure)
      if (selectedTaskRef.current) {
        const updated = response.data.find((t: Task) => t.id === selectedTaskRef.current!.id)
        if (updated) setSelectedTask(updated)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchTasks() }, [])

  // KPI stats (always from all tasks)
  const now = new Date()
  const kpiStats = useMemo(() => ({
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
    overdue: tasks.filter(t => {
      if (t.status === 'DONE' || t.status === 'CANCELLED') return false
      if (!t.dueDate) return false
      return new Date(t.dueDate) < now
    }).length,
  }), [tasks])

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (filterStatus === 'OVERDUE') {
      if (task.status === 'DONE' || task.status === 'CANCELLED') return false
      if (!task.dueDate || new Date(task.dueDate) >= now) return false
    } else if (filterStatus !== 'ALL' && task.status !== filterStatus) {
      return false
    }

    // Priority filter
    if (filterPriority !== 'ALL' && task.priority !== filterPriority) return false

    // Category filter
    if (filterCategory !== 'ALL' && task.category !== filterCategory) return false

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchTitle = task.title.toLowerCase().includes(q)
      const matchDesc = task.description?.toLowerCase().includes(q)
      const matchAssigned = task.assignedToName?.toLowerCase().includes(q)
      const matchLead = task.leadName?.toLowerCase().includes(q)
      if (!matchTitle && !matchDesc && !matchAssigned && !matchLead) return false
    }

    return true
  })

  // Sort: overdue first, then by priority, then by due date
  const priorityOrder: Record<string, number> = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 }
  const sortedTasks = useMemo(() => [...filteredTasks].sort((a, b) => {
    // Done/cancelled at bottom
    const aActive = a.status !== 'DONE' && a.status !== 'CANCELLED'
    const bActive = b.status !== 'DONE' && b.status !== 'CANCELLED'
    if (aActive !== bActive) return aActive ? -1 : 1

    // Overdue first
    const aOverdue = a.dueDate && new Date(a.dueDate) < now && aActive
    const bOverdue = b.dueDate && new Date(b.dueDate) < now && bActive
    if (aOverdue !== bOverdue) return aOverdue ? -1 : 1

    // Then by priority
    const aPrio = priorityOrder[a.priority] ?? 2
    const bPrio = priorityOrder[b.priority] ?? 2
    if (aPrio !== bPrio) return aPrio - bPrio

    // Then by due date (soonest first)
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    if (a.dueDate) return -1
    if (b.dueDate) return 1

    return 0
  }), [filteredTasks])

  // Group tasks by agent sections
  const myTasks = sortedTasks.filter(t => t.assignedTo === user?.id)
  const unassignedTasks = sortedTasks.filter(t => !t.assignedTo)

  // Group other agents' tasks by agent name
  const otherAgentSections = useMemo(() => {
    const otherAgentIds = [...new Set(sortedTasks
      .filter(t => t.assignedTo && t.assignedTo !== user?.id)
      .map(t => t.assignedTo))]

    return otherAgentIds.map(agentId => {
      const agentTasks = sortedTasks.filter(t => t.assignedTo === agentId)
      const agentName = agentTasks[0]?.assignedToName || 'Inconnu'
      const agentRole = agentTasks[0]?.assignedToRole
      return { agentId: agentId!, agentName, agentRole, tasks: agentTasks }
    })
  }, [sortedTasks, user?.id])

  const toggleSection = (key: string) => {
    setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const openTask = (task: Task) => {
    setSelectedTask(task)
    setIsPanelOpen(true)
  }

  const isOverdue = (task: Task) => {
    if (task.status === 'DONE' || task.status === 'CANCELLED') return false
    if (!task.dueDate) return false
    return new Date(task.dueDate) < now
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const formatRelative = (dateStr: string) => {
    const date = new Date(dateStr)
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days < 0) return `${Math.abs(days)}j en retard`
    if (days === 0) return "Aujourd'hui"
    if (days === 1) return 'Demain'
    if (days <= 7) return `Dans ${days}j`
    return formatDate(dateStr)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tâches</h2>
          <p className="text-sm text-gray-500 mt-0.5">Gérez les tâches de votre agence</p>
        </div>
        {user?.role === 'RESPONSABLE' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00358E] text-white rounded-xl font-medium text-sm hover:bg-[#002a70] transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Nouvelle tâche</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => setFilterStatus(filterStatus === 'TODO' ? 'ALL' : 'TODO')}
          className={`rounded-2xl p-4 text-left transition border-2 ${filterStatus === 'TODO' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-transparent'} bg-blue-50`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 uppercase">À faire</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{kpiStats.todo}</p>
        </button>
        <button
          onClick={() => setFilterStatus(filterStatus === 'IN_PROGRESS' ? 'ALL' : 'IN_PROGRESS')}
          className={`rounded-2xl p-4 text-left transition border-2 ${filterStatus === 'IN_PROGRESS' ? 'border-orange-400 ring-2 ring-orange-100' : 'border-transparent'} bg-orange-50`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-orange-700 uppercase">En cours</span>
          </div>
          <p className="text-2xl font-bold text-orange-900">{kpiStats.inProgress}</p>
        </button>
        <button
          onClick={() => setFilterStatus(filterStatus === 'DONE' ? 'ALL' : 'DONE')}
          className={`rounded-2xl p-4 text-left transition border-2 ${filterStatus === 'DONE' ? 'border-green-400 ring-2 ring-green-100' : 'border-transparent'} bg-green-50`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-green-700 uppercase">Clôturées</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{kpiStats.done}</p>
        </button>
        <button
          onClick={() => setFilterStatus(filterStatus === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
          className={`rounded-2xl p-4 text-left transition border-2 ${filterStatus === 'OVERDUE' ? 'border-red-400 ring-2 ring-red-100' : 'border-transparent'} bg-red-50`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-red-700 uppercase">En retard</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{kpiStats.overdue}</p>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher une tâche..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00358E]/20 focus:border-[#00358E]"
          />
        </div>

        {/* Priority filter */}
        <select
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value as TaskPriority | 'ALL')}
          className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition ${filterPriority !== 'ALL' ? 'border-[#00358E] bg-blue-50 text-[#00358E]' : 'border-gray-200 text-gray-600'}`}
        >
          <option value="ALL">Toutes priorités</option>
          <option value="URGENT">🔴 Urgente</option>
          <option value="HIGH">🟠 Haute</option>
          <option value="NORMAL">🔵 Normale</option>
          <option value="LOW">⚪ Basse</option>
        </select>

        {/* Category filter */}
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value as TaskCategory | 'ALL')}
          className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition ${filterCategory !== 'ALL' ? 'border-[#00358E] bg-blue-50 text-[#00358E]' : 'border-gray-200 text-gray-600'}`}
        >
          <option value="ALL">Toutes catégories</option>
          <option value="ADMIN">📋 Administrative</option>
          <option value="COMMERCIAL">💼 Commerciale</option>
          <option value="SINISTRE">⚠️ Sinistre</option>
          <option value="RENEWAL">🔄 Renouvellement</option>
          <option value="OTHER">📌 Autre</option>
        </select>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-8 h-8 border-[3px] border-[#00358E] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Chargement des tâches…</p>
        </div>
      ) : sortedTasks.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {tasks.length === 0 ? 'Aucune tâche' : 'Aucun résultat'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            {tasks.length === 0
              ? 'Créez votre première tâche pour commencer à organiser le travail de votre agence.'
              : 'Essayez de modifier vos filtres pour voir d\'autres tâches.'}
          </p>
          {tasks.length === 0 && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#00358E] text-white rounded-xl text-sm font-medium hover:bg-[#002a70] transition"
            >
              Créer une tâche
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mes tâches */}
          {myTasks.length > 0 && (
            <TaskSection
              sectionKey="my"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
              title="Mes tâches"
              count={myTasks.length}
              isCollapsed={collapsedSections['my'] ?? false}
              onToggle={() => toggleSection('my')}
              bgColor="bg-blue-50/50"
              tasks={myTasks}
              onOpenTask={openTask}
              isOverdue={isOverdue}
              formatRelative={formatRelative}
              priorityConfig={priorityConfig}
              statusConfig={statusConfig}
              categoryConfig={categoryConfig}
            />
          )}

          {/* Non attribuées */}
          {unassignedTasks.length > 0 && (
            <TaskSection
              sectionKey="unassigned"
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>}
              title="Non attribuées"
              count={unassignedTasks.length}
              isCollapsed={collapsedSections['unassigned'] ?? false}
              onToggle={() => toggleSection('unassigned')}
              bgColor="bg-amber-50/50"
              tasks={unassignedTasks}
              onOpenTask={openTask}
              isOverdue={isOverdue}
              formatRelative={formatRelative}
              priorityConfig={priorityConfig}
              statusConfig={statusConfig}
              categoryConfig={categoryConfig}
            />
          )}

          {/* Other agents */}
          {otherAgentSections.map(section => (
            <TaskSection
              key={section.agentId}
              sectionKey={section.agentId}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
              title={section.agentName}
              badge={section.agentRole === 'RESPONSABLE' ? 'R' : 'E'}
              count={section.tasks.length}
              isCollapsed={collapsedSections[section.agentId] ?? false}
              onToggle={() => toggleSection(section.agentId)}
              bgColor="bg-[#f9f3ff]"
              tasks={section.tasks}
              onOpenTask={openTask}
              isOverdue={isOverdue}
              formatRelative={formatRelative}
              priorityConfig={priorityConfig}
              statusConfig={statusConfig}
              categoryConfig={categoryConfig}
            />
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          currentUser={user}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchTasks()
          }}
        />
      )}

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false)
          setSelectedTask(null)
        }}
        onUpdate={fetchTasks}
        currentUser={user}
      />
    </div>
  )
}
