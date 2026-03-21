'use client'

import { useState } from 'react'
import { Lead } from '@/lib/types'
import StatusBadge from './StatusBadge'
import LeadActionPanel from '@/components/LeadActionPanel'

interface EnhancedLeadRowProps {
  lead: Lead
  onActionComplete: () => void
  onClick?: () => void
  isSelected?: boolean
  onToggleSelection?: (leadId: string) => void
}

export default function EnhancedLeadRow({ 
  lead, 
  onActionComplete, 
  onClick,
  isSelected = false,
  onToggleSelection 
}: EnhancedLeadRowProps) {
  const [showActions, setShowActions] = useState(false)

  const productEmojis: Record<string, string> = {
    DRIVE: '🚗',
    HOME: '🏠',
    PENSION_PLAN: '🏦',
  }

  const lastAction = lead.leadActions?.[0]
  const lastActionDate = lastAction ? new Date(lastAction.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null

  const handleRowClick = () => {
    onClick?.()
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    onToggleSelection?.(lead.id)
  }

  return (
    <>
      <div
        onClick={handleRowClick}
        className={`bg-white dark:bg-gray-800 border rounded-xl p-6 cursor-pointer transition ${
          isSelected
            ? 'border-blue-300 dark:border-blue-600 shadow-md bg-blue-50 dark:bg-blue-900/30'
            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md hover:bg-blue-50/30 dark:hover:bg-gray-700/50'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Checkbox */}
          <div className="md:col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxChange}
              className="w-5 h-5 rounded accent-blue-900 cursor-pointer"
              aria-label={`Select ${lead.firstName} ${lead.lastName}`}
            />
          </div>

          {/* Name & Contact */}
          <div className="md:col-span-3">
            <p className="font-semibold text-gray-900 dark:text-white text-base transition-colors">{lead.firstName} {lead.lastName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">
              {lead.email ? (
                <a href={`mailto:${lead.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  {lead.email}
                </a>
              ) : lead.phone ? (
                <a href={`tel:${lead.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  {lead.phone}
                </a>
              ) : (
                'No contact'
              )}
            </p>
          </div>

          {/* Product */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span>{productEmojis[lead.productInterest]}</span>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                  {lead.productInterest === 'DRIVE' ? 'Drive' : lead.productInterest === 'HOME' ? 'Home' : 'Pension'}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <StatusBadge status={lead.status} />
          </div>

          {/* Last Action */}
          <div className="md:col-span-3">
            {lastAction ? (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors">Last update</p>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                  {lastAction.type === 'REFUSED' ? '❌ Refused' : lastAction.type === 'QUOTE_CREATED' ? '📋 Quote' : lastAction.type === 'CALLBACK_SCHEDULED' ? '📅 Callback' : '📝 Note'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{lastActionDate}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 transition-colors">No activity</p>
            )}
          </div>

          {/* Actions Button */}
          <div className="md:col-span-1 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              aria-label="More actions"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.5 1.5H9.5V3.5H10.5V1.5ZM10.5 8.5H9.5V10.5H10.5V8.5ZM10.5 15.5H9.5V17.5H10.5V15.5Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Action Panel */}
      {showActions && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-xl p-4 -mt-1 transition-colors">
          <LeadActionPanel
            leadId={lead.id}
            onActionComplete={() => {
              setShowActions(false)
              onActionComplete()
            }}
          />
        </div>
      )}
    </>
  )
}
