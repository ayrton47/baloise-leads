'use client'

import { useState } from 'react'
import { Lead } from '@/lib/types'
import StatusBadge from './StatusBadge'
import LeadActionPanel from '@/components/LeadActionPanel'

interface EnhancedLeadRowProps {
  lead: Lead
  onActionComplete: () => void
  onClick?: () => void
}

export default function EnhancedLeadRow({ lead, onActionComplete, onClick }: EnhancedLeadRowProps) {
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

  return (
    <>
      <div
        onClick={handleRowClick}
        className="bg-white border border-gray-200 rounded-xl p-6 cursor-pointer transition hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Name & Contact */}
          <div className="md:col-span-4">
            <p className="font-semibold text-gray-900 text-base">{lead.firstName} {lead.lastName}</p>
            <p className="text-sm text-gray-500 mt-1">
              {lead.email ? (
                <a href={`mailto:${lead.email}`} className="hover:text-blue-600 transition">
                  {lead.email}
                </a>
              ) : lead.phone ? (
                <a href={`tel:${lead.phone}`} className="hover:text-blue-600 transition">
                  {lead.phone}
                </a>
              ) : (
                'No contact'
              )}
            </p>
          </div>

          {/* Product */}
          <div className="md:col-span-2">
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase">Product</p>
            <div className="flex items-center gap-2">
              <span className="text-xl">{productEmojis[lead.productInterest]}</span>
              <span className="text-sm text-gray-700 font-medium">
                {lead.productInterest === 'DRIVE' ? 'Drive' : lead.productInterest === 'HOME' ? 'Home' : 'Pension'}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase">Status</p>
            <StatusBadge status={lead.status} size="sm" />
          </div>

          {/* Last Action */}
          <div className="md:col-span-3">
            <p className="text-xs text-gray-500 font-medium mb-1 uppercase">Last Action</p>
            {lastAction ? (
              <div className="text-sm">
                <p className="text-gray-700 font-medium">
                  {lastAction.type === 'REFUSED' ? '❌ Refused' : lastAction.type === 'QUOTE_CREATED' ? '📋 Quote' : lastAction.type === 'CALLBACK_SCHEDULED' ? '📅 Callback' : '📝 Note'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{lastActionDate}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">—</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="md:col-span-1 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowActions(!showActions)
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900"
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
        <div className="bg-gray-50 border border-t-0 border-gray-200 rounded-b-xl p-4 -mt-1">
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
