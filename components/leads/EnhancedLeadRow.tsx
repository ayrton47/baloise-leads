'use client'

import { Lead } from '@/lib/types'
import StatusBadge from './StatusBadge'

interface EnhancedLeadRowProps {
  lead: Lead
  onActionComplete: () => void
  onClick?: () => void
  isSelected?: boolean
  onToggleSelection?: (leadId: string) => void
}

function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-emerald-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-rose-500',
    'bg-indigo-500',
    'bg-cyan-500',
    'bg-violet-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.floor(diff / 60000)
  if (days > 30)
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

const productConfig: Record<string, { label: string; color: string; bg: string; darkBg: string; darkColor: string }> = {
  DRIVE: {
    label: 'Drive',
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    darkBg: 'dark:bg-sky-900/20',
    darkColor: 'dark:text-sky-300',
  },
  HOME: {
    label: 'Home',
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    darkBg: 'dark:bg-violet-900/20',
    darkColor: 'dark:text-violet-300',
  },
  PENSION_PLAN: {
    label: 'Pension',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    darkBg: 'dark:bg-teal-900/20',
    darkColor: 'dark:text-teal-300',
  },
}

const actionLabels: Record<string, string> = {
  REFUSED: 'Refused',
  QUOTE_CREATED: 'Quote sent',
  CALLBACK_SCHEDULED: 'Callback',
  NOTE_ADDED: 'Note',
}

export default function EnhancedLeadRow({
  lead,
  onClick,
  isSelected = false,
  onToggleSelection,
}: EnhancedLeadRowProps) {
  const lastAction = lead.leadActions?.[0]
  const avatarColor = getAvatarColor(lead.firstName + lead.lastName)
  const initials = ((lead.firstName[0] ?? '') + (lead.lastName[0] ?? '')).toUpperCase()
  const product = productConfig[lead.productInterest]

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-800 border rounded-xl transition-all cursor-pointer ${
        isSelected
          ? 'border-blue-300 dark:border-blue-600 bg-blue-50/60 dark:bg-blue-900/20 shadow-sm'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm hover:bg-gray-50/50 dark:hover:bg-gray-750'
      }`}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation()
            onToggleSelection?.(lead.id)
          }}
          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
          aria-label={`Select ${lead.firstName} ${lead.lastName}`}
        />
      </div>

      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold select-none`}
      >
        {initials}
      </div>

      {/* Name + Contact — flex-1 */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
          {lead.firstName} {lead.lastName}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
          {lead.email
            ? lead.email
            : lead.phone
            ? lead.phone
            : <span className="italic">No contact</span>}
        </p>
      </div>

      {/* Product badge */}
      <div className="flex-shrink-0 hidden sm:block">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.bg} ${product.color} ${product.darkBg} ${product.darkColor}`}
        >
          {product.label}
        </span>
      </div>

      {/* Status */}
      <div className="flex-shrink-0 hidden md:block w-[130px]">
        <StatusBadge status={lead.status} size="sm" />
      </div>

      {/* Last activity */}
      <div className="flex-shrink-0 hidden lg:block w-[150px]">
        {lastAction ? (
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {actionLabels[lastAction.type] ?? lastAction.type}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              {getRelativeTime(lastAction.createdAt)}
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-300 dark:text-gray-600 italic">No activity</p>
        )}
      </div>

      {/* Quick actions — visible on hover */}
      <div
        className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {lead.email && (
          <a
            href={`mailto:${lead.email}`}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition"
            title={`Email ${lead.email}`}
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        )}
        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400 transition"
            title={`Call ${lead.phone}`}
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
        )}
        {/* Open detail arrow */}
        <div
          className="p-1.5 rounded-lg text-gray-300 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition"
          aria-label="View details"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
