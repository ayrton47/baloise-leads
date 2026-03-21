'use client'

import { Lead, ProductType } from '@/lib/types'
import StatusBadge from './StatusBadge'
import { X, Mail, Phone, Calendar, Tag, FileText, Clock } from 'lucide-react'

interface LeadDetailPanelProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onAction: (actionType: string, leadId: string) => void
}

const productLabels: Record<ProductType, string> = {
  DRIVE: 'Car Insurance',
  HOME: 'Home Insurance',
  PENSION_PLAN: 'Pension Plan',
}

const actionTypeLabels: Record<string, string> = {
  REFUSED: 'Lead Refused',
  QUOTE_CREATED: 'Quote Created',
  CALLBACK_SCHEDULED: 'Callback Scheduled',
  NOTE_ADDED: 'Note Added',
}

const refusalReasonLabels: Record<string, string> = {
  NO_ASSET: 'No Assets',
  PRICE_TOO_HIGH: 'Price Too High',
  ALREADY_INSURED: 'Already Insured',
  OTHER: 'Other',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getActionDescription(action: any): string {
  const baseLabel = actionTypeLabels[action.type] || action.type

  switch (action.type) {
    case 'REFUSED':
      return `${baseLabel} - ${refusalReasonLabels[action.refusalReason] || 'No reason'}`
    case 'QUOTE_CREATED':
      return `${baseLabel} - ${productLabels[action.quotedProduct] || 'Unknown product'}`
    case 'CALLBACK_SCHEDULED':
      return `${baseLabel} - ${formatDate(action.callbackDate)}`
    case 'NOTE_ADDED':
      return `${baseLabel} - "${action.note}"`
    default:
      return baseLabel
  }
}

export default function LeadDetailPanel({
  lead,
  isOpen,
  onClose,
  onAction,
}: LeadDetailPanelProps) {
  if (!lead) return null

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div
        className={`fixed right-0 top-0 h-screen w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              {lead.firstName} {lead.lastName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Status Section */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <StatusBadge status={lead.status} size="md" />
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Details</h3>
            <div className="space-y-3">
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 transition-colors group"
                >
                  <Mail className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  <span className="truncate">{lead.email}</span>
                </a>
              )}
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-3 text-sm text-blue-600 hover:text-blue-700 transition-colors group"
                >
                  <Phone className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                  <span>{lead.phone}</span>
                </a>
              )}
              {!lead.email && !lead.phone && (
                <p className="text-sm text-gray-500 italic">No contact details available</p>
              )}
            </div>
          </div>

          {/* Lead Information Section */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Information</h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  Product
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {productLabels[lead.productInterest]}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Source
                </span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {lead.source === 'API_EXTERNAL' ? 'External API' : 'Manual'}
                </span>
              </div>
              {lead.externalId && (
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">External ID</span>
                  <span className="text-sm font-mono text-gray-900 truncate max-w-[150px]">
                    {lead.externalId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dates Section */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Created
                </span>
                <span className="text-sm text-gray-900">{formatDate(lead.createdAt)}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Updated
                </span>
                <span className="text-sm text-gray-900">{formatDate(lead.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Action History Section */}
          {lead.leadActions && lead.leadActions.length > 0 && (
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Action History</h3>
              <div className="space-y-4">
                {lead.leadActions.map((action, index) => (
                  <div key={action.id} className="relative">
                    {/* Timeline connector */}
                    {index < lead.leadActions.length - 1 && (
                      <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-200" />
                    )}

                    {/* Timeline dot */}
                    <div className="flex items-start gap-3">
                      <div className="relative z-10 mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-100" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {getActionDescription(action)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(action.createdAt)} by {action.createdBy}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State for Actions */}
          {(!lead.leadActions || lead.leadActions.length === 0) && (
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Action History</h3>
              <p className="text-sm text-gray-500 italic">No actions yet</p>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0 bg-gray-50 space-y-2">
          <button
            onClick={() => onAction('QUOTE', lead.id)}
            className="w-full px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Quote
          </button>
          <button
            onClick={() => onAction('CALLBACK', lead.id)}
            className="w-full px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Schedule Callback
          </button>
          <button
            onClick={() => onAction('REFUSE', lead.id)}
            className="w-full px-4 py-2.5 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors"
          >
            Refuse Lead
          </button>
        </div>
      </div>
    </>
  )
}
