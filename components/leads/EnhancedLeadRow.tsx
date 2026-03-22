'use client'

import { Lead } from '@/lib/types'
import StatusBadge from './StatusBadge'
import DriveIcon from '@/components/icons/DriveIcon'
import HomeIcon from '@/components/icons/HomeIcon'
import PensionIcon from '@/components/icons/PensionIcon'
import { ReactNode } from 'react'

interface EnhancedLeadRowProps {
  lead: Lead
  onActionComplete: () => void
  onClick?: () => void
  isSelected?: boolean
  onToggleSelection?: (leadId: string) => void
  index?: number
}

function getAvatarColor(name: string): string {
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-emerald-500 to-emerald-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-teal-500 to-teal-600',
    'from-rose-500 to-rose-600',
    'from-indigo-500 to-indigo-600',
    'from-cyan-500 to-cyan-600',
    'from-violet-500 to-violet-600',
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
    return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })
  if (days > 0) return `il y a ${days}j`
  if (hours > 0) return `il y a ${hours}h`
  if (minutes > 0) return `il y a ${minutes}min`
  return 'À l\'instant'
}

const productConfig: Record<string, { label: string; icon: ReactNode; color: string; bg: string }> = {
  DRIVE: {
    label: 'Drive',
    icon: <DriveIcon size={16} />,
    color: 'text-sky-700',
    bg: 'bg-sky-50',
  },
  HOME: {
    label: 'Home',
    icon: <HomeIcon size={16} />,
    color: 'text-violet-700',
    bg: 'bg-violet-50',
  },
  PENSION_PLAN: {
    label: 'Pension',
    icon: <PensionIcon size={16} />,
    color: 'text-teal-700',
    bg: 'bg-teal-50',
  },
  OTHER: {
    label: 'Autre',
    icon: <span className="text-xs">📋</span>,
    color: 'text-gray-600',
    bg: 'bg-gray-100',
  },
}

const actionLabels: Record<string, string> = {
  REFUSED: 'Refusé',
  REFUSAL_CANCELLED: 'Refus annulé',
  QUOTE_CREATED: 'Devis envoyé',
  CALLBACK_SCHEDULED: 'Rappel planifié',
  NOTE_ADDED: 'Note ajoutée',
  CONVERTED: 'Converti',
}

export default function EnhancedLeadRow({
  lead,
  onClick,
  isSelected = false,
  onToggleSelection,
  index = 0,
}: EnhancedLeadRowProps) {
  const lastAction = lead.leadActions?.[0]
  const quotes = lead.leadActions?.filter((a) => a.type === 'QUOTE_CREATED') ?? []
  const quoteCount = quotes.length
  // Find the most recent callback date for TO_CONTACT leads
  const latestCallback = lead.status === 'TO_CONTACT'
    ? [...(lead.leadActions ?? [])].filter((a) => a.type === 'CALLBACK_SCHEDULED' && a.callbackDate).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null
  const avatarColor = getAvatarColor(lead.firstName + lead.lastName)
  const initials = ((lead.firstName[0] ?? '') + (lead.lastName[0] ?? '')).toUpperCase()
  const products = lead.productInterest.split(',').map((p) => p.trim()).filter(Boolean)
  const product = productConfig[products[0]] ?? productConfig['OTHER']

  return (
    <div
      onClick={onClick}
      className={`group border-2 rounded-2xl transition-all cursor-pointer ${
        isSelected
          ? 'border-[#00358E] bg-blue-50/60 shadow-md'
          : lead.status === 'CONVERTED'
          ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300 hover:shadow-lg'
          : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-lg hover:bg-gray-50/50'
      }`}
    >
      {/* Desktop layout */}
      <div className="hidden sm:flex items-center gap-4 px-5 py-4">
        {/* Checkbox */}
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              onToggleSelection?.(lead.id)
            }}
            className="w-4.5 h-4.5 rounded accent-[#00358E] cursor-pointer"
            aria-label={`Sélectionner ${lead.firstName} ${lead.lastName}`}
          />
        </div>

        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-sm font-bold select-none shadow-sm`}
        >
          {initials}
        </div>

        {/* Name + Contact + Assigned Agent */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900 truncate">
            {lead.firstName} {lead.lastName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {lead.email
              ? lead.email
              : lead.phone
              ? lead.phone
              : <span className="italic">Pas de contact</span>}
          </p>
          {lead.assignedAgentName && (
            <p className="text-[11px] text-indigo-600 mt-0.5 flex items-center gap-1 truncate">
              <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {lead.assignedAgentName}
              {lead.assignedAgentRole === 'RESPONSABLE' && (
                <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-1 py-0.5 rounded">R</span>
              )}
            </p>
          )}
        </div>

        {/* Product badges */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {products.map((p) => {
            const cfg = productConfig[p] ?? productConfig['OTHER']
            return (
              <span
                key={p}
                className={`text-xs font-bold px-2.5 py-1.5 rounded-lg ${cfg.bg} ${cfg.color} flex items-center gap-1`}
              >
                {cfg.icon}
                {cfg.label}
              </span>
            )
          })}
        </div>

        {/* Quote count badge */}
        {quoteCount > 0 && (
          <div className="flex-shrink-0">
            <span className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {quoteCount} devis
            </span>
          </div>
        )}

        {/* Status */}
        <div className="flex-shrink-0 hidden md:block w-[130px]">
          <StatusBadge status={lead.status} size="sm" />
          {latestCallback && (
            <p className="text-[11px] text-yellow-600 font-medium mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(latestCallback.callbackDate!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Entry date */}
        <div className="flex-shrink-0 hidden lg:block w-[90px]">
          <p className="text-[11px] text-gray-400 font-medium">
            {new Date(lead.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Last activity */}
        <div className="flex-shrink-0 hidden lg:block w-[150px]">
          {lastAction ? (
            <div>
              <p className="text-xs font-medium text-gray-600">
                {actionLabels[lastAction.type] ?? lastAction.type}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {getRelativeTime(lastAction.createdAt)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-gray-300 italic">Aucune activité</p>
          )}
        </div>

        {/* Quick actions — visible on hover */}
        <div
          className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {lead.email && (
            <a
              href={`mailto:${lead.email}`}
              className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
              title={`Envoyer un email à ${lead.email}`}
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
              className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
              title={`Appeler ${lead.phone}`}
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>
          )}
          <div
            className="p-2 rounded-xl text-gray-300 group-hover:text-gray-500 transition"
            aria-label="Voir les détails"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex sm:hidden px-3.5 py-3 gap-3">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-1" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              onToggleSelection?.(lead.id)
            }}
            className="w-5 h-5 rounded accent-[#00358E] cursor-pointer"
            aria-label={`Sélectionner ${lead.firstName} ${lead.lastName}`}
          />
        </div>

        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-sm font-bold select-none shadow-sm`}
        >
          {initials}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Name + Status */}
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-sm text-gray-900 truncate">
              {lead.firstName} {lead.lastName}
            </p>
            <StatusBadge status={lead.status} size="sm" />
          </div>

          {/* Row 2: Contact */}
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {lead.email
              ? lead.email
              : lead.phone
              ? lead.phone
              : <span className="italic">Pas de contact</span>}
          </p>

          {/* Row 3: Products + Quotes */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {products.map((p) => {
              const cfg = productConfig[p] ?? productConfig['OTHER']
              return (
                <span
                  key={p}
                  className={`text-[11px] font-bold px-2 py-1 rounded-md ${cfg.bg} ${cfg.color} flex items-center gap-0.5`}
                >
                  {cfg.icon}
                  {cfg.label}
                </span>
              )
            })}
            {quoteCount > 0 && (
              <span className="text-[11px] font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-700">
                {quoteCount} devis
              </span>
            )}
          </div>

          {/* Row 4: Agent + Date + Last activity */}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
            {lead.assignedAgentName && (
              <span className="flex items-center gap-1 text-indigo-600">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {lead.assignedAgentName}
                {lead.assignedAgentRole === 'RESPONSABLE' && (
                  <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-1 py-0.5 rounded">R</span>
                )}
              </span>
            )}
            <span>{new Date(lead.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
            {lastAction && (
              <span className="text-gray-500">{actionLabels[lastAction.type] ?? lastAction.type}</span>
            )}
          </div>

          {/* Row 5: Callback date if TO_CONTACT */}
          {latestCallback && (
            <p className="text-[11px] text-yellow-600 font-medium mt-1.5 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(latestCallback.callbackDate!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}

          {/* Mobile quick actions */}
          <div className="flex items-center gap-2 mt-2 -ml-1" onClick={(e) => e.stopPropagation()}>
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="p-2 rounded-xl text-emerald-500 hover:bg-emerald-50 transition"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>
            )}
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 transition"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0 self-center">
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}
