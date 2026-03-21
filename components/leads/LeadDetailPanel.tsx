'use client'

import { Lead, ProductType } from '@/lib/types'
import StatusBadge from './StatusBadge'

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

function getActionDescription(action: Record<string, any>): string {
  const baseLabel = actionTypeLabels[action.type] || action.type

  switch (action.type) {
    case 'REFUSED':
      return `${baseLabel} - ${refusalReasonLabels[action.refusalReason as string] || 'No reason'}`
    case 'QUOTE_CREATED':
      return `${baseLabel} - ${productLabels[action.quotedProduct as ProductType] || 'Unknown product'}`
    case 'CALLBACK_SCHEDULED':
      return `${baseLabel} - ${formatDate(action.callbackDate as string)}`
    case 'NOTE_ADDED':
      return `${baseLabel} - "${action.note as string}"`
    default:
      return baseLabel
  }
}

const CloseIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const MailIcon = () => (
  <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const TagIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
)

const FileTextIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

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
        className={`fixed right-0 top-0 h-screen w-full md:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {lead.firstName} {lead.lastName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close panel"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Status Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</span>
              <StatusBadge status={lead.status} size="md" />
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Contact Details</h3>
            <div className="space-y-3">
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="flex items-center gap-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
                >
                  <MailIcon />
                  <span className="truncate">{lead.email}</span>
                </a>
              )}
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
                >
                  <PhoneIcon />
                  <span>{lead.phone}</span>
                </a>
              )}
              {!lead.email && !lead.phone && (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No contact details available</p>
              )}
            </div>
          </div>

          {/* Lead Information Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Information</h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <TagIcon />
                  Product
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {productLabels[lead.productInterest]}
                </span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <FileTextIcon />
                  Source
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {lead.source === 'API_EXTERNAL' ? 'External API' : 'Manual'}
                </span>
              </div>
              {lead.externalId && (
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">External ID</span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white truncate max-w-[150px]">
                    {lead.externalId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Dates Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <ClockIcon />
                  Created
                </span>
                <span className="text-sm text-gray-900 dark:text-white">{formatDate(lead.createdAt)}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <CalendarIcon />
                  Updated
                </span>
                <span className="text-sm text-gray-900 dark:text-white">{formatDate(lead.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Action History Section */}
          {lead.leadActions && lead.leadActions.length > 0 && (
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Action History</h3>
              <div className="space-y-4">
                {lead.leadActions.map((action, index) => (
                  <div key={action.id} className="relative">
                    {/* Timeline connector */}
                    {index < lead.leadActions.length - 1 && (
                      <div className="absolute left-4 top-8 w-0.5 h-6 bg-gray-200 dark:bg-gray-700" />
                    )}

                    {/* Timeline dot */}
                    <div className="flex items-start gap-3">
                      <div className="relative z-10 mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 ring-2 ring-blue-100 dark:ring-blue-900" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {getActionDescription(action)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Action History</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">No actions yet</p>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0 bg-gray-50 dark:bg-gray-800 space-y-2">
          <button
            onClick={() => onAction('QUOTE', lead.id)}
            className="w-full px-4 py-2.5 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            Create Quote
          </button>
          <button
            onClick={() => onAction('CALLBACK', lead.id)}
            className="w-full px-4 py-2.5 bg-green-600 dark:bg-green-700 text-white font-medium rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
          >
            Schedule Callback
          </button>
          <button
            onClick={() => onAction('REFUSE', lead.id)}
            className="w-full px-4 py-2.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            Refuse Lead
          </button>
        </div>
      </div>
    </>
  )
}
